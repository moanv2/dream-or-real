from __future__ import annotations

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    pass


connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, class_=Session)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def apply_migrations() -> None:
    inspector = inspect(engine)
    if "stories" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("stories")}
    column_definitions = {
        "moderation_reason": "TEXT",
        "moderation_category": "VARCHAR(64)",
        "comic_prompt": "TEXT",
        "processing_state": "VARCHAR(32)",
    }

    missing_columns = [
        (column_name, column_sql)
        for column_name, column_sql in column_definitions.items()
        if column_name not in existing_columns
    ]
    if not missing_columns:
        return

    with engine.begin() as connection:
        for column_name, column_sql in missing_columns:
            connection.execute(text(f"ALTER TABLE stories ADD COLUMN {column_name} {column_sql}"))
