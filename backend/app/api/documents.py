import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.models import Document, User, ModerationLog
from app.schemas.schemas import DocumentResponse
from app.api.deps import get_current_user
from app.core.config import settings
from app.services.rag_service import process_and_index_document, SUPPORTED_EXTENSIONS
from app.services.content_moderation import check_document_safety

router = APIRouter()

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file_ext = os.path.splitext(file.filename.lower())[1]
    if file_ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed types: {', '.join(SUPPORTED_EXTENSIONS)}"
        )
    
    os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOADS_DIR, f"{current_user.id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_size = os.path.getsize(file_path)
    
    # Perform content safety check on extracted text
    is_safe, reason, category = await check_document_safety(file_path)
    if not is_safe:
        # Create a moderation log
        log_entry = ModerationLog(
            filename=file.filename,
            reason=reason,
            category_detected=category
        )
        db.add(log_entry)
        db.commit()
        
        # Delete the unsafe file from filesystem
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
                
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This document cannot be uploaded because it contains content that violates the platform's educational content policy."
        )
    
    db_document = Document(
        filename=file.filename,
        file_path=file_path,
        user_id=current_user.id,
        file_size=file_size
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    background_tasks.add_task(process_and_index_document, file_path, db_document.id)
    
    return db_document

@router.get("/", response_model=List[DocumentResponse])
def list_documents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Document).filter(Document.user_id == current_user.id).all()

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass
            
    db.delete(doc)
    db.commit()
    return None

@router.get("/moderation/logs")
def get_moderation_logs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(ModerationLog).order_by(ModerationLog.timestamp.desc()).all()
    total_safe = db.query(Document).count()
    total_blocked = len(logs)
    
    total_attempts = total_safe + total_blocked
    safety_score = 100
    if total_attempts > 0:
        safety_score = round((total_safe / total_attempts) * 100)
        
    return {
        "logs": [
            {
                "id": log.id,
                "timestamp": log.timestamp.isoformat(),
                "filename": log.filename,
                "reason": log.reason,
                "category_detected": log.category_detected
            } for log in logs
        ],
        "total_safe": total_safe,
        "total_blocked": total_blocked,
        "safety_score": safety_score
    }
