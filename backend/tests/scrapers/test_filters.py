from __future__ import annotations

import pytest

from app.scrapers.config import ScrapeConfig
from app.scrapers.reddit import RedditScraper


@pytest.fixture
def scraper():
    """Create a scraper with default config."""
    config = ScrapeConfig(
        user_agent="test/1.0",
        delay_seconds=0,
        limit_per_sub=50,
    )
    return RedditScraper(config=config)


def test_filters_drop_nsfw(scraper):
    """Test that NSFW posts are filtered."""
    post = {
        "reddit_id": "test1",
        "over_18": True,
        "is_self": True,
        "author": "user",
        "selftext": "x" * 300,
        "title": "title",
    }
    assert scraper.filter_post(post) is False


def test_filters_drop_non_text(scraper):
    """Test that non-text (link) posts are filtered."""
    post = {
        "reddit_id": "test2",
        "over_18": False,
        "is_self": False,
        "author": "user",
        "selftext": "x" * 300,
        "title": "title",
    }
    assert scraper.filter_post(post) is False


def test_filters_drop_deleted_author(scraper):
    """Test that posts from deleted authors are filtered."""
    post = {
        "reddit_id": "test3",
        "over_18": False,
        "is_self": True,
        "author": "[deleted]",
        "selftext": "x" * 300,
        "title": "title",
    }
    assert scraper.filter_post(post) is False

    post["author"] = "AutoModerator"
    assert scraper.filter_post(post) is False


def test_filters_drop_short_and_long(scraper):
    """Test that text length filters work at both ends."""
    short_post = {
        "reddit_id": "test4",
        "over_18": False,
        "is_self": True,
        "author": "user",
        "selftext": "x" * 100,
        "title": "title",
    }
    assert scraper.filter_post(short_post) is False

    long_post = {
        "reddit_id": "test5",
        "over_18": False,
        "is_self": True,
        "author": "user",
        "selftext": "x" * 6000,
        "title": "title",
    }
    assert scraper.filter_post(long_post) is False

    good_post = {
        "reddit_id": "test6",
        "over_18": False,
        "is_self": True,
        "author": "user",
        "selftext": "x" * 300,
        "title": "title",
    }
    assert scraper.filter_post(good_post) is True


def test_filters_drop_deleted_removed(scraper):
    """Test that [deleted] and [removed] bodies are dropped."""
    deleted_post = {
        "reddit_id": "test7",
        "over_18": False,
        "is_self": True,
        "author": "user",
        "selftext": "[deleted]",
        "title": "title",
    }
    assert scraper.filter_post(deleted_post) is False

    removed_post = {
        "reddit_id": "test8",
        "over_18": False,
        "is_self": True,
        "author": "user",
        "selftext": "[removed]",
        "title": "title",
    }
    assert scraper.filter_post(removed_post) is False

    empty_post = {
        "reddit_id": "test9",
        "over_18": False,
        "is_self": True,
        "author": "user",
        "selftext": "",
        "title": "title",
    }
    assert scraper.filter_post(empty_post) is False


def test_filters_pass_good_post(scraper):
    """Test that a good post passes all filters."""
    post = {
        "reddit_id": "test_good",
        "over_18": False,
        "is_self": True,
        "author": "regular_user",
        "selftext": "This is a good post with enough text. " * 20,
        "title": "A Great Story",
    }
    assert scraper.filter_post(post) is True
