from __future__ import annotations

import logging
import sys


def configure_logging(level: str = "INFO") -> None:
    """
    Configure logging for the scraper with a consistent format.

    Logs to stderr with structured format:
    level=INFO ts=... msg=...

    Args:
        level: Logging level (INFO, WARNING, ERROR, etc.)
    """
    log_level = getattr(logging, level.upper(), logging.INFO)
    logging.basicConfig(
        level=log_level,
        stream=sys.stderr,
        format="%(levelname)s %(asctime)s %(name)s %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
    )


__all__ = ["configure_logging"]
