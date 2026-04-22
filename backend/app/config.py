from __future__ import annotations

import os
from pathlib import Path


class Settings:
    def __init__(self) -> None:
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///./data/dream_or_real.db")
        self.frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
        self.stories_dir = Path(os.getenv("STORIES_DIR", "/stories"))
        self.media_dir = Path(os.getenv("MEDIA_DIR", "./media"))
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        self.gemini_text_model = os.getenv("GEMINI_TEXT_MODEL", "gemini-2.5-flash")
        self.gemini_image_model = os.getenv("GEMINI_IMAGE_MODEL", "gemini-3-pro-image-preview")
        self.scraper_user_agent = os.getenv("SCRAPER_USER_AGENT", "dream-or-real/0.1 (contact: maintainer@example.com)")
        self.scrape_delay_seconds = os.getenv("SCRAPE_DELAY_SECONDS", "2")
        self.scrape_limit_per_sub = os.getenv("SCRAPE_LIMIT_PER_SUB", "50")

    @property
    def media_uploads_dir(self) -> Path:
        return self.media_dir / "uploads"

    @property
    def media_generated_comics_dir(self) -> Path:
        return self.media_dir / "generated_comics"


settings = Settings()
