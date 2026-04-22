from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from user_analytics import queries

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)) -> dict:
    return {
        "overall_accuracy": queries.overall_accuracy(db),
        "label_accuracy": queries.label_accuracy(db),
        "trickiest_stories": queries.trickiest_stories(db),
    }
