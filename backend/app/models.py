from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Story(Base):
    __tablename__ = "stories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    source: Mapped[str] = mapped_column(String(32), nullable=False)
    label: Mapped[str] = mapped_column(String(32), nullable=False)
    original_text: Mapped[str] = mapped_column(Text, nullable=False)
    display_text: Mapped[str] = mapped_column(Text, nullable=False)
    reveal_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    moderation_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    moderation_category: Mapped[str | None] = mapped_column(String(64), nullable=True)
    comic_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    comic_image_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="approved")
    processing_state: Mapped[str | None] = mapped_column(String(32), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    attachments: Mapped[list["StoryAttachment"]] = relationship(
        back_populates="story",
        cascade="all, delete-orphan",
    )
    scraped_posts: Mapped[list["ScrapedRedditPost"]] = relationship(
        back_populates="story",
        cascade="all, delete-orphan",
    )
    gameplay_events: Mapped[list["GameplayEvent"]] = relationship(
        back_populates="story",
        cascade="all, delete-orphan",
    )
    stats: Mapped["StoryStats | None"] = relationship(
        back_populates="story",
        cascade="all, delete-orphan",
        uselist=False,
    )


class StoryAttachment(Base):
    __tablename__ = "story_attachments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    story_id: Mapped[int] = mapped_column(ForeignKey("stories.id", ondelete="CASCADE"), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    original_filename: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    story: Mapped[Story] = relationship(back_populates="attachments")


class ScrapedRedditPost(Base):
    __tablename__ = "scraped_reddit_posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    reddit_id: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    subreddit: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    selftext: Mapped[str] = mapped_column(Text, nullable=False)
    author: Mapped[str | None] = mapped_column(String(128), nullable=True)
    permalink: Mapped[str] = mapped_column(String(512), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    upvote_ratio: Mapped[float] = mapped_column(Float, nullable=False)
    num_comments: Mapped[int] = mapped_column(Integer, nullable=False)
    created_utc: Mapped[float] = mapped_column(Float, nullable=False)
    over_18: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    flair: Mapped[str | None] = mapped_column(String(128), nullable=True)
    is_self: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    story_id: Mapped[int | None] = mapped_column(ForeignKey("stories.id", ondelete="SET NULL"), nullable=True)
    scraped_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, index=True)

    story: Mapped[Story | None] = relationship(back_populates="scraped_posts")


class GameplayEvent(Base):
    __tablename__ = "gameplay_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    story_id: Mapped[int] = mapped_column(ForeignKey("stories.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    guess_label: Mapped[str | None] = mapped_column(String(8), nullable=True)
    was_correct: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    session_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    latency_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    user_agent_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, index=True)

    story: Mapped[Story] = relationship(back_populates="gameplay_events")


class StoryStats(Base):
    __tablename__ = "story_stats"

    story_id: Mapped[int] = mapped_column(ForeignKey("stories.id", ondelete="CASCADE"), primary_key=True)
    times_served: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    times_guessed_dream: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    times_guessed_real: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    times_correct: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    times_incorrect: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    avg_latency_ms: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    last_played_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    story: Mapped[Story] = relationship(back_populates="stats")
