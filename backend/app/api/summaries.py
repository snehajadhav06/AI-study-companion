from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.models.models import User, Summary, Document, DocumentChunk
from app.schemas.schemas import SummaryCreateRequest, SummaryResponse
from app.api.deps import get_current_user
from app.services.llm_service import llm_service

router = APIRouter()

@router.post("/generate", response_model=SummaryResponse, status_code=status.HTTP_201_CREATED)
async def generate_document_summary(
    request: SummaryCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == request.document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
        
    chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == request.document_id).order_by(DocumentChunk.chunk_index.asc()).limit(10).all()
    if not chunks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No content found in document. Please wait for indexing to complete."
        )
        
    combined_text = "\n".join([c.content for c in chunks])
    
    summary_data = await llm_service.generate_summary(combined_text, request.detail_level)
    
    formatted_content = f"### Key Takeaways\n"
    for kt in summary_data.get("key_takeaways", []):
        formatted_content += f"- {kt}\n"
        
    if summary_data.get("important_formulas"):
        formatted_content += f"\n### Important Formulas\n"
        for formula in summary_data.get("important_formulas", []):
            formatted_content += f"- `{formula}`\n"
            
    formatted_content += f"\n### Revision Notes\n{summary_data.get('revision_notes', '')}"
    
    db_summary = Summary(
        user_id=current_user.id,
        document_id=request.document_id,
        title=summary_data.get("title", f"Summary of {doc.filename}"),
        content=formatted_content
    )
    
    db.add(db_summary)
    db.commit()
    db.refresh(db_summary)
    
    return db_summary

@router.get("/", response_model=List[SummaryResponse])
def list_summaries(
    document_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Summary).filter(Summary.user_id == current_user.id)
    if document_id:
        query = query.filter(Summary.document_id == document_id)
    return query.all()

@router.get("/{summary_id}", response_model=SummaryResponse)
def get_summary(
    summary_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    summary = db.query(Summary).filter(Summary.id == summary_id, Summary.user_id == current_user.id).first()
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Summary not found"
        )
    return summary
