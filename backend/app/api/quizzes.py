import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.models.models import User, Quiz, QuizAttempt, Document, DocumentChunk
from app.schemas.schemas import QuizCreateRequest, QuizResponse, QuizAttemptCreate, QuizAttemptResponse
from app.api.deps import get_current_user
from app.services.llm_service import llm_service

router = APIRouter()

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
        
    chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == request.document_id).order_by(DocumentChunk.chunk_index.asc()).limit(8).all()
    if not chunks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No content indexed in document yet."
        )
        
    combined_text = "\n".join([c.content for c in chunks])
    questions = await llm_service.generate_quiz(combined_text, request.num_questions, request.difficulty)
    
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate quiz questions"
        )
        
    db_quiz = Quiz(
        user_id=current_user.id,
        document_id=request.document_id,
        title=f"Quiz on {doc.filename}",
        questions_json=json.dumps(questions)
    )
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    
    return QuizResponse(
        id=db_quiz.id,
        document_id=db_quiz.document_id,
        title=db_quiz.title,
        questions=questions,
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
        results.append(QuizResponse(
            id=q.id,
            document_id=q.document_id,
            title=q.title,
            questions=json.loads(q.questions_json),
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
    return QuizResponse(
        id=q.id,
        document_id=q.document_id,
        title=q.title,
        questions=json.loads(q.questions_json),
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
        
    questions = json.loads(q.questions_json)
    user_answers = attempt.answers
    
    correct_count = 0
    total_questions = len(questions)
    
    for i, q_item in enumerate(questions):
        if i < len(user_answers):
            user_ans = str(user_answers[i]).strip().lower()
            correct_ans = str(q_item.get("correct_answer")).strip().lower()
            if user_ans == correct_ans:
                correct_count += 1
                
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
    
    return db_attempt
