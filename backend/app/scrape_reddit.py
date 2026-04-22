"""
CLI entry point for scraping Reddit posts into the dream_or_real.db database.

Example usage from the ``backend/`` directory, inside the project's virtual
environment:

    python -m app.scrape_reddit                         # defaults: 20/sub, hot
    python -m app.scrape_reddit --limit 20 --sort hot
    python -m app.scrape_reddit --subreddit dreams --subreddit amazingstories

See app/services/reddit_scraper.py for the security model.
"""

from __future__ import annotations

import argparse
import logging
import sys

from app.db import Base, SessionLocal, engine
from app.services.reddit_scraper import ALLOWED_SORTS, scrape_reddit


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Scrape Reddit posts into the local dream_or_real.db SQLite database.",
    )
    parser.add_argument(
        "--subreddit",
        action="append",
        default=None,
        metavar="NAME",
        help=(
            "Subreddit to scrape (may be specified multiple times). "
            "Defaults to --subreddit dreams --subreddit amazingstories."
        ),
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=20,
        help="Maximum number of posts to pull per subreddit (default: 20).",
    )
    parser.add_argument(
        "--sort",
        choices=sorted(ALLOWED_SORTS),
        default="hot",
        help="Reddit listing sort order (default: hot).",
    )
    parser.add_argument(
        "--include-empty",
        action="store_true",
        help="Also store posts that have no selftext body.",
    )
    parser.add_argument(
        "--delay-seconds",
        type=float,
        default=None,
        help=(
            "Seconds to sleep between subreddit requests "
            "(defaults to SCRAPE_DELAY_SECONDS)."
        ),
    )
    parser.add_argument("-v", "--verbose", action="store_true", help="Verbose logging.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv)
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )

    # Safe and idempotent: creates any missing tables for fresh checkouts.
    Base.metadata.create_all(bind=engine)

    subreddits = args.subreddit or ["dreams", "amazingstories"]

    with SessionLocal() as db:
        stats = scrape_reddit(
            db,
            subreddits=subreddits,
            limit_per_sub=args.limit,
            sort=args.sort,
            skip_empty=not args.include_empty,
            delay_seconds=args.delay_seconds,
        )

    for stat in stats:
        print(
            f"r/{stat.subreddit}: "
            f"fetched={stat.fetched} inserted={stat.inserted} "
            f"updated={stat.updated} skipped_empty={stat.skipped_empty}"
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
