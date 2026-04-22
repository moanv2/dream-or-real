"""
Reddit scraper service.

Uses Scrapling's ``Fetcher`` (curl_cffi-based) to pull posts from public
subreddit JSON endpoints and persists them into the ``scraped_reddit_posts``
table via SQLAlchemy.

Security model
--------------
* Read-only against Reddit's public HTTPS JSON endpoints — no user credentials
  are used, stored or transmitted.
* TLS certificate verification is enforced (``verify=True``) and redirects are
  limited to public hosts (``follow_redirects="safe"`` — curl_cffi's setting
  rejects redirects to internal/private IPs).
* Subreddit names are whitelist-validated against a strict regex before being
  interpolated into the request URL.
* Rows are persisted through SQLAlchemy ORM (parameterized SQL); all
  free-text fields are length-capped to match their column definitions.
* A per-subreddit delay (``SCRAPE_DELAY_SECONDS``) is honored to stay within
  Reddit's informal rate limits.
* Bounded request timeouts and a small retry budget prevent the scraper from
  hanging if Reddit is slow or intermittently refusing connections.
"""

from __future__ import annotations

import logging
import re
import time
from dataclasses import dataclass
from datetime import datetime
from typing import Iterable

from scrapling.fetchers import Fetcher
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import ScrapedRedditPost

logger = logging.getLogger(__name__)

REDDIT_BASE = "https://www.reddit.com"
ALLOWED_SORTS = frozenset({"hot", "new", "top", "rising"})

# Reddit usernames/subreddits are 3-21 chars, alphanumeric + underscore.
# Keep it strict: any character outside this set is rejected.
_SUBREDDIT_RE = re.compile(r"^[A-Za-z0-9_]{2,21}$")

# String column length caps — match the model definitions in app.models.
_MAX_TITLE_LEN = 512
_MAX_SUBREDDIT_LEN = 64
_MAX_AUTHOR_LEN = 128
_MAX_PERMALINK_LEN = 512
_MAX_FLAIR_LEN = 128
_MAX_URL_LEN = 512

# Hard cap on how many posts Reddit's JSON listing will return per page.
_REDDIT_MAX_LIMIT = 100


@dataclass
class ScrapeStats:
    """Per-subreddit counts returned from a scrape run."""

    subreddit: str
    fetched: int
    inserted: int
    updated: int
    skipped_empty: int


def _validate_subreddit(name: str) -> str:
    """Validate a subreddit name against the Reddit naming rules.

    Prevents path-traversal or header-injection via the URL and rejects
    unexpected input early.
    """
    candidate = (name or "").strip()
    if not _SUBREDDIT_RE.match(candidate):
        raise ValueError(f"Invalid subreddit name: {name!r}")
    return candidate


def _truncate(value: str | None, max_len: int) -> str | None:
    if value is None:
        return None
    return value if len(value) <= max_len else value[:max_len]


def _safe_str(value) -> str:
    return value if isinstance(value, str) else ""


def _fetch_listing(subreddit: str, limit: int, sort: str, timeout: float = 15.0) -> list[dict]:
    """Fetch a subreddit listing via Reddit's public JSON endpoint.

    Returns the raw ``data`` dicts for each post in the listing.
    """
    url = f"{REDDIT_BASE}/r/{subreddit}/{sort}.json"
    params = {
        "limit": max(1, min(int(limit), _REDDIT_MAX_LIMIT)),
        "raw_json": 1,  # disable HTML-escaped entities in selftext
    }
    headers = {
        "User-Agent": settings.scraper_user_agent,
        "Accept": "application/json",
    }

    response = Fetcher.get(
        url,
        params=params,
        headers=headers,
        timeout=timeout,
        verify=True,
        follow_redirects="safe",
        retries=3,
        retry_delay=2,
        stealthy_headers=True,
    )

    if getattr(response, "status", None) != 200:
        raise RuntimeError(
            f"Reddit returned HTTP {getattr(response, 'status', 'unknown')} "
            f"for r/{subreddit}/{sort}"
        )

    data = response.json()
    if not isinstance(data, dict):
        raise RuntimeError(f"Unexpected payload shape for r/{subreddit}: not a JSON object")

    children = ((data.get("data") or {}).get("children") or [])
    posts: list[dict] = []
    for child in children:
        if not isinstance(child, dict):
            continue
        post_data = child.get("data")
        if isinstance(post_data, dict):
            posts.append(post_data)
    return posts


