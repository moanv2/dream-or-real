from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


StoryLabel = Literal["dream", "real"]
StorySource = Literal["seed", "user"]


class StorySummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str | None
    display_text: str
    comic_image_url: str | None
    source: StorySource


class StoryReveal(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str | None
    label: StoryLabel
    source: StorySource
    comic_image_url: str | None
    reveal_text: str
    original_text: str


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
    status: str
    created_at: datetime


class StorySubmitRequest(BaseModel):
    title: str | None = Field(default=None, max_length=255)
    text: str = Field(min_length=1)
    label: StoryLabel
    reveal_text: str | None = None

    @field_validator("title", "reveal_text", mode="before")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = str(value).strip()
        return cleaned or None

    @field_validator("text")
    @classmethod
    def strip_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Story text is required.")
        return cleaned

