"""Unit tests for app.services.rag_service — chunking, embedding, and search.

These bypass the API layer and test the RAG building blocks directly,
using the deterministic fake SentenceTransformer set up in conftest.py.
"""
from app.database.connection import SessionLocal
from app.models.models import Document, DocumentChunk, User
from app.services.rag_service import SimpleVectorStore, chunk_text, process_and_index_document


def test_chunk_text_splits_long_page_into_multiple_chunks():
    pages = [{"page_number": 1, "text": "word " * 500}]

    chunks = chunk_text(pages, chunk_size=200, chunk_overlap=50)

    assert len(chunks) > 1
    assert all(c["page_number"] == 1 for c in chunks)
    assert [c["chunk_index"] for c in chunks] == list(range(len(chunks)))


def test_chunk_text_keeps_short_page_as_single_chunk():
    pages = [{"page_number": 3, "text": "A short paragraph about photosynthesis."}]

    chunks = chunk_text(pages, chunk_size=1000, chunk_overlap=200)

    assert len(chunks) == 1
    assert chunks[0]["page_number"] == 3
    assert "photosynthesis" in chunks[0]["content"]


def test_chunk_text_handles_multiple_pages_independently():
    pages = [
        {"page_number": 1, "text": "Page one content about algebra."},
        {"page_number": 2, "text": "Page two content about geometry."},
    ]

    chunks = chunk_text(pages, chunk_size=1000, chunk_overlap=200)

    assert {c["page_number"] for c in chunks} == {1, 2}


def test_vector_store_search_ranks_matching_chunk_first():
    store = SimpleVectorStore()

    matching_text = "The mitochondria is the powerhouse of the cell."
    unrelated_text = "Shakespeare wrote many famous plays while living in London."

    chunks = [
        DocumentChunk(id=1, document_id=1, content=unrelated_text, page_number=2, chunk_index=1),
        DocumentChunk(id=2, document_id=1, content=matching_text, page_number=1, chunk_index=0),
    ]

    results = store.search(matching_text, chunks, top_k=2)

    assert results[0]["content"] == matching_text
    assert results[0]["page_number"] == 1
    assert results[0]["score"] > results[1]["score"]


def test_vector_store_search_returns_empty_list_for_no_chunks():
    store = SimpleVectorStore()

    assert store.search("anything at all", [], top_k=3) == []


def test_vector_store_search_respects_top_k():
    store = SimpleVectorStore()
    chunks = [
        DocumentChunk(id=i, document_id=1, content=f"Chunk number {i} about topic {i}", page_number=1, chunk_index=i)
        for i in range(5)
    ]

    results = store.search("topic 2", chunks, top_k=2)

    assert len(results) == 2


def test_process_and_index_document_creates_chunks_with_embeddings(tmp_path):
    import fitz

    pdf_path = tmp_path / "sample.pdf"
    pdf_doc = fitz.open()
    page = pdf_doc.new_page()
    page.insert_text((72, 72), "Newton's second law states that force equals mass times acceleration.")
    pdf_doc.save(str(pdf_path))
    pdf_doc.close()

    db = SessionLocal()
    try:
        user = User(email="physics@example.com", hashed_password="not-a-real-hash", full_name="Test User")
        db.add(user)
        db.commit()
        db.refresh(user)

        document = Document(filename="sample.pdf", file_path=str(pdf_path), user_id=user.id, file_size=100)
        db.add(document)
        db.commit()
        db.refresh(document)
        document_id = document.id
    finally:
        db.close()

    process_and_index_document(str(pdf_path), document_id)

    db = SessionLocal()
    try:
        chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).all()
        assert len(chunks) >= 1
        assert chunks[0].embedding is not None
        assert "Newton" in chunks[0].content
    finally:
        db.close()