def _map_post(raw: dict, subreddit: str) -> dict | None:
    """Map a Reddit API post dict into fields suitable for ``ScrapedRedditPost``.

    Returns ``None`` if mandatory fields are missing.
    """
    reddit_id = _safe_str(raw.get("id")).strip()
    if not reddit_id:
        return None

    title = _safe_str(raw.get("title")).strip()
    if not title:
        return None

    selftext = _safe_str(raw.get("selftext")).strip()
    permalink = _safe_str(raw.get("permalink")) or f"/r/{subreddit}/comments/{reddit_id}/"

    try:
        score = int(raw.get("score") or 0)
    except (TypeError, ValueError):
        score = 0
    try:
        upvote_ratio = float(raw.get("upvote_ratio") or 0.0)
    except (TypeError, ValueError):
        upvote_ratio = 0.0
    try:
        num_comments = int(raw.get("num_comments") or 0)
    except (TypeError, ValueError):
        num_comments = 0
    try:
        created_utc = float(raw.get("created_utc") or 0.0)
    except (TypeError, ValueError):
        created_utc = 0.0

    author = _safe_str(raw.get("author")).strip() or None
    flair = _safe_str(raw.get("link_flair_text")).strip() or None
    url = _safe_str(raw.get("url")).strip() or None

    return {
        "reddit_id": reddit_id,
        "subreddit": _truncate(subreddit, _MAX_SUBREDDIT_LEN),
        "title": _truncate(title, _MAX_TITLE_LEN),
        "selftext": selftext,
        "author": _truncate(author, _MAX_AUTHOR_LEN),
        "permalink": _truncate(permalink, _MAX_PERMALINK_LEN),
        "score": score,
        "upvote_ratio": upvote_ratio,
        "num_comments": num_comments,
        "created_utc": created_utc,
        "over_18": bool(raw.get("over_18")),
        "flair": _truncate(flair, _MAX_FLAIR_LEN),
        "is_self": bool(raw.get("is_self", True)),
        "url": _truncate(url, _MAX_URL_LEN),
    }


def scrape_subreddit(
    db: Session,
    subreddit: str,
    limit: int = 20,
    sort: str = "hot",
    skip_empty: bool = True,
) -> ScrapeStats:
    """Scrape a single subreddit and upsert posts into ``scraped_reddit_posts``.

    * De-duplicated by the ``reddit_id`` unique column.
    * Existing rows get their mutable metrics (``score``, ``upvote_ratio``,
      ``num_comments``, ``scraped_at``) refreshed; immutable fields are left
      alone.
    """
    subreddit = _validate_subreddit(subreddit)
    if sort not in ALLOWED_SORTS:
        raise ValueError(f"sort must be one of {sorted(ALLOWED_SORTS)}")
    if int(limit) <= 0:
        raise ValueError("limit must be positive")

    raw_posts = _fetch_listing(subreddit, limit=limit, sort=sort)
    stats = ScrapeStats(
        subreddit=subreddit,
        fetched=len(raw_posts),
        inserted=0,
        updated=0,
        skipped_empty=0,
    )
    now = datetime.utcnow()

    for raw in raw_posts:
        mapped = _map_post(raw, subreddit)
        if mapped is None:
            continue
        if skip_empty and not mapped["selftext"]:
            stats.skipped_empty += 1
            continue

        existing = db.scalar(
            select(ScrapedRedditPost).where(
                ScrapedRedditPost.reddit_id == mapped["reddit_id"]
            )
        )
        if existing is None:
            db.add(ScrapedRedditPost(**mapped, scraped_at=now))
            stats.inserted += 1
        else:
            existing.score = mapped["score"]
            existing.upvote_ratio = mapped["upvote_ratio"]
            existing.num_comments = mapped["num_comments"]
            existing.scraped_at = now
            stats.updated += 1

    db.commit()
    logger.info(
        "r/%s: fetched=%d inserted=%d updated=%d skipped_empty=%d",
        stats.subreddit, stats.fetched, stats.inserted, stats.updated, stats.skipped_empty,
    )
    return stats


def scrape_reddit(
    db: Session,
    subreddits: Iterable[str] = ("dreams", "amazingstories"),
    limit_per_sub: int = 20,
    sort: str = "hot",
    skip_empty: bool = True,
    delay_seconds: float | None = None,
) -> list[ScrapeStats]:
    """Scrape several subreddits sequentially, with a polite delay between each."""
    delay = (
        float(delay_seconds)
        if delay_seconds is not None
        else float(settings.scrape_delay_seconds)
    )
    subs = list(subreddits)
    results: list[ScrapeStats] = []
    for index, sub in enumerate(subs):
        try:
            results.append(
                scrape_subreddit(db, sub, limit=limit_per_sub, sort=sort, skip_empty=skip_empty)
            )
        except Exception:
            logger.exception("Failed to scrape r/%s", sub)
            raise
        if index < len(subs) - 1 and delay > 0:
            time.sleep(delay)
    return results
