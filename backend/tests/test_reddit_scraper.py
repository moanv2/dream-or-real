"""Tests for ``app.services.reddit_scraper`` with no network I/O."""

from __future__ import annotations

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.db import Base
from app.models import ScrapedRedditPost
from app.services import reddit_scraper
from app.services.reddit_scraper import (
    _map_post,
    _validate_subreddit,
    scrape_subreddit,
)


def _make_post(**overrides):
    """Build a minimal Reddit API post payload for testing."""
    base = {
        "id": "abc123",
        "title": "A dream about the ocean",
        "selftext": "I was floating in warm water.",
        "author": "sleepy_user",
        "permalink": "/r/dreams/comments/abc123/a_dream_about_the_ocean/",
        "score": 42,
        "upvote_ratio": 0.95,
        "num_comments": 7,
        "created_utc": 1_700_000_000.0,
        "over_18": False,
        "link_flair_text": "Nightmare",
        "is_self": True,
        "url": "https://reddit.com/r/dreams/comments/abc123/",
    }
    base.update(overrides)
    return base


@pytest.fixture
def session():
    engine = create_engine("sqlite:///:memory:", future=True)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    with Session() as s:
        yield s


def test_validate_subreddit_accepts_valid_names():
    assert _validate_subreddit("dreams") == "dreams"
    assert _validate_subreddit("AmazingStories") == "AmazingStories"
    assert _validate_subreddit("my_sub_2") == "my_sub_2"


@pytest.mark.parametrize(
    "bad",
    ["", " ", "x", "a" * 22, "has-dash", "has space", "with/slash", "../etc/passwd"],
)
def test_validate_subreddit_rejects_bad_names(bad):
    with pytest.raises(ValueError):
        _validate_subreddit(bad)


def test_map_post_returns_none_when_title_missing():
    assert _map_post({"id": "x", "title": "   "}, "dreams") is None


def test_map_post_returns_none_when_id_missing():
    assert _map_post({"title": "hi"}, "dreams") is None


def test_map_post_truncates_long_title_to_column_limit():
    long_title = "a" * 800
    mapped = _map_post(_make_post(title=long_title), "dreams")
    assert mapped is not None
    assert len(mapped["title"]) == 512


def test_map_post_coerces_numeric_fields_safely():
    mapped = _map_post(
        _make_post(score="not-a-number", upvote_ratio=None, num_comments="oops"),
        "dreams",
    )
    assert mapped["score"] == 0
    assert mapped["upvote_ratio"] == 0.0
    assert mapped["num_comments"] == 0


def test_scrape_subreddit_inserts_then_updates(monkeypatch, session):
    calls = {"count": 0}

    def fake_fetch(subreddit, limit, sort, timeout=15.0):
        calls["count"] += 1
        if calls["count"] == 1:
            return [
                _make_post(id="p1", title="first", score=10),
                _make_post(id="p2", title="second", score=20, selftext=""),  # empty
                _make_post(id="p3", title="third", score=30),
            ]
        # Second scrape: p1 has gained upvotes, p3 dropped out of hot.
        return [_make_post(id="p1", title="first (edited)", score=99)]

    monkeypatch.setattr(reddit_scraper, "_fetch_listing", fake_fetch)

    first = scrape_subreddit(session, "dreams", limit=5)
    assert first.fetched == 3
    assert first.inserted == 2
    assert first.updated == 0
    assert first.skipped_empty == 1

    stored = session.scalars(select(ScrapedRedditPost)).all()
    assert {p.reddit_id for p in stored} == {"p1", "p3"}

    second = scrape_subreddit(session, "dreams", limit=5)
    assert second.fetched == 1
    assert second.inserted == 0
    assert second.updated == 1

    p1 = session.scalar(select(ScrapedRedditPost).where(ScrapedRedditPost.reddit_id == "p1"))
    assert p1.score == 99  # refreshed
    # Immutable fields preserved
    assert p1.title == "first"


def test_scrape_subreddit_rejects_invalid_sort(session):
    with pytest.raises(ValueError):
        scrape_subreddit(session, "dreams", limit=5, sort="controversial-maybe")


def test_scrape_subreddit_rejects_invalid_limit(session):
    with pytest.raises(ValueError):
        scrape_subreddit(session, "dreams", limit=0)
