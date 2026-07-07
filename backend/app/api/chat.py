import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.models.models import User, ChatMessage, DocumentChunk, Document
from app.schemas.schemas import ChatRequest, ChatResponse, ChatMessageResponse, Citation
from app.api.deps import get_current_user
from app.services.rag_service import vector_store
from app.services.llm_service import llm_service

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat_interaction(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chunks = []
    if request.document_id:
        doc = db.query(Document).filter(Document.id == request.document_id, Document.user_id == current_user.id).first()
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == request.document_id).all()
    else:
        user_doc_ids = [d.id for d in db.query(Document.id).filter(Document.user_id == current_user.id).all()]
        if user_doc_ids:
            chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id.in_(user_doc_ids)).all()
            
    if not chunks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No study materials available. Please upload a PDF first."
        )
        
    search_results = vector_store.search(request.question, chunks, top_k=4)
    
    context_str = "\n\n".join([f"[Page {r['page_number']}]: {r['content']}" for r in search_results])
    
    history_messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id,
        ChatMessage.document_id == request.document_id
    ).order_by(ChatMessage.created_at.desc()).limit(6).all()
    
    history_messages.reverse()
    formatted_history = [{"role": msg.role, "content": msg.content} for msg in history_messages]
    
    ai_answer = await llm_service.generate_rag_answer(request.question, context_str, formatted_history)
    
    citations = [
        Citation(content=res["content"], page=res["page_number"])
        for res in search_results
    ]
    
    user_msg = ChatMessage(
        user_id=current_user.id,
        document_id=request.document_id,
        role="user",
        content=request.question
    )
    
    db.add(user_msg)
    
    citations_json = json.dumps([c.dict() for c in citations])
    ai_msg = ChatMessage(
        user_id=current_user.id,
        document_id=request.document_id,
        role="assistant",
        content=ai_answer,
        citations=citations_json
    )
    
    db.add(ai_msg)
    db.commit()
    
    return ChatResponse(answer=ai_answer, citations=citations)

@router.get("/history", response_model=List[ChatMessageResponse])
def get_chat_history(
    document_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id)
    if document_id:
        query = query.filter(ChatMessage.document_id == document_id)
    return query.order_by(ChatMessage.created_at.asc()).all()
