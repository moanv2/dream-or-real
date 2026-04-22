from __future__ import annotations

from dataclasses import dataclass

from app.config import settings


@dataclass
class ScrapeConfig:
    """Configuration for the Reddit scraper loaded from environment variables."""

    user_agent: str
    delay_seconds: float
    limit_per_sub: int

    @classmethod
    def from_settings(cls) -> ScrapeConfig:
        """Load config from app.config.settings (extend Settings if needed)."""
        user_agent = getattr(
            settings,
            "scraper_user_agent",
            "dream-or-real/0.1 (contact: maintainer@example.com)",
        )
        delay_seconds = float(getattr(settings, "scrape_delay_seconds", 2))
        limit_per_sub = int(getattr(settings, "scrape_limit_per_sub", 50))

        return cls(
            user_agent=user_agent,
            delay_seconds=delay_seconds,
            limit_per_sub=limit_per_sub,
        )
