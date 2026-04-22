"""Tests for the analytics module — pure data + PNG renderer smoke tests.

Synthetic in-memory SQLite is used so tests don't touch the real database.
The renderer tests assert that the output is a valid PNG byte stream; we
don't pixel-diff the images.
"""

from __future__ import annotations

from datetime import datetime, timedelta

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.analytics import (
    compute_dream_lexicon,
    compute_story_length_showdown,
    compute_trickster_leaderboard,
    render_dream_lexicon,
    render_story_length_showdown,
    render_trickster_leaderboard,
)
from app.db import Base
from app.models import GameplayEvent, Story


PNG_MAGIC = b"\x89PNG\r\n\x1a\n"


def _make_session():
    engine = create_engine("sqlite:///:memory:", future=True)
    Base.metadata.create_all(bind=engine)
    return sessionmaker(bind=engine, autoflush=False, autocommit=False)()


def _add_story(db, *, title, label, text, slug=None):
    story = Story(
        title=title,
        slug=slug or title.lower().replace(" ", "-"),
        source="seed",
        label=label,
        original_text=text,
        display_text=text[:120],
    )
    db.add(story)
    db.flush()
    return story


def _add_guess(db, story, *, guess_label, was_correct, when=None):
    db.add(
        GameplayEvent(
            story_id=story.id,
            event_type="guess",
            guess_label=guess_label,
            was_correct=was_correct,
            session_id=f"sess-{story.id}-{guess_label}-{was_correct}",
            created_at=when or datetime.utcnow(),
        )
    )


# ---------------------------------------------------------------------------
# Trickster leaderboard
# ---------------------------------------------------------------------------


def test_trickster_leaderboard_orders_by_difficulty():
    db = _make_session()
    easy = _add_story(db, title="Easy dream", label="dream", text="Floating in clouds.")
    hard = _add_story(db, title="Tricky tale", label="real", text="Long story actually true.")

    # easy: 9/10 correct
    for _ in range(9):
        _add_guess(db, easy, guess_label="dream", was_correct=True)
    _add_guess(db, easy, guess_label="real", was_correct=False)
    # hard: 2/10 correct
    for _ in range(2):
        _add_guess(db, hard, guess_label="real", was_correct=True)
    for _ in range(8):
        _add_guess(db, hard, guess_label="dream", was_correct=False)
    db.commit()

    board = compute_trickster_leaderboard(db, min_plays=1)
    assert board.has_data is True
    assert len(board.entries) == 2
    # Hardest first
    assert board.entries[0].title == "Tricky tale"
    assert board.entries[0].fooled_pct == pytest.approx(0.8)
    assert board.entries[1].title == "Easy dream"
    assert board.entries[1].fooled_pct == pytest.approx(0.1)


def test_trickster_leaderboard_min_plays_filter():
    db = _make_session()
    s = _add_story(db, title="Single play", label="dream", text="Once.")
    _add_guess(db, s, guess_label="real", was_correct=False)
    db.commit()

    assert compute_trickster_leaderboard(db, min_plays=2).entries == []
    assert len(compute_trickster_leaderboard(db, min_plays=1).entries) == 1


def test_trickster_render_returns_png():
    db = _make_session()
    s = _add_story(db, title="A dream", label="dream", text="x")
    _add_guess(db, s, guess_label="real", was_correct=False)
    db.commit()
    png = render_trickster_leaderboard(compute_trickster_leaderboard(db))
    assert png.startswith(PNG_MAGIC)


def test_trickster_render_empty_state():
    db = _make_session()
    png = render_trickster_leaderboard(compute_trickster_leaderboard(db))
    assert png.startswith(PNG_MAGIC)


# ---------------------------------------------------------------------------
# Dream lexicon
# ---------------------------------------------------------------------------


def test_dream_lexicon_surfaces_distinctive_words():
    db = _make_session()
    _add_story(
        db, title="d1", label="dream", slug="d1",
        text="floating floating floating ocean ocean nightmare nightmare nightmare",
    )
    _add_story(
        db, title="d2", label="dream", slug="d2",
        text="floating ocean nightmare car",
    )
    _add_story(
        db, title="r1", label="real", slug="r1",
        text="meeting meeting meeting boss boss boss boss boss",
    )
    _add_story(
        db, title="r2", label="real", slug="r2",
        text="meeting boss boss boss",
    )
    db.commit()

    lex = compute_dream_lexicon(db, top_n=5, min_occurrences=2)
    assert lex.has_data is True
    dreamy = {w.word for w in lex.dreamy_words}
    real = {w.word for w in lex.real_words}
    assert "nightmare" in dreamy or "floating" in dreamy
    assert "boss" in real or "meeting" in real


def test_dream_lexicon_handles_missing_corpus():
    db = _make_session()
    _add_story(db, title="only", label="dream", text="alone here")
    db.commit()
    lex = compute_dream_lexicon(db)
    assert lex.has_data is False
    assert lex.dreamy_words == []
    assert lex.real_words == []
    # Renderer should still produce a PNG (empty-state)
    assert render_dream_lexicon(lex).startswith(PNG_MAGIC)


def test_dream_lexicon_render_returns_png():
    db = _make_session()
    _add_story(db, title="d", label="dream", text="floating ocean nightmare " * 5)
    _add_story(db, title="r", label="real", text="meeting boss laptop " * 5)
    db.commit()
    assert render_dream_lexicon(compute_dream_lexicon(db, min_occurrences=1)).startswith(PNG_MAGIC)


# ---------------------------------------------------------------------------
# Story length showdown
# ---------------------------------------------------------------------------


def test_length_showdown_computes_averages_and_buckets():
    db = _make_session()
    _add_story(db, title="d-short", label="dream", text=" ".join(["w"] * 20))
    _add_story(db, title="d-long", label="dream", text=" ".join(["w"] * 80))
    _add_story(db, title="r-mid", label="real", text=" ".join(["w"] * 100))
    _add_story(db, title="r-mid2", label="real", text=" ".join(["w"] * 200))
    db.commit()

    data = compute_story_length_showdown(db, bucket_size=50)
    assert data.has_data is True
    assert data.dream_story_count == 2
    assert data.real_story_count == 2
    assert data.dream_avg_words == pytest.approx(50.0)
    assert data.real_avg_words == pytest.approx(150.0)
    # Histogram should cover the spread of all four stories
    bin_words = sum(b.dream_count + b.real_count for b in data.buckets)
    assert bin_words == 4


def test_length_showdown_render_returns_png():
    db = _make_session()
    _add_story(db, title="d", label="dream", text="word " * 30)
    _add_story(db, title="r", label="real", text="word " * 90)
    db.commit()
    png = render_story_length_showdown(compute_story_length_showdown(db, bucket_size=25))
    assert png.startswith(PNG_MAGIC)


def test_length_showdown_empty_state():
    db = _make_session()
    data = compute_story_length_showdown(db)
    assert data.has_data is False
    assert render_story_length_showdown(data).startswith(PNG_MAGIC)
