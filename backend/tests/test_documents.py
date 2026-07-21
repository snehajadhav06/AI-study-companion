"""Tests for /api/documents — upload, listing, ownership, and deletion.

Uploading a real PDF also exercises the background indexing task
(`process_and_index_document`), since Starlette's TestClient runs
BackgroundTasks synchronously before the test continues. That gives us
end-to-end coverage of PDF text extraction -> chunking -> embedding
storage without mocking anything in the RAG pipeline itself.
"""
from app.core.config import settings
from app.database.connection import SessionLocal
from app.models.models import DocumentChunk


def test_upload_rejects_non_pdf(auth_client):
    response = auth_client.post(
        "/api/documents/upload",
        files={"file": ("notes.txt", b"hello world", "text/plain")},
    )

    assert response.status_code == 400
    assert "Only PDF files" in response.json()["detail"]


def test_upload_requires_authentication(client):
    response = client.post(
        "/api/documents/upload",
        files={"file": ("notes.pdf", b"%PDF-1.4 fake", "application/pdf")},
    )

    assert response.status_code == 401


def test_upload_returns_document_metadata(auth_client, sample_pdf_bytes, tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "UPLOADS_DIR", str(tmp_path))

    response = auth_client.post(
        "/api/documents/upload",
        files={"file": ("biology.pdf", sample_pdf_bytes, "application/pdf")},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["filename"] == "biology.pdf"
    assert body["file_size"] > 0


def test_upload_indexes_chunks_with_embeddings(auth_client, sample_pdf_bytes, tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "UPLOADS_DIR", str(tmp_path))

    response = auth_client.post(
        "/api/documents/upload",
        files={"file": ("biology.pdf", sample_pdf_bytes, "application/pdf")},
    )
    document_id = response.json()["id"]

    db = SessionLocal()
    try:
        chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).all()
        assert len(chunks) > 0
        assert chunks[0].embedding is not None
        assert "mitochondria" in chunks[0].content.lower()
    finally:
        db.close()


def test_list_documents_only_returns_own_documents(client, test_user_payload, sample_pdf_bytes, tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "UPLOADS_DIR", str(tmp_path))

    client.post("/api/auth/register", json=test_user_payload)
    login_a = client.post(
        "/api/auth/login",
        data={"username": test_user_payload["email"], "password": test_user_payload["password"]},
    )
    client.headers.update({"Authorization": f"Bearer {login_a.json()['access_token']}"})
    client.post(
        "/api/documents/upload",
        files={"file": ("mine.pdf", sample_pdf_bytes, "application/pdf")},
    )

    user_b = {"email": "other@example.com", "password": "AnotherPass123", "full_name": "Other User"}
    client.post("/api/auth/register", json=user_b)
    login_b = client.post(
        "/api/auth/login",
        data={"username": user_b["email"], "password": user_b["password"]},
    )
    client.headers.update({"Authorization": f"Bearer {login_b.json()['access_token']}"})

    response = client.get("/api/documents/")

    assert response.status_code == 200
    assert response.json() == []


def test_delete_document_removes_it(auth_client, sample_pdf_bytes, tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "UPLOADS_DIR", str(tmp_path))
    upload = auth_client.post(
        "/api/documents/upload",
        files={"file": ("notes.pdf", sample_pdf_bytes, "application/pdf")},
    )
    document_id = upload.json()["id"]

    delete_response = auth_client.delete(f"/api/documents/{document_id}")
    assert delete_response.status_code == 204

    list_response = auth_client.get("/api/documents/")
    assert list_response.json() == []


def test_delete_document_requires_ownership(client, test_user_payload, sample_pdf_bytes, tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "UPLOADS_DIR", str(tmp_path))

    client.post("/api/auth/register", json=test_user_payload)
    login_a = client.post(
        "/api/auth/login",
        data={"username": test_user_payload["email"], "password": test_user_payload["password"]},
    )
    client.headers.update({"Authorization": f"Bearer {login_a.json()['access_token']}"})
    upload = client.post(
        "/api/documents/upload",
        files={"file": ("private.pdf", sample_pdf_bytes, "application/pdf")},
    )
    document_id = upload.json()["id"]

    user_b = {"email": "intruder@example.com", "password": "AnotherPass123", "full_name": "Intruder"}
    client.post("/api/auth/register", json=user_b)
    login_b = client.post(
        "/api/auth/login",
        data={"username": user_b["email"], "password": user_b["password"]},
    )
    client.headers.update({"Authorization": f"Bearer {login_b.json()['access_token']}"})

    response = client.delete(f"/api/documents/{document_id}")

    assert response.status_code == 404