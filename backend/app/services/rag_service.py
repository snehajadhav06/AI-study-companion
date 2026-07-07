import os
import fitz
import numpy as np
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from app.core.config import settings
from app.database.connection import SessionLocal
from app.models.models import DocumentChunk

class SimpleVectorStore:
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.cache = {}

    def get_embeddings(self, texts: List[str]) -> np.ndarray:
        return self.model.encode(texts, convert_to_numpy=True)

    def search(self, query: str, chunks: List[DocumentChunk], top_k: int = 5) -> List[Dict[str, Any]]:
        if not chunks:
            return []
        
        query_vector = self.model.encode([query], convert_to_numpy=True)[0]
        
        chunk_texts = [c.content for c in chunks]
        chunk_embeddings = self.get_embeddings(chunk_texts)
        
        scores = []
        for i, emb in enumerate(chunk_embeddings):
            norm_q = np.linalg.norm(query_vector)
            norm_e = np.linalg.norm(emb)
            if norm_q == 0 or norm_e == 0:
                score = 0.0
            else:
                score = float(np.dot(query_vector, emb) / (norm_q * norm_e))
            scores.append((score, chunks[i]))
        
        scores.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, chunk in scores[:top_k]:
            results.append({
                "score": score,
                "content": chunk.content,
                "page_number": chunk.page_number,
                "chunk_index": chunk.chunk_index
            })
        return results

vector_store = SimpleVectorStore()

def extract_text_from_pdf(file_path: str) -> List[Dict[str, Any]]:
    doc = fitz.open(file_path)
    pages_content = []
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        text = page.get_text()
        if text.strip():
            pages_content.append({
                "page_number": page_num + 1,
                "text": text
            })
    return pages_content

def chunk_text(pages: List[Dict[str, Any]], chunk_size: int = 1000, chunk_overlap: int = 200) -> List[Dict[str, Any]]:
    chunks = []
    chunk_index = 0
    for page in pages:
        text = page["text"]
        page_num = page["page_number"]
        
        words = text.split()
        current_chunk_words = []
        current_length = 0
        
        for word in words:
            current_chunk_words.append(word)
            current_length += len(word) + 1
            if current_length >= chunk_size:
                chunk_text = " ".join(current_chunk_words)
                chunks.append({
                    "content": chunk_text,
                    "page_number": page_num,
                    "chunk_index": chunk_index
                })
                chunk_index += 1
                
                overlap_words = current_chunk_words[-(len(current_chunk_words)//4):]
                current_chunk_words = list(overlap_words)
                current_length = sum(len(w) + 1 for w in current_chunk_words)
                
        if current_chunk_words:
            chunk_text = " ".join(current_chunk_words)
            chunks.append({
                "content": chunk_text,
                "page_number": page_num,
                "chunk_index": chunk_index
            })
            chunk_index += 1
            
    return chunks

def process_and_index_document(file_path: str, document_id: int) -> None:
    pages = extract_text_from_pdf(file_path)
    chunks_data = chunk_text(pages)
    
    db = SessionLocal()
    try:
        for c in chunks_data:
            chunk_model = DocumentChunk(
                document_id=document_id,
                content=c["content"],
                page_number=c["page_number"],
                chunk_index=c["chunk_index"]
            )
            db.add(chunk_model)
        db.commit()
    finally:
        db.close()
