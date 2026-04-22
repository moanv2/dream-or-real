from __future__ import annotations

import argparse
import logging
import sys

from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.scrapers import configure_logging
from app.scrapers.config import ScrapeConfig
from app.scrapers.reddit import RedditScraper

logger = logging.getLogger(__name__)

SUBREDDIT_MAPPING = {
    "Dreams": "dream",
    "AmazingStories": "real",
}


def main():
    """Main entry point for the scraper CLI."""
    parser = argparse.ArgumentParser(
        description="Scrape Reddit posts and ingest into dream-or-real database"
    )
    parser.add_argument(
        "--sub",
        action="append",
        dest="subreddits",
        choices=list(SUBREDDIT_MAPPING.keys()),
        help="Subreddit to scrape (repeatable, default both)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limit posts per subreddit (default from SCRAPE_LIMIT_PER_SUB env var)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Log what would be inserted, commit nothing",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Ignore dedup, allow duplicate slugs",
    )

    args = parser.parse_args()

    configure_logging("INFO")

    config = ScrapeConfig.from_settings()
    limit = args.limit or config.limit_per_sub
    subreddits = args.subreddits or list(SUBREDDIT_MAPPING.keys())

    logger.info(f"Starting scraper: subs={subreddits} limit={limit} dry_run={args.dry_run}")

    db = SessionLocal()
    scraper = RedditScraper(config=config)

    exit_code = 0
    any_success = False
    any_failure = False

    for subreddit in subreddits:
        label = SUBREDDIT_MAPPING[subreddit]

        try:
            result = scraper.ingest(
                db,
                subreddit,
                label,
                limit,
                dry_run=args.dry_run,
                force=args.force,
            )

            if result["inserted"] > 0 or result["fetched"] > 0:
                any_success = True

            status = "dry_run" if args.dry_run else "committed"
            logger.info(
                f"sub={subreddit} fetched={result['fetched']} inserted={result['inserted']} "
                f"skipped_dedup={result['skipped_dedup']} filtered={result['filtered']} "
                f"errors={result['errors']} status={status}"
            )

            if result["errors"] > 0 and result["inserted"] == 0:
                any_failure = True

        except Exception as e:
            logger.error(f"Fatal error for r/{subreddit}: {e}")
            any_failure = True

    db.close()

    # Determine exit code: 0=success, 2=partial, 1=total failure
    if any_failure and not any_success:
        exit_code = 1
    elif any_failure or (not any_success and not any_failure):
        exit_code = 2
    else:
        exit_code = 0

    logger.info(f"Exiting with code {exit_code}")
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
