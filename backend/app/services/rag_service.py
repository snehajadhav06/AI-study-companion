import os
import re
import time
import fitz
import numpy as np
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sentence_transformers import SentenceTransformer
from app.core.config import settings
from app.database.connection import SessionLocal
from app.models.models import DocumentChunk


class SimpleVectorStore:
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.cache = {}

    def get_embeddings(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.array([], dtype=np.float32)
        return self.model.encode(texts, convert_to_numpy=True)

    def search(self, query: str, chunks: List[DocumentChunk], top_k: int = 5, db: Optional[Session] = None) -> List[Dict[str, Any]]:
        if not chunks:
            return []

        query_vector = self.model.encode([query], convert_to_numpy=True)[0]
        chunk_embeddings = []
        chunks_to_update = []

        for chunk in chunks:
            if chunk.embedding is not None:
                emb = np.frombuffer(chunk.embedding, dtype=np.float32)
            else:
                emb = self.model.encode([chunk.content], convert_to_numpy=True)[0]
                chunk.embedding = emb.astype(np.float32).tobytes()
                chunks_to_update.append(chunk)
            chunk_embeddings.append(emb)

        if chunks_to_update and db:
            try:
                db.commit()
            except Exception as e:
                print(f"Error caching fallback embeddings: {e}")

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
        seen = set()
        for score, chunk in scores[: top_k * 2]:
            content = re.sub(r"\s+", " ", chunk.content).strip()
            if not content or content in seen:
                continue
            seen.add(content)
            results.append({
                "score": score,
                "content": content,
                "page_number": chunk.page_number,
                "chunk_index": chunk.chunk_index,
            })
            if len(results) >= top_k:
                break
        return results


vector_store = SimpleVectorStore()


def extract_text_from_pdf(file_path: str) -> List[Dict[str, Any]]:
    start = time.perf_counter()
    doc = fitz.open(file_path)
    pages_content = []
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        text = page.get_text()
        if text.strip():
            pages_content.append({
                "page_number": page_num + 1,
                "text": text,
            })
    elapsed_ms = round((time.perf_counter() - start) * 1000, 1)
    print(f"PDF Extraction: {elapsed_ms}ms")
    return pages_content


def chunk_text(pages: List[Dict[str, Any]], chunk_size: int = 700, chunk_overlap: int = 120) -> List[Dict[str, Any]]:
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
                    "chunk_index": chunk_index,
                })
                chunk_index += 1

                overlap_words = current_chunk_words[-max(1, len(current_chunk_words) // 5):]
                current_chunk_words = list(overlap_words)
                current_length = sum(len(w) + 1 for w in current_chunk_words)

        if current_chunk_words:
            chunk_text = " ".join(current_chunk_words)
            chunks.append({
                "content": chunk_text,
                "page_number": page_num,
                "chunk_index": chunk_index,
            })
            chunk_index += 1

    return chunks


def process_and_index_document(file_path: str, document_id: int) -> None:
    start = time.perf_counter()
    pages = extract_text_from_pdf(file_path)
    chunks_data = chunk_text(pages)

    db = SessionLocal()
    try:
        texts = [c["content"] for c in chunks_data]
        embeddings = vector_store.get_embeddings(texts) if texts else []

        for i, c in enumerate(chunks_data):
            emb_bytes = embeddings[i].astype(np.float32).tobytes() if i < len(embeddings) else None
            chunk_model = DocumentChunk(
                document_id=document_id,
                content=c["content"],
                page_number=c["page_number"],
                chunk_index=c["chunk_index"],
                embedding=emb_bytes,
            )
            db.add(chunk_model)
        db.commit()
    finally:
        db.close()

    elapsed_ms = round((time.perf_counter() - start) * 1000, 1)
    print(f"Document Indexing Total: {elapsed_ms}ms")
