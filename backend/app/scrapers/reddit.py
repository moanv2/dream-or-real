from __future__ import annotations

import json
import logging
import re
import time
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import ScrapedRedditPost, Story
from app.scrapers.config import ScrapeConfig
from app.seed import build_display_text, pick_comic_image, slugify

logger = logging.getLogger(__name__)


class RedditScraper:
    """Scrapes Reddit posts from public subreddits and ingests into the database."""

    REDDIT_BASE = "https://old.reddit.com"
    PROFANITY_PATTERN = re.compile(
        r"\b(badword1|badword2|badword3)\b", re.IGNORECASE
    )
    MIN_TEXT_LEN = 300
    MAX_TEXT_LEN = 5000

    def __init__(self, fetcher=None, config: ScrapeConfig = None):
        """
        Initialize the scraper.

        Args:
            fetcher: HTTP fetcher instance. If None, will be imported from scrapling.
            config: ScrapeConfig instance. If None, will load from settings.
        """
        if fetcher is None:
            from scrapling.fetchers import Fetcher

            self.fetcher = Fetcher
        else:
            self.fetcher = fetcher

        self.config = config or ScrapeConfig.from_settings()

    def fetch_listing(self, subreddit: str, limit: int = 50, max_retries: int = 3):
        """
        Fetch a listing from Reddit's JSON API with exponential backoff retry.

        Args:
            subreddit: Subreddit name (e.g., "Dreams").
            limit: Maximum posts to fetch.
            max_retries: Number of retries on non-429 errors.

        Returns:
            Parsed JSON dict or None on fatal failure.
        """
        url = f"{self.reddit_base}/r/{subreddit}/top/.json?t=year&limit={limit}"
        headers = {"User-Agent": self.config.user_agent}

        for attempt in range(max_retries):
            try:
                page = self.fetcher.get(
                    url, headers=headers, impersonate="chrome", stealthy_headers=True
                )
                if page.status == 200:
                    data = page.json()
                    if isinstance(data, dict) and "error" in data:
                        logger.warning(
                            f"Reddit JSON error for r/{subreddit}: {data.get('error')}"
                        )
                        return None
                    return data
                elif page.status == 429:
                    logger.warning(f"Rate limited (429) on r/{subreddit}, skipping sub")
                    return None
                else:
                    logger.warning(
                        f"HTTP {page.status} fetching r/{subreddit}, attempt {attempt + 1}/{max_retries}"
                    )
                    if attempt < max_retries - 1:
                        sleep_time = 2 ** (attempt + 1)
                        time.sleep(sleep_time)
                    continue
            except Exception as e:
                logger.warning(
                    f"Exception fetching r/{subreddit}: {e}, attempt {attempt + 1}/{max_retries}"
                )
                if attempt < max_retries - 1:
                    sleep_time = 2 ** (attempt + 1)
                    time.sleep(sleep_time)
                continue

        logger.error(f"Failed to fetch r/{subreddit} after {max_retries} retries")
        return None

    def parse_post(self, post_dict: dict) -> dict | None:
        """
        Parse a Reddit post from the API JSON into normalized form.

        All fields are accessed defensively with .get() to handle malformed payloads.

        Returns:
            Dict with 13 fields (reddit_id, subreddit, title, selftext, author,
            permalink, score, upvote_ratio, num_comments, created_utc, over_18,
            flair, is_self, url) or None if parsing fails.
        """
        try:
            data = post_dict.get("data", {})
            reddit_id = data.get("id")
            if not reddit_id:
                logger.warning("Post missing id field")
                return None

            return {
                "reddit_id": f"t3_{reddit_id}",
                "subreddit": data.get("subreddit", "Unknown"),
                "title": data.get("title", ""),
                "selftext": data.get("selftext", ""),
                "author": data.get("author", "[deleted]"),
                "permalink": f"https://www.reddit.com{data.get('permalink', '')}",
                "score": data.get("score", 0),
                "upvote_ratio": data.get("upvote_ratio", 0.5),
                "num_comments": data.get("num_comments", 0),
                "created_utc": data.get("created_utc", 0),
                "over_18": data.get("over_18", False),
                "flair": data.get("link_flair_text"),
                "is_self": data.get("is_self", False),
                "url": data.get("url", ""),
            }
        except Exception as e:
            logger.warning(f"Failed to parse post: {e}")
            return None

    def filter_post(self, post: dict) -> bool:
        """
        Check if a post passes all filters.

        Filters out:
        - NSFW posts (over_18=True)
        - Non-text posts (is_self=False)
        - Deleted authors
        - Empty/removed/deleted content
        - Text too short or too long
        - Titles with profanity/PII

        Returns:
            True if post passes all filters, False otherwise.
        """
        if post.get("over_18"):
            logger.debug(f"Filtering NSFW post: {post['reddit_id']}")
            return False

        if not post.get("is_self"):
            logger.debug(f"Filtering non-text post: {post['reddit_id']}")
            return False

        author = post.get("author", "")
        if author in {"[deleted]", "AutoModerator"}:
            logger.debug(f"Filtering deleted/bot post: {post['reddit_id']}")
            return False

        selftext = post.get("selftext", "")
        if selftext in {"", "[removed]", "[deleted]"}:
            logger.debug(f"Filtering empty/removed post: {post['reddit_id']}")
            return False

        text_len = len(selftext)
        if text_len < self.MIN_TEXT_LEN or text_len > self.MAX_TEXT_LEN:
            logger.debug(
                f"Filtering length post {text_len} chars: {post['reddit_id']}"
            )
            return False

        title = post.get("title", "")
        if self.PROFANITY_PATTERN.search(title):
            logger.debug(f"Filtering profanity in title: {post['reddit_id']}")
            return False

        return True

    def _save_raw(self, db: Session, post_dict: dict) -> bool:
        """
        Save the raw parsed post to the scraped_reddit_posts table.

        Returns:
            True if saved successfully, False otherwise.
        """
        try:
            existing = db.scalar(
                select(ScrapedRedditPost).where(
                    ScrapedRedditPost.reddit_id == post_dict["reddit_id"]
                )
            )
            if existing:
                logger.debug(f"Raw post already in DB: {post_dict['reddit_id']}")
                return False

            raw_post = ScrapedRedditPost(**post_dict)
            db.add(raw_post)
            db.commit()
            return True
        except Exception as e:
            logger.error(f"Error saving raw post {post_dict.get('reddit_id')}: {e}")
            db.rollback()
            return False

    def ingest(
        self, db: Session, subreddit: str, label: str, limit: int, dry_run: bool = False, force: bool = False
    ) -> dict:
        """
        Fetch, parse, filter, and ingest posts from a subreddit.

        Args:
            db: SQLAlchemy Session.
            subreddit: Subreddit name (e.g., "Dreams").
            label: Label for the Story (e.g., "dream" or "real").
            limit: Max posts to fetch.
            dry_run: If True, log but do not commit.
            force: If True, ignore dedup (insert duplicates).

        Returns:
            Dict with keys: fetched, parsed, filtered, inserted, skipped_dedup, errors.
        """
        result = {
            "fetched": 0,
            "parsed": 0,
            "filtered": 0,
            "inserted": 0,
            "skipped_dedup": 0,
            "errors": 0,
        }

        logger.info(f"Starting ingest for r/{subreddit} (limit={limit}, dry_run={dry_run})")

        time.sleep(self.config.delay_seconds)
        listing_json = self.fetch_listing(subreddit, limit)
        if not listing_json:
            result["errors"] = 1
            return result

        posts = listing_json.get("data", {}).get("children", [])
        result["fetched"] = len(posts)

        for post_data in posts:
            parsed = self.parse_post(post_data)
            if not parsed:
                result["errors"] += 1
                continue

            result["parsed"] += 1

            if not self.filter_post(parsed):
                result["filtered"] += 1
                continue

            slug = slugify(f"reddit-{subreddit}-{parsed['reddit_id']}")

            existing_story = db.scalar(select(Story).where(Story.slug == slug))
            if existing_story:
                if force:
                    if not dry_run:
                        db.delete(existing_story)
                        db.commit()
                else:
                    logger.warning(f"Story slug already exists: {slug}")
                    result["skipped_dedup"] += 1
                    continue

            try:
                if not dry_run:
                    self._save_raw(db, parsed)

                story = Story(
                    title=parsed["title"][:255],
                    slug=slug,
                    source="seed",
                    label=label,
                    original_text=parsed["selftext"],
                    display_text=build_display_text(parsed["selftext"]),
                    reveal_text=parsed["selftext"],
                    comic_image_url=pick_comic_image(slug),
                    status="approved",
                    processing_state="comic_generated",
                    created_at=datetime.utcfromtimestamp(parsed["created_utc"]),
                )

                if not dry_run:
                    db.add(story)
                    db.commit()

                logger.info(f"Inserted story: {slug}")
                result["inserted"] += 1

            except Exception as e:
                logger.error(f"Error inserting story {slug}: {e}")
                if not dry_run:
                    db.rollback()
                result["errors"] += 1

        logger.info(
            f"Ingest complete for r/{subreddit}: fetched={result['fetched']} "
            f"parsed={result['parsed']} filtered={result['filtered']} "
            f"inserted={result['inserted']} skipped_dedup={result['skipped_dedup']} "
            f"errors={result['errors']}"
        )

        return result

    @property
    def reddit_base(self) -> str:
        """Allow override of Reddit base URL for testing."""
        return self.REDDIT_BASE
