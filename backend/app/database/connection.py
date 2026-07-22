from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {"sslmode": "require"} if settings.DATABASE_URL.startswith("postgresql") else {},
    pool_pre_ping=True,
    pool_recycle=280,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def ensure_document_chunk_embedding_column() -> None:
    inspector = inspect(engine)
    if "document_chunks" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("document_chunks")}
    if "embedding" in columns:
        return

    dialect_name = engine.dialect.name
    if dialect_name == "postgresql":
        statement = "ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS embedding BYTEA"
    elif dialect_name == "sqlite":
        statement = "ALTER TABLE document_chunks ADD COLUMN embedding BLOB"
    else:
        statement = "ALTER TABLE document_chunks ADD COLUMN embedding BYTEA"

    with engine.begin() as connection:
        connection.execute(text(statement))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
