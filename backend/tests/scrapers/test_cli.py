from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from sqlalchemy import select

from app.db import SessionLocal
from app.models import Story


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
def db_session():
    """Create a test database session."""
    from app.db import Base, engine

    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)


def test_cli_dry_run_commits_nothing(fake_fetcher, db_session):
    """Test that running CLI with --dry-run commits no stories to DB."""
    from sqlalchemy.sql import func

    from app.scrapers.config import ScrapeConfig
    from app.scrapers.reddit import RedditScraper

    config = ScrapeConfig(
        user_agent="test/1.0",
        delay_seconds=0,
        limit_per_sub=5,
    )
    scraper = RedditScraper(fetcher=fake_fetcher, config=config)

    result = scraper.ingest(
        db_session, "Dreams", "dream", limit=5, dry_run=True, force=False
    )

    count = db_session.scalar(select(func.count()).select_from(Story))
    assert count == 0, "Dry run should not commit stories"


def test_429_backoff_skips_sub(db_session):
    """Test that scraper retries on 429 and eventually skips the sub."""

    class FakePageError:
        status = 429

        def json(self):
            return {}

    class FakeFetcherWith429:
        call_count = 0

        @classmethod
        def get(cls, url, **kwargs):
            cls.call_count += 1
            return FakePageError()

    from app.scrapers.config import ScrapeConfig
    from app.scrapers.reddit import RedditScraper

    config = ScrapeConfig(
        user_agent="test/1.0",
        delay_seconds=0,
        limit_per_sub=5,
    )
    scraper = RedditScraper(fetcher=FakeFetcherWith429, config=config)

    result = scraper.ingest(
        db_session, "Dreams", "dream", limit=5, dry_run=False, force=False
    )

    assert result["inserted"] == 0, "429 should skip the sub without inserting"
    assert FakeFetcherWith429.call_count == 1, "Should try once then give up on 429"
