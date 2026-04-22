from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import ValidationError
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.models import Story
from app.schemas import StoryCreated, StoryReveal, StorySubmitForm, StorySubmitResponse, StorySummary
from app.services.story_processing import media_url_for_file_path, process_user_story_submission

router = APIRouter(prefix="/api/stories", tags=["stories"])


def get_story_or_404(db: Session, story_id: int) -> Story:
    statement = (
        select(Story)
        .where(Story.id == story_id, Story.status == "approved")
        .options(selectinload(Story.attachments))
    )
    story = db.scalar(statement)
    if story is None or story.status != "approved":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found.")
    return story


@router.get("", response_model=list[StoryCreated])
def list_stories(db: Session = Depends(get_db)) -> list[Story]:
    statement = (
        select(Story)
        .where(Story.status == "approved", Story.source == "user")
        .options(selectinload(Story.attachments))
        .order_by(Story.created_at.desc(), Story.id.desc())
    )
    return list(db.scalars(statement).all())


@router.get("/random", response_model=StorySummary)
def random_story(db: Session = Depends(get_db)) -> Story:
    statement = (
        select(Story)
        .where(Story.status == "approved", Story.source == "user")
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
    story = get_story_or_404(db, story_id)
    attachments = [
        {
            "id": attachment.id,
            "url": media_url_for_file_path(attachment.file_path),
            "mime_type": attachment.mime_type,
            "original_filename": attachment.original_filename,
        }
        for attachment in story.attachments
    ]
    return StoryReveal(
        id=story.id,
        title=story.title,
        label=story.label,
        source=story.source,
        display_text=story.display_text,
        comic_image_url=story.comic_image_url,
        reveal_text=story.reveal_text or story.original_text,
        original_text=story.original_text,
        attachments=attachments,
    )


@router.post("/submit", response_model=StorySubmitResponse, status_code=status.HTTP_201_CREATED)
async def submit_story(
    text: str = Form(...),
    label: str = Form(...),
    attachments: list[UploadFile] | None = File(default=None),
    db: Session = Depends(get_db),
) -> StorySubmitResponse:
    try:
        payload = StorySubmitForm.model_validate({"text": text, "label": label})
    except ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=exc.errors()) from exc

    processing_result = await process_user_story_submission(
        db=db,
        text=payload.text,
        label=payload.label,
        attachments=attachments or [],
    )
    return StorySubmitResponse(
        outcome=processing_result.outcome,
        message=processing_result.message,
        story=StoryCreated.model_validate(processing_result.story),
    )
