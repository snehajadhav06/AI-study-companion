import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.models import Document, User
from app.schemas.schemas import DocumentResponse
from app.api.deps import get_current_user
from app.core.config import settings
from app.services.rag_service import process_and_index_document, SUPPORTED_EXTENSIONS

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
