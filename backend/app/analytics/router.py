from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.analytics.queries import (
    compute_dream_lexicon,
    compute_story_length_showdown,
    compute_trickster_leaderboard,
)
from app.db import get_db

router = APIRouter(prefix="/api/analytics/extras", tags=["analytics-extras"])


@router.get("/trickster")
def trickster(db: Session = Depends(get_db)):
    return compute_trickster_leaderboard(db, min_plays=1, top_n=6)


@router.get("/lexicon")
def lexicon(db: Session = Depends(get_db)):
    return compute_dream_lexicon(db, top_n=8, min_occurrences=2)


@router.get("/length-showdown")
def length_showdown(db: Session = Depends(get_db)):
    return compute_story_length_showdown(db)


@router.get("")
def bundle(db: Session = Depends(get_db)):
    return {
        "trickster": compute_trickster_leaderboard(db, min_plays=1, top_n=6),
        "lexicon": compute_dream_lexicon(db, top_n=8, min_occurrences=2),
        "length_showdown": compute_story_length_showdown(db),
    }
