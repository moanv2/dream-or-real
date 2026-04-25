from __future__ import annotations

import argparse
import asyncio
import logging
import sys
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.config import settings
from app.db import SessionLocal
from app.models import Story
from app.seed import SEED_DIRECTORIES, extract_title_and_text
from app.services.story_processing import SubmissionProcessingResult, process_user_story_submission

logger = logging.getLogger("uvicorn.error")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Import local seed files from stories/ and run each through the full "
            "user submission pipeline (moderation, rewrite/title, comic generation)."
        )
    )
    parser.add_argument(
        "--stories-dir",
        type=Path,
        default=settings.stories_dir,
        help=f"Directory containing Dreams/ and AmazingStories/ (default: {settings.stories_dir})",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Process only the first N files across both folders.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Process even when an identical original_text already exists in source=user stories.",
    )
    return parser.parse_args()


def discover_seed_files(stories_dir: Path) -> list[tuple[str, Path]]:
    entries: list[tuple[str, Path]] = []
    for folder_name, label in SEED_DIRECTORIES.items():
        folder_path = stories_dir / folder_name
        if not folder_path.exists():
            logger.warning("Seed folder missing: %s", folder_path)
            continue
        for file_path in sorted(folder_path.glob("*.txt")):
            entries.append((label, file_path))
    return entries


def extract_story_text(file_path: Path) -> str:
    raw_text = file_path.read_text(encoding="utf-8")
    _, story_text = extract_title_and_text(raw_text, fallback_title=file_path.stem)
    return story_text.strip()


def already_imported(db: Session, label: str, original_text: str) -> bool:
    statement = select(Story.id).where(
        Story.source == "user",
        Story.label == label,
        Story.original_text == original_text,
    )
    return db.scalar(statement) is not None


async def process_one_file(db: Session, label: str, file_path: Path) -> SubmissionProcessingResult:
    text = extract_story_text(file_path)
    if not text:
        raise ValueError(f"Story file is empty after parsing: {file_path}")

    return await process_user_story_submission(
        db=db,
        text=text,
        label=label,
        attachments=[],
    )


async def run() -> int:
    args = parse_args()
    seed_files = discover_seed_files(args.stories_dir)
    if args.limit is not None:
        seed_files = seed_files[: args.limit]

    if not seed_files:
        logger.warning("No seed files found under %s", args.stories_dir)
        return 0

    summary = {
        "total_files": len(seed_files),
        "skipped_existing": 0,
        "approved": 0,
        "rejected": 0,
        "needs_review": 0,
        "processing_failed": 0,
        "errors": 0,
    }

    db = SessionLocal()
    try:
        logger.info(
            "Starting seed import pipeline files=%d stories_dir=%s force=%s",
            len(seed_files),
            args.stories_dir,
            args.force,
        )

        for index, (label, file_path) in enumerate(seed_files, start=1):
            logger.info("[%d/%d] Processing %s (label=%s)", index, len(seed_files), file_path.name, label)
            try:
                text = extract_story_text(file_path)
                if not text:
                    raise ValueError("Parsed story text is empty")

                if not args.force and already_imported(db, label, text):
                    summary["skipped_existing"] += 1
                    logger.info("Skipped existing import for %s", file_path.name)
                    continue

                result = await process_user_story_submission(
                    db=db,
                    text=text,
                    label=label,
                    attachments=[],
                )
                summary[result.outcome] += 1
                logger.info(
                    "Finished %s outcome=%s story_id=%d message=%s",
                    file_path.name,
                    result.outcome,
                    result.story.id,
                    result.message,
                )
            except Exception:
                summary["errors"] += 1
                logger.exception("Failed processing file %s", file_path)

        logger.info(
            (
                "Seed import summary total_files=%(total_files)d skipped_existing=%(skipped_existing)d "
                "approved=%(approved)d rejected=%(rejected)d needs_review=%(needs_review)d "
                "processing_failed=%(processing_failed)d errors=%(errors)d"
            ),
            summary,
        )
    finally:
        db.close()

    return 1 if summary["errors"] > 0 else 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(run()))
