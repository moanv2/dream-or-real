from __future__ import annotations

import re
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Story

COMIC_IMAGES = [
    "/comics/elevator-goat.svg",
    "/comics/library-sleepwalk.svg",
    "/comics/night-bus-fish.svg",
    "/comics/office-volcano.svg",
    "/comics/penguin-boardroom.svg",
]

SEED_DIRECTORIES = {
    "Dreams": "dream",
    "AmazingStories": "real",
}


def normalize_story_text(text: str) -> str:
    text = text.replace("\r\n", "\n")
    lines = [line.strip() for line in text.split("\n")]
    normalized: list[str] = []
    blank_pending = False

    for line in lines:
        if not line:
            if normalized:
                blank_pending = True
            continue
        if blank_pending:
            normalized.append("")
            blank_pending = False
        normalized.append(line)

    return "\n".join(normalized).strip()


def build_display_text(text: str, limit: int = 420) -> str:
    normalized = normalize_story_text(text)
    flattened = normalized.replace("\n\n", " ").replace("\n", " ")

    if len(flattened) <= limit:
        return flattened

    truncated = flattened[:limit].rstrip()
    sentence_endings = [truncated.rfind(marker) for marker in [". ", "! ", "? "]]
    cut_index = max(sentence_endings)

    if cut_index >= int(limit * 0.55):
        return truncated[: cut_index + 1].strip()

    word_cut = truncated.rfind(" ")
    if word_cut >= int(limit * 0.7):
        truncated = truncated[:word_cut]

    return f"{truncated.strip()}..."


def extract_title_and_text(raw_text: str, fallback_title: str) -> tuple[str, str]:
    cleaned = normalize_story_text(raw_text)
    title_match = re.match(r"^Title:\s*(.+?)(?:\n|$)", cleaned, flags=re.IGNORECASE)
    if not title_match:
        return fallback_title, cleaned

    title = title_match.group(1).strip() or fallback_title
    body = cleaned[title_match.end() :].strip()
    return title, body or cleaned


def slugify(value: str) -> str:
    lowered = value.lower()
    lowered = re.sub(r"[^a-z0-9]+", "-", lowered)
    lowered = re.sub(r"-{2,}", "-", lowered)
    return lowered.strip("-") or "story"


def pick_comic_image(slug: str) -> str:
    index = sum(ord(char) for char in slug) % len(COMIC_IMAGES)
    return COMIC_IMAGES[index]


def seed_stories(db: Session, stories_dir: Path) -> int:
    existing_slugs = set(db.scalars(select(Story.slug)).all())
    inserted = 0

    for folder_name, label in SEED_DIRECTORIES.items():
        folder_path = stories_dir / folder_name
        if not folder_path.exists():
            continue

        for file_path in sorted(folder_path.glob("*.txt")):
            slug = slugify(f"{folder_name}-{file_path.stem}")
            if slug in existing_slugs:
                continue

            fallback_title = file_path.stem.replace("-", " ").replace("_", " ").title()
            raw_text = file_path.read_text(encoding="utf-8")
            title, original_text = extract_title_and_text(raw_text, fallback_title)
            story = Story(
                title=title,
                slug=slug,
                source="seed",
                label=label,
                original_text=original_text,
                display_text=build_display_text(original_text),
                reveal_text=original_text,
                comic_image_url=pick_comic_image(slug),
                status="approved",
            )
            db.add(story)
            existing_slugs.add(slug)
            inserted += 1

    if inserted:
        db.commit()

    return inserted
