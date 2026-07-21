import json
import re
import time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.models.models import User, Quiz, QuizAttempt, Document, DocumentChunk
from app.schemas.schemas import QuizCreateRequest, QuizResponse, QuizAttemptCreate, QuizAttemptResponse
from app.api.deps import get_current_user
from app.services.llm_service import llm_service
from app.services.rag_service import vector_store

router = APIRouter()


def _normalize_text(value) -> str:
    if value is None:
        return ""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return str(value).strip().lower()
    text = str(value).strip()
    return re.sub(r"\s+", " ", text).lower()


def _normalize_answer_value(question: dict, value) -> str:
    normalized_value = _normalize_text(value)

    if question.get("type") == "tf":
        truthy_values = {"true", "t", "yes", "y"}
        falsey_values = {"false", "f", "no", "n"}
        if normalized_value in truthy_values:
            return "true"
        if normalized_value in falsey_values:
            return "false"
        return normalized_value

    if not normalized_value:
        return ""

    options = question.get("options") or []
    if normalized_value.startswith("option "):
        normalized_value = normalized_value.replace("option ", "", 1)

    if normalized_value and re.fullmatch(r"[a-z]", normalized_value):
        return normalized_value

    if normalized_value.isdigit():
        index = int(normalized_value) - 1
        if 0 <= index < len(options):
            return _normalize_text(options[index])
        return normalized_value

    if len(normalized_value) == 1 and normalized_value.isalpha():
        return normalized_value

    if options:
        normalized_options = {_normalize_text(option): option for option in options}
        if normalized_value in normalized_options:
            return _normalize_text(normalized_options[normalized_value])

        for option in options:
            option_text = _normalize_text(option)
            if option_text.startswith(normalized_value):
                return option_text

    return normalized_value


def _get_correct_answer(question: dict):
    for key in ("correct_answer", "correctAnswer", "correct"):
        value = question.get(key)
        if value not in (None, ""):
            return value
    return None


def normalize_question(question: dict) -> dict:
    normalized_question = dict(question)
    correct_answer = _get_correct_answer(question)
    if correct_answer is not None:
        normalized_question["correct_answer"] = correct_answer
    else:
        normalized_question["correct_answer"] = ""
    return normalized_question


def score_quiz_attempt(questions: List[dict], user_answers: List[object]):
    normalized_questions = [normalize_question(question) for question in questions]
    details = []
    correct_count = 0

    for index, question in enumerate(normalized_questions):
        selected_answer = user_answers[index] if index < len(user_answers) else ""
        correct_answer = _get_correct_answer(question)

        normalized_selected = _normalize_answer_value(question, selected_answer)
        normalized_correct = _normalize_answer_value(question, correct_answer)
        is_correct = bool(normalized_selected) and normalized_selected == normalized_correct

        if is_correct:
            correct_count += 1

        details.append({
            "question_id": question.get("id"),
            "selected_answer": selected_answer,
            "correct_answer": correct_answer,
            "selected_answer_normalized": normalized_selected,
            "correct_answer_normalized": normalized_correct,
            "match": is_correct,
            "is_correct": is_correct,
            "type": question.get("type"),
            "explanation": question.get("explanation", ""),
        })

    total_questions = len(normalized_questions)
    return correct_count, total_questions, details

@router.post("/generate", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
async def generate_quiz(
    request: QuizCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == request.document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
        
    chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == request.document_id).order_by(DocumentChunk.chunk_index.asc()).all()
    if not chunks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No content indexed in document yet."
        )

    retrieval_started = time.perf_counter()
    retrieval_context = vector_store.search(doc.filename, chunks, top_k=5, db=db)
    retrieval_elapsed_ms = round((time.perf_counter() - retrieval_started) * 1000, 1)
    print(f"Vector Search: {retrieval_elapsed_ms}ms")

    context_chunks = [item["content"] for item in retrieval_context]
    if not context_chunks:
        context_chunks = [chunk.content for chunk in chunks[:3]]

    combined_text = "\n".join(context_chunks)
    prompt_started = time.perf_counter()
    questions = await llm_service.generate_quiz(combined_text, request.num_questions, request.difficulty)
    prompt_elapsed_ms = round((time.perf_counter() - prompt_started) * 1000, 1)
    print(f"LLM Generation: {prompt_elapsed_ms}ms")
    
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate quiz questions"
        )

    normalized_questions = [normalize_question(question) for question in questions]
    
    db_quiz = Quiz(
        user_id=current_user.id,
        document_id=request.document_id,
        title=f"Quiz on {doc.filename}",
        questions_json=json.dumps(normalized_questions)
    )
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    
    return QuizResponse(
        id=db_quiz.id,
        document_id=db_quiz.document_id,
        title=db_quiz.title,
        questions=normalized_questions,
        created_at=db_quiz.created_at
    )

@router.get("/", response_model=List[QuizResponse])
def list_quizzes(
    document_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quizzes = db.query(Quiz).filter(Quiz.user_id == current_user.id)
    if document_id:
        quizzes = quizzes.filter(Quiz.document_id == document_id)
        
    results = []
    for q in quizzes.all():
        questions = [normalize_question(question) for question in json.loads(q.questions_json)]
        results.append(QuizResponse(
            id=q.id,
            document_id=q.document_id,
            title=q.title,
            questions=questions,
            created_at=q.created_at
        ))
    return results

@router.get("/{quiz_id}", response_model=QuizResponse)
def get_quiz(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    q = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.user_id == current_user.id).first()
    if not q:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    questions = [normalize_question(question) for question in json.loads(q.questions_json)]
    return QuizResponse(
        id=q.id,
        document_id=q.document_id,
        title=q.title,
        questions=questions,
        created_at=q.created_at
    )

@router.post("/{quiz_id}/submit", response_model=QuizAttemptResponse)
def submit_quiz_attempt(
    quiz_id: int,
    attempt: QuizAttemptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    q = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.user_id == current_user.id).first()
    if not q:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
        
    questions = [normalize_question(question) for question in json.loads(q.questions_json)]
    user_answers = attempt.answers

    started_at = time.perf_counter()
    correct_count, total_questions, review_details = score_quiz_attempt(questions, user_answers)
    time_taken_seconds = round(time.perf_counter() - started_at, 2)
    incorrect_count = total_questions - correct_count
    accuracy = (correct_count / total_questions) * 100 if total_questions > 0 else 0.0
    
    current_user.quiz_attempts_count += 1
    current_user.quiz_accuracy_sum += accuracy
    
    db_attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=q.id,
        score=correct_count,
        total_questions=total_questions,
        answers_json=json.dumps(user_answers)
    )
    
    db.add(db_attempt)
    db.commit()
    db.refresh(db_attempt)
    
    return QuizAttemptResponse(
        id=db_attempt.id,
        quiz_id=db_attempt.quiz_id,
        score=db_attempt.score,
        total_questions=db_attempt.total_questions,
        answers_json=db_attempt.answers_json,
        correct_answers=correct_count,
        incorrect_answers=incorrect_count,
        time_taken_seconds=time_taken_seconds,
        review_details=review_details,
        created_at=db_attempt.created_at,
    )
