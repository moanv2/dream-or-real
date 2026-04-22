from __future__ import annotations

import json
from pathlib import Path

import pytest

from app.scrapers.reddit import RedditScraper


@pytest.fixture
def fake_fetcher():
    """Inject a fake fetcher for testing."""

    class FakeFetcher:
        @staticmethod
        def get(url, **kwargs):
            """Return mock Reddit JSON."""

            class FakePage:
                status = 200

                def json(self):
                    fixtures_dir = Path(__file__).parent.parent / "fixtures" / "reddit"
                    if "Dreams" in url:
                        fixture_file = fixtures_dir / "dreams_top.json"
                    else:
                        fixture_file = fixtures_dir / "amazingstories_top.json"
                    return json.loads(fixture_file.read_text())

            return FakePage()

    return FakeFetcher


@pytest.fixture
def scraper(fake_fetcher):
    """Create a scraper with a fake fetcher."""
    return RedditScraper(fetcher=fake_fetcher)


def test_parse_listing_json(scraper):
    """Test that parser extracts normalized dicts with all 13 fields from Reddit JSON."""
    fixtures_dir = Path(__file__).parent.parent / "fixtures" / "reddit"
    fixture_file = fixtures_dir / "dreams_top.json"
    listing_json = json.loads(fixture_file.read_text())

    posts = listing_json.get("data", {}).get("children", [])
    assert len(posts) > 0, "Fixture should have posts"

    parsed_posts = []
    for post_data in posts:
        parsed = scraper.parse_post(post_data)
        if parsed:
            parsed_posts.append(parsed)

    assert len(parsed_posts) > 0, "Should parse at least one post"

    required_fields = {
        "reddit_id",
        "subreddit",
        "title",
        "selftext",
        "author",
        "permalink",
        "score",
        "upvote_ratio",
        "num_comments",
        "created_utc",
        "over_18",
        "flair",
        "is_self",
        "url",
    }

    for post in parsed_posts:
        assert isinstance(post, dict)
        assert required_fields.issubset(post.keys()), f"Missing fields in {post.keys()}"

        assert isinstance(post["reddit_id"], str)
        assert isinstance(post["subreddit"], str)
        assert isinstance(post["score"], int)
        assert isinstance(post["upvote_ratio"], float)
        assert isinstance(post["over_18"], bool)
        assert isinstance(post["is_self"], bool)


def test_parse_malformed_post(scraper):
    """Test that parser handles malformed posts gracefully."""
    malformed = {"data": {"id": None}}
    assert scraper.parse_post(malformed) is None

    malformed = {}
    assert scraper.parse_post(malformed) is None

    malformed = {"data": {}}
    assert scraper.parse_post(malformed) is None
