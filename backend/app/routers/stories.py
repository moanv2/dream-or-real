from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Story
from app.schemas import StoryCreated, StoryReveal, StorySubmitRequest, StorySummary
from app.seed import build_display_text, pick_comic_image, slugify

router = APIRouter(prefix="/api/stories", tags=["stories"])


def get_story_or_404(db: Session, story_id: int) -> Story:
    story = db.get(Story, story_id)
    if story is None or story.status != "approved":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found.")
    return story


@router.get("", response_model=list[StoryCreated])
def list_stories(db: Session = Depends(get_db)) -> list[Story]:
    statement = (
        select(Story)
        .where(Story.status == "approved")
        .order_by(Story.created_at.desc(), Story.id.desc())
    )
    return list(db.scalars(statement).all())


@router.get("/random", response_model=StorySummary)
def random_story(db: Session = Depends(get_db)) -> Story:
    statement = (
        select(Story)
        .where(Story.status == "approved")
        .order_by(func.random())
        .limit(1)
    )
    story = db.scalar(statement)
    if story is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No approved stories are available.",
        )
    return story


@router.get("/{story_id}/reveal", response_model=StoryReveal)
def reveal_story(story_id: int, db: Session = Depends(get_db)) -> Story:
    return get_story_or_404(db, story_id)


@router.post("/submit", response_model=StoryCreated, status_code=status.HTTP_201_CREATED)
def submit_story(payload: StorySubmitRequest, db: Session = Depends(get_db)) -> Story:
    base_title = payload.title or f"Anonymous {payload.label.title()} Story"
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    slug = slugify(f"user-{base_title}-{timestamp}")
    while db.scalar(select(Story.id).where(Story.slug == slug)) is not None:
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
        slug = slugify(f"user-{base_title}-{timestamp}")

    story = Story(
        title=payload.title,
        slug=slug,
        source="user",
        label=payload.label,
        original_text=payload.text,
        display_text=build_display_text(payload.text),
        reveal_text=payload.reveal_text or payload.text,
        comic_image_url=pick_comic_image(slug),
        status="approved",
    )
    db.add(story)
    db.commit()
    db.refresh(story)
    return story

