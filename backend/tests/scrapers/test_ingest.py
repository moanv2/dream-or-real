from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from sqlalchemy import select

from app.db import SessionLocal
from app.models import Story
from app.scrapers.config import ScrapeConfig
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
def db_session():
    """Create a test database session."""
    from app.db import Base, engine

    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def scraper(fake_fetcher):
    """Create a scraper with a fake fetcher."""
    config = ScrapeConfig(
        user_agent="test/1.0",
        delay_seconds=0,
        limit_per_sub=50,
    )
    return RedditScraper(fetcher=fake_fetcher, config=config)


def test_dedup_by_slug(scraper, db_session):
    """Test that inserting the same post twice results in one row."""
    from sqlalchemy.sql import func

    result1 = scraper.ingest(
        db_session, "Dreams", "dream", limit=5, dry_run=False, force=False
    )

    result2 = scraper.ingest(
        db_session, "Dreams", "dream", limit=5, dry_run=False, force=False
    )

    assert result1["inserted"] > 0, "First ingest should insert posts"
    assert result2["inserted"] == 0, "Second ingest should insert zero due to dedup"
    assert result2["skipped_dedup"] > 0, "Second ingest should report dedup skips"


def test_dry_run_commits_nothing(scraper, db_session):
    """Test that --dry-run doesn't commit any stories."""
    from sqlalchemy.sql import func

    result = scraper.ingest(
        db_session, "Dreams", "dream", limit=5, dry_run=True, force=False
    )

    count = db_session.scalar(select(func.count()).select_from(Story))
    assert count == 0, "Dry run should not commit any stories"
    assert result["inserted"] > 0, "Dry run should still count insertions"


def test_force_ignores_dedup(scraper, db_session):
    """Test that --force allows duplicate slugs."""
    result1 = scraper.ingest(
        db_session, "Dreams", "dream", limit=2, dry_run=False, force=False
    )
    inserted1 = result1["inserted"]

    result2 = scraper.ingest(
        db_session, "Dreams", "dream", limit=2, dry_run=False, force=True
    )

    assert result2["inserted"] > 0, "Force should allow re-insert"
    assert result2["skipped_dedup"] == 0, "Force should not skip any for dedup"
