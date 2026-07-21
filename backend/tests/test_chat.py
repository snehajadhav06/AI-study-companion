"""Tests for /api/chat — the core RAG endpoint.

Only the network call to OpenRouter (`llm_service.generate_rag_answer`)
is mocked. Retrieval (vector_store.search over real DocumentChunk rows)
and citation-building run for real, so these tests catch regressions in
the actual RAG wiring, not just the LLM call.
"""
from unittest.mock import AsyncMock

from app.core.config import settings
from app.services import llm_service as llm_module


def test_chat_requires_at_least_one_uploaded_document(auth_client):
    response = auth_client.post("/api/chat/", json={"question": "What is a mitochondria?"})

    assert response.status_code == 400
    assert "No study materials" in response.json()["detail"]


def test_chat_with_unknown_document_returns_404(auth_client):
    response = auth_client.post(
        "/api/chat/",
        json={"question": "What is a mitochondria?", "document_id": 9999},
    )

    assert response.status_code == 404


def test_chat_returns_answer_grounded_in_uploaded_document(
    auth_client, sample_pdf_bytes, tmp_path, monkeypatch
):
    monkeypatch.setattr(settings, "UPLOADS_DIR", str(tmp_path))
    upload = auth_client.post(
        "/api/documents/upload",
        files={"file": ("biology.pdf", sample_pdf_bytes, "application/pdf")},
    )
    document_id = upload.json()["id"]

    monkeypatch.setattr(
        llm_module.llm_service,
        "generate_rag_answer",
        AsyncMock(return_value="The mitochondria produces ATP through cellular respiration."),
    )

    response = auth_client.post(
        "/api/chat/",
        json={"question": "What does the mitochondria do?", "document_id": document_id},
    )

    assert response.status_code == 200
    body = response.json()
    assert "mitochondria" in body["answer"].lower()
    assert len(body["citations"]) > 0
    assert "page" in body["citations"][0]
    assert "content" in body["citations"][0]


def test_chat_rejects_unauthenticated_requests(client):
    response = client.post("/api/chat/", json={"question": "Anything?"})

    assert response.status_code == 401


def test_chat_history_is_persisted_in_order(auth_client, sample_pdf_bytes, tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "UPLOADS_DIR", str(tmp_path))
    upload = auth_client.post(
        "/api/documents/upload",
        files={"file": ("biology.pdf", sample_pdf_bytes, "application/pdf")},
    )
    document_id = upload.json()["id"]

    monkeypatch.setattr(
        llm_module.llm_service,
        "generate_rag_answer",
        AsyncMock(return_value="ATP is produced via cellular respiration."),
    )

    auth_client.post(
        "/api/chat/",
        json={"question": "What is ATP?", "document_id": document_id},
    )

    history = auth_client.get(f"/api/chat/history?document_id={document_id}")

    assert history.status_code == 200
    messages = history.json()
    assert [m["role"] for m in messages] == ["user", "assistant"]
    assert messages[0]["content"] == "What is ATP?"
    assert "ATP" in messages[1]["content"]