import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.models.models import User, Flashcard, Document, DocumentChunk
from app.schemas.schemas import FlashcardCreateRequest, FlashcardResponse, FlashcardReviewRequest
from app.api.deps import get_current_user
from app.services.llm_service import llm_service

router = APIRouter()

@router.post("/generate", response_model=List[FlashcardResponse], status_code=status.HTTP_201_CREATED)
async def generate_cards(
    request: FlashcardCreateRequest,
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
    cards_data = await llm_service.generate_flashcards(combined_text, request.num_cards)
    
    created_cards = []
    for card in cards_data:
        db_card = Flashcard(
            user_id=current_user.id,
            document_id=request.document_id,
            front=card.get("front", "Question"),
            back=card.get("back", "Answer"),
            difficulty=card.get("difficulty", "medium"),
            topic=card.get("topic", "General"),
            box=1
        )
        db.add(db_card)
        created_cards.append(db_card)
        
    db.commit()
    
    for card in created_cards:
        db.refresh(card)
        
    return created_cards

@router.get("/", response_model=List[FlashcardResponse])
def list_flashcards(
    document_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Flashcard).filter(Flashcard.user_id == current_user.id)
    if document_id:
        query = query.filter(Flashcard.document_id == document_id)
    return query.all()

@router.post("/{card_id}/review", response_model=FlashcardResponse)
def review_card(
    card_id: int,
    request: FlashcardReviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    card = db.query(Flashcard).filter(Flashcard.id == card_id, Flashcard.user_id == current_user.id).first()
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
        
    card.last_reviewed = datetime.datetime.utcnow()
    
    if request.difficulty == "easy":
        card.box = min(5, card.box + 1)
    elif request.difficulty == "hard":
        card.box = max(1, card.box - 1)
        
    db.commit()
    db.refresh(card)
    
    current_user.flashcards_completed = (current_user.streak_count or 0)
    db.commit()
    
    return card
