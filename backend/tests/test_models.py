from __future__ import annotations

from datetime import datetime

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, sessionmaker

from app.db import Base, ensure_story_stats
from app.models import GameplayEvent, ScrapedRedditPost, Story, StoryStats


@pytest.fixture
def db():
    """Create an in-memory SQLite engine and session for tests."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, class_=Session)
    db_session = SessionLocal()
    yield db_session
    db_session.close()


@pytest.fixture
def sample_story(db: Session) -> Story:
    """Create a sample story for testing."""
    story = Story(
        title="Test Story",
        slug="test-story",
        source="seed",
        label="dream",
        original_text="This is a test story.",
        display_text="This is a test story.",
        status="approved",
    )
    db.add(story)
    db.commit()
    db.refresh(story)
    return story


class TestScrapedRedditPost:
    def test_scraped_reddit_post_unique_reddit_id(self, db: Session):
        """Test that reddit_id is unique and raises IntegrityError on duplicate."""
        post1 = ScrapedRedditPost(
            reddit_id="t3_abc123",
            subreddit="Dreams",
            title="Post 1",
            selftext="This is a test post.",
            author="testuser",
            permalink="https://www.reddit.com/r/Dreams/comments/abc123",
            score=100,
            upvote_ratio=0.95,
            num_comments=10,
            created_utc=1234567890.0,
            over_18=False,
            is_self=True,
        )
        db.add(post1)
        db.commit()

        post2 = ScrapedRedditPost(
            reddit_id="t3_abc123",  # Duplicate
            subreddit="Dreams",
            title="Post 2",
            selftext="Different text.",
            author="anotheruser",
            permalink="https://www.reddit.com/r/Dreams/comments/abc124",
            score=50,
            upvote_ratio=0.85,
            num_comments=5,
            created_utc=1234567891.0,
            over_18=False,
            is_self=True,
        )
        db.add(post2)

        with pytest.raises(IntegrityError):
            db.commit()

    def test_scraped_reddit_post_linked_to_story(self, db: Session, sample_story: Story):
        """Test that a ScrapedRedditPost can link to a Story via story_id."""
        post = ScrapedRedditPost(
            reddit_id="t3_xyz789",
            subreddit="Dreams",
            title="Linked Post",
            selftext="This post is linked to a story.",
            author="testuser",
            permalink="https://www.reddit.com/r/Dreams/comments/xyz789",
            score=75,
            upvote_ratio=0.90,
            num_comments=8,
            created_utc=1234567892.0,
            over_18=False,
            is_self=True,
            story_id=sample_story.id,
        )
        db.add(post)
        db.commit()
        db.refresh(post)

        # Verify the relationship works
        assert post.story is not None
        assert post.story.id == sample_story.id
        assert post in sample_story.scraped_posts


class TestGameplayEvent:
    def test_gameplay_event_insert_and_query(self, db: Session, sample_story: Story):
        """Test inserting a GameplayEvent and querying by session_id."""
        session_uuid = "test-session-uuid-12345"

        event = GameplayEvent(
            story_id=sample_story.id,
            event_type="guess",
            guess_label="dream",
            was_correct=True,
            session_id=session_uuid,
            latency_ms=2500,
            user_agent_hash="abc123def456",
        )
        db.add(event)
        db.commit()

        # Query by session_id
        events = db.scalars(select(GameplayEvent).where(GameplayEvent.session_id == session_uuid)).all()
        assert len(events) == 1
        assert events[0].guess_label == "dream"
        assert events[0].was_correct is True


class TestStoryStats:
    def test_story_stats_unique_per_story(self, db: Session, sample_story: Story):
        """Test that StoryStats uses story_id as PK and prevents duplicates."""
        stats1 = StoryStats(
            story_id=sample_story.id,
            times_served=5,
            times_guessed_dream=2,
            times_guessed_real=3,
            times_correct=4,
            times_incorrect=1,
            avg_latency_ms=2000.0,
        )
        db.add(stats1)
        db.commit()

        # Attempt to insert a duplicate (different values)
        stats2 = StoryStats(
            story_id=sample_story.id,  # Same PK
            times_served=10,
            times_guessed_dream=5,
            times_guessed_real=5,
            times_correct=8,
            times_incorrect=2,
            avg_latency_ms=3000.0,
        )
        db.add(stats2)

        with pytest.raises(IntegrityError):
            db.commit()

    def test_ensure_story_stats_idempotent(self, db: Session, sample_story: Story):
        """Test that ensure_story_stats creates a row on first call and does nothing on subsequent calls."""
        # First call should create a row
        ensure_story_stats(db, sample_story.id)
        db.refresh(sample_story)

        stats_before = db.scalar(select(StoryStats).where(StoryStats.story_id == sample_story.id))
        assert stats_before is not None
        assert stats_before.times_served == 0
        assert stats_before.avg_latency_ms == 0.0

        # Second call should not create another row
        ensure_story_stats(db, sample_story.id)

        stats_after = db.scalars(select(StoryStats).where(StoryStats.story_id == sample_story.id)).all()
        assert len(stats_after) == 1
        assert stats_after[0].times_served == 0
