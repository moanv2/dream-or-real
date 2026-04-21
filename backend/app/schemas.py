from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


StoryLabel = Literal["dream", "real"]
StorySource = Literal["seed", "user"]
StoryStatus = Literal["approved", "rejected", "needs_review", "processing_failed"]
ProcessingState = Literal["pending", "filtered", "rewritten", "comic_generated", "failed"]
SubmissionOutcome = Literal["approved", "rejected", "needs_review", "processing_failed"]


class StorySummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str | None
    display_text: str
    comic_image_url: str | None
    source: StorySource


class StoryAttachmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    mime_type: str
    original_filename: str | None


class StoryReveal(BaseModel):
    id: int
    title: str | None
    label: StoryLabel
    source: StorySource
    display_text: str
    comic_image_url: str | None
    reveal_text: str
    original_text: str
    attachments: list[StoryAttachmentOut]


class StoryCreated(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str | None
    slug: str
    source: StorySource
    label: StoryLabel
    display_text: str
    reveal_text: str | None
    comic_image_url: str | None
    moderation_reason: str | None
    moderation_category: str | None
    status: StoryStatus
    processing_state: ProcessingState | None
    created_at: datetime


class StorySubmitForm(BaseModel):
    text: str = Field(min_length=1)
    label: StoryLabel

    @field_validator("text", mode="before")
    @classmethod
    def strip_text(cls, value: str) -> str:
        if value is None:
            raise ValueError("Story text is required.")
        if not str(value).strip():
            raise ValueError("Story text is required.")
        return str(value)


class StorySubmitResponse(BaseModel):
    outcome: SubmissionOutcome
    message: str
    story: StoryCreated
