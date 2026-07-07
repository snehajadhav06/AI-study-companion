from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.connection import get_db
from app.models.models import User, Document, Flashcard, QuizAttempt, Quiz
from app.schemas.schemas import DashboardStats
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_docs = db.query(Document).filter(Document.user_id == current_user.id).count()
    
    streak = current_user.streak_count
    
    attempts_count = current_user.quiz_attempts_count
    avg_accuracy = (current_user.quiz_accuracy_sum / attempts_count) if attempts_count > 0 else 0.0
    
    completed_flashcards = db.query(Flashcard).filter(
        Flashcard.user_id == current_user.id,
        Flashcard.box > 1
    ).count()
    
    weak_flashcards = db.query(Flashcard.topic).filter(
        Flashcard.user_id == current_user.id,
        Flashcard.box == 1
    ).distinct().limit(3).all()
    weak_topics = [item[0] for item in weak_flashcards]
    if not weak_topics:
        weak_topics = ["None identified yet"]
        
    recent_activity = []
    
    docs = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.created_at.desc()).limit(3).all()
    for d in docs:
        recent_activity.append({
            "type": "upload",
            "message": f"Uploaded document: {d.filename}",
            "date": d.created_at.isoformat()
        })
        
    attempts = db.query(QuizAttempt).join(Quiz).filter(Quiz.user_id == current_user.id).order_by(QuizAttempt.created_at.desc()).limit(3).all()
    for a in attempts:
        recent_activity.append({
            "type": "quiz",
            "message": f"Scored {a.score}/{a.total_questions} on quiz: {a.quiz.title}",
            "date": a.created_at.isoformat()
        })
        
    recent_activity.sort(key=lambda x: x["date"], reverse=True)
    recent_activity = recent_activity[:5]
    
    recommendations = []
    if total_docs == 0:
        recommendations.append("Upload your first lecture notes or textbook to start studying.")
    else:
        recommendations.append("Generate flashcards for your latest uploaded notes.")
        
    if avg_accuracy < 70 and attempts_count > 0:
        recommendations.append("Re-read the textbook chapters and take another practice quiz.")
        
    if streak > 0:
        recommendations.append(f"Keep up your {streak}-day streak! Learn at least one new topic today.")
    else:
        recommendations.append("Start a daily study habit to build your study streak.")
        
    import datetime
    today = datetime.datetime.utcnow().date()
    seven_days_ago = today - datetime.timedelta(days=6)
    start_datetime = datetime.datetime.combine(seven_days_ago, datetime.time.min)

    doc_dates = db.query(Document.created_at).filter(
        Document.user_id == current_user.id,
        Document.created_at >= start_datetime
    ).all()

    quiz_dates = db.query(QuizAttempt.created_at).filter(
        QuizAttempt.user_id == current_user.id,
        QuizAttempt.created_at >= start_datetime
    ).all()

    card_dates = db.query(Flashcard.last_reviewed).filter(
        Flashcard.user_id == current_user.id,
        Flashcard.last_reviewed >= start_datetime
    ).all()

    docs_by_day = {}
    quizzes_by_day = {}
    cards_by_day = {}

    for (d_at,) in doc_dates:
        if d_at:
            d_date = d_at.date()
            docs_by_day[d_date] = docs_by_day.get(d_date, 0) + 1

    for (q_at,) in quiz_dates:
        if q_at:
            q_date = q_at.date()
            quizzes_by_day[q_date] = quizzes_by_day.get(q_date, 0) + 1

    for (c_at,) in card_dates:
        if c_at:
            c_date = c_at.date()
            cards_by_day[c_date] = cards_by_day.get(c_date, 0) + 1

    study_hours_history = []
    for i in range(6, -1, -1):
        day = today - datetime.timedelta(days=i)
        docs_count = docs_by_day.get(day, 0)
        quizzes_count = quizzes_by_day.get(day, 0)
        cards_count = cards_by_day.get(day, 0)

        hours = round((docs_count * 0.5) + (quizzes_count * 0.4) + (cards_count * 0.05), 2)
        if hours == 0.0 and i == 0 and streak > 0:
            hours = 0.5
        study_hours_history.append(hours)

    return DashboardStats(
        total_documents=total_docs,
        study_streak=streak,
        quiz_accuracy=avg_accuracy,
        flashcards_completed=completed_flashcards,
        weak_topics=weak_topics,
        recent_activity=recent_activity,
        ai_recommendations=recommendations,
        study_hours_history=study_hours_history
    )
