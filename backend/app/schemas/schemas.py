from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str]
    created_at: datetime
    streak_count: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_size: int
    created_at: datetime

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    question: str
    document_id: Optional[int] = None

class Citation(BaseModel):
    content: str
    page: int

class ChatResponse(BaseModel):
    answer: str
    citations: List[Citation]

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    citations: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SummaryCreateRequest(BaseModel):
    document_id: int
    detail_level: str = "medium"

class SummaryResponse(BaseModel):
    id: int
    document_id: Optional[int]
    title: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class FlashcardCreateRequest(BaseModel):
    document_id: int
    num_cards: int = 5

class FlashcardResponse(BaseModel):
    id: int
    document_id: Optional[int]
    front: str
    back: str
    difficulty: str
    topic: str
    box: int

    class Config:
        from_attributes = True

class FlashcardReviewRequest(BaseModel):
    difficulty: str

class QuizCreateRequest(BaseModel):
    document_id: int
    num_questions: int = 5
    difficulty: str = "medium"

class QuizResponse(BaseModel):
    id: int
    document_id: Optional[int]
    title: str
    questions: List[Any]
    created_at: datetime

    class Config:
        from_attributes = True

class QuizAttemptCreate(BaseModel):
    answers: List[Any]

class QuizAttemptResponse(BaseModel):
    id: int
    quiz_id: int
    score: int
    total_questions: int
    answers_json: str
    correct_answers: int
    incorrect_answers: int
    time_taken_seconds: Optional[float] = None
    review_details: Optional[List[Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class StudyPlanCreateRequest(BaseModel):
    subjects: List[str]
    hours_per_day: float
    target_date: str

class StudyPlanResponse(BaseModel):
    id: int
    title: str
    plan_json: str
    hours_per_week: int
    created_at: datetime

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_documents: int
    study_streak: int
    quiz_accuracy: float
    flashcards_completed: int
    weak_topics: List[str]
    recent_activity: List[Any]
    ai_recommendations: List[str]
    study_hours_history: List[float]
