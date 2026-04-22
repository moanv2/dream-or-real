"""Pydantic schemas for analytics payloads.

These are the JSON shapes consumed by the frontend when it renders charts
itself. The same data is also fed into the matplotlib renderers in
``visualizations.py``.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# 1. Trickster leaderboard
# ---------------------------------------------------------------------------


class TricksterEntry(BaseModel):
    story_id: int
    title: str
    label: str = Field(description="'dream' or 'real'")
    times_played: int
    times_correct: int
    accuracy: float = Field(ge=0.0, le=1.0)
    fooled_pct: float = Field(
        ge=0.0,
        le=1.0,
        description="Fraction of guesses that were wrong (1 - accuracy).",
    )


class TricksterLeaderboard(BaseModel):
    entries: list[TricksterEntry]
    min_plays_threshold: int = Field(
        description="Stories with fewer plays than this were excluded.",
    )
    has_data: bool = Field(
        description="False when no qualifying gameplay events exist yet.",
    )


# ---------------------------------------------------------------------------
# 2. Dream lexicon
# ---------------------------------------------------------------------------


class LexiconWord(BaseModel):
    word: str
    dream_count: int = Field(ge=0)
    real_count: int = Field(ge=0)
    dreaminess: float = Field(
        description=(
            "How much more frequent this word is in dream stories than in "
            "real stories, normalized by corpus size. Range roughly [-1, 1]; "
            "positive = dreamy, negative = real-life."
        ),
    )


class DreamLexicon(BaseModel):
    dreamy_words: list[LexiconWord] = Field(
        description="Top words that skew toward dream stories."
    )
    real_words: list[LexiconWord] = Field(
        description="Top words that skew toward real stories.",
    )
    dream_story_count: int
    real_story_count: int
    has_data: bool


# ---------------------------------------------------------------------------
# 3. Story length showdown
# ---------------------------------------------------------------------------


class LengthBucket(BaseModel):
    """One bin in the word-count histogram."""

    bucket_start: int = Field(description="Inclusive lower bound of the bin (words).")
    bucket_end: int = Field(description="Exclusive upper bound of the bin (words).")
    dream_count: int = Field(ge=0)
    real_count: int = Field(ge=0)


class StoryLengthShowdown(BaseModel):
    buckets: list[LengthBucket]
    dream_avg_words: float
    real_avg_words: float
    dream_median_words: int
    real_median_words: int
    dream_story_count: int
    real_story_count: int
    has_data: bool
