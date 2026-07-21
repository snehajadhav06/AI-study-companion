"""
Shared pytest fixtures for the AI Study Companion backend.

Two things happen here before anything else in the test suite runs:

1. Environment variables are pinned to safe test values (a throwaway
   SECRET_KEY and a local sqlite file) BEFORE `app.main` is imported.
   `Settings` reads these at import time, and environment variables take
   priority over a real `.env` file in pydantic-settings, so tests can
   never accidentally write to your real Postgres/Neon database.

2. `sentence_transformers` is swapped for a tiny fake module before
   `app.services.rag_service` (which instantiates a real
   SentenceTransformer at import time) is ever imported. Without this,
   just importing the app in a test run would try to download the
   ~90MB all-MiniLM-L6-v2 model from Hugging Face, which is slow and
   makes tests flaky without internet access. The fake encoder is
   deterministic (same text -> same vector), which is all the RAG
   search logic needs to be tested correctly.
"""
import os
import sys
import types

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest-only")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_study_companion.db")
os.environ.setdefault("OPENROUTER_API_KEY", "test-key")

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if "sentence_transformers" not in sys.modules:
    import numpy as np

    fake_module = types.ModuleType("sentence_transformers")

    class _FakeSentenceTransformer:
        """Deterministic stand-in for SentenceTransformer.

        Same input text always produces the same vector, and different
        text produces (effectively) uncorrelated vectors. That's enough
        to test ranking/cosine-similarity logic without downloading or
        running a real embedding model.
        """

        def __init__(self, *args, **kwargs):
            pass

        def encode(self, texts, convert_to_numpy=True):
            if isinstance(texts, str):
                texts = [texts]
            vectors = []
            for text in texts:
                seed = abs(hash(text)) % (2**32)
                rng = np.random.default_rng(seed)
                vectors.append(rng.random(16).astype(np.float32))
            return np.array(vectors, dtype=np.float32)

    fake_module.SentenceTransformer = _FakeSentenceTransformer
    sys.modules["sentence_transformers"] = fake_module

import pytest
from fastapi.testclient import TestClient

from app.database.connection import Base, engine
from app.main import app

TEST_DB_FILE = "./test_study_companion.db"


@pytest.fixture(scope="session", autouse=True)
def _setup_test_database():
    """Create all tables once for the test session, drop them after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()  
    if os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)


@pytest.fixture(autouse=True)
def _clean_tables():
    """Empty every table between tests so tests don't leak state into each other."""
    yield
    with engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())


@pytest.fixture
def client():
    """A plain, unauthenticated API client."""
    return TestClient(app)


@pytest.fixture
def test_user_payload():
    return {
        "email": "sneha@example.com",
        "password": "StrongPass123",
        "full_name": "Sneha Jadhav",
    }


@pytest.fixture
def auth_client(client, test_user_payload):
    """A client that's already registered, logged in, and carrying a bearer token."""
    client.post("/api/auth/register", json=test_user_payload)
    response = client.post(
        "/api/auth/login",
        data={
            "username": test_user_payload["email"],
            "password": test_user_payload["password"],
        },
    )
    token = response.json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client


@pytest.fixture
def sample_pdf_bytes():
    """A tiny real PDF (built with the same PyMuPDF the app uses) for upload tests."""
    import fitz

    doc = fitz.open()
    page = doc.new_page()
    page.insert_text(
        (72, 72),
        "The mitochondria is the powerhouse of the cell. "
        "It generates ATP through cellular respiration.",
    )
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes