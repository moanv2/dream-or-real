from __future__ import annotations

import mimetypes
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Literal
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Story, StoryAttachment
from app.seed import build_display_text, slugify
from app.services.ai import GeminiServiceError, generate_comic_for_story, moderate_story_text, rewrite_story_for_gameplay

SubmissionOutcome = Literal["approved", "rejected", "needs_review", "processing_failed"]


@dataclass
class SubmissionProcessingResult:
    outcome: SubmissionOutcome
    message: str
    story: Story


def _ensure_media_directories() -> None:
    settings.media_uploads_dir.mkdir(parents=True, exist_ok=True)
    settings.media_generated_comics_dir.mkdir(parents=True, exist_ok=True)


def _build_unique_user_slug(db: Session, label: str) -> str:
    while True:
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
        candidate = slugify(f"user-{label}-{timestamp}-{uuid4().hex[:8]}")
        exists = db.scalar(select(Story.id).where(Story.slug == candidate))
        if exists is None:
            return candidate


def _guess_extension(mime_type: str) -> str:
    extension = mimetypes.guess_extension(mime_type) or ".png"
    if extension == ".jpe":
        return ".jpg"
    return extension


def _validate_attachments(attachments: list[UploadFile]) -> None:
    for attachment in attachments:
        mime_type = attachment.content_type or ""
        if not mime_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Attachment '{attachment.filename or 'file'}' is not an image.",
            )


async def _save_attachments(story: Story, attachments: list[UploadFile], db: Session) -> None:
    _ensure_media_directories()

    for attachment in attachments:
        mime_type = attachment.content_type or ""
        blob = await attachment.read()
        if not blob:
            continue

        extension = _guess_extension(mime_type)
        filename = f"story-{story.id}-{uuid4().hex[:10]}{extension}"
        absolute_path = settings.media_uploads_dir / filename
        absolute_path.write_bytes(blob)

        attachment_row = StoryAttachment(
            story_id=story.id,
            file_path=f"uploads/{filename}",
            mime_type=mime_type,
            original_filename=attachment.filename,
        )
        db.add(attachment_row)


def _save_generated_comic(story_id: int, image_bytes: bytes, mime_type: str) -> str:
    _ensure_media_directories()
    extension = _guess_extension(mime_type)
    filename = f"story-{story_id}-{uuid4().hex[:10]}{extension}"
    absolute_path = settings.media_generated_comics_dir / filename
    absolute_path.write_bytes(image_bytes)
    return f"/media/generated_comics/{filename}"


async def process_user_story_submission(
    *,
    db: Session,
    text: str,
    label: str,
    attachments: list[UploadFile],
) -> SubmissionProcessingResult:
    _validate_attachments(attachments)
    fallback_display_text = build_display_text(text)
    story = Story(
        title=None,
        slug=_build_unique_user_slug(db, label),
        source="user",
        label=label,
        original_text=text,
        display_text=fallback_display_text,
        reveal_text=text,
        status="needs_review",
        processing_state="pending",
    )
    db.add(story)
    db.commit()
    db.refresh(story)

    if attachments:
        await _save_attachments(story, attachments, db)
        db.commit()
        db.refresh(story)

    try:
        moderation = moderate_story_text(story.original_text)
    except GeminiServiceError:
        story.status = "processing_failed"
        story.processing_state = "failed"
        story.moderation_category = "unclear"
        story.moderation_reason = "Text moderation could not be completed."
        db.commit()
        db.refresh(story)
        return SubmissionProcessingResult(
            outcome="processing_failed",
            message="Submission saved, but moderation failed. Please try again later.",
            story=story,
        )

    story.moderation_category = moderation.category
    story.moderation_reason = moderation.reason
    story.processing_state = "filtered"

    if moderation.decision == "rejected":
        story.status = "rejected"
        db.commit()
        db.refresh(story)
        return SubmissionProcessingResult(
            outcome="rejected",
            message=moderation.reason,
            story=story,
        )

    if moderation.decision == "needs_review":
        story.status = "needs_review"
        db.commit()
        db.refresh(story)
        return SubmissionProcessingResult(
            outcome="needs_review",
            message="Submission saved but flagged for manual review.",
            story=story,
        )

    story.status = "approved"

    try:
        rewrite = rewrite_story_for_gameplay(story.original_text)
        story.display_text = rewrite.display_text
        story.processing_state = "rewritten"
    except GeminiServiceError:
        story.display_text = fallback_display_text
        story.processing_state = "failed"
        db.commit()
        db.refresh(story)
        return SubmissionProcessingResult(
            outcome="processing_failed",
            message="Submission approved with fallback text. AI rewrite is temporarily unavailable.",
            story=story,
        )

    try:
        comic = generate_comic_for_story(rewrite.comic_summary)
        story.comic_prompt = comic.prompt
        story.comic_image_url = _save_generated_comic(story.id, comic.image_bytes, comic.mime_type)
        story.processing_state = "comic_generated"
    except GeminiServiceError:
        story.processing_state = "failed"
        db.commit()
        db.refresh(story)
        return SubmissionProcessingResult(
            outcome="processing_failed",
            message="Submission approved and playable. Comic generation failed.",
            story=story,
        )

    db.commit()
    db.refresh(story)
    return SubmissionProcessingResult(
        outcome="approved",
        message="Submission approved and fully processed.",
        story=story,
    )


def media_url_for_file_path(file_path: str) -> str:
    normalized = Path(file_path).as_posix().lstrip("/")
    return f"/media/{normalized}"
