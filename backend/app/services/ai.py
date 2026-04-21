from __future__ import annotations

import base64
from dataclasses import dataclass
from functools import lru_cache
from typing import Literal

from pydantic import BaseModel, Field

from app.config import settings
from app.seed import build_display_text
from app.services.prompts import build_comic_prompt, build_moderation_prompt, build_rewrite_prompt

try:
    from google import genai
    from google.genai import types
except ImportError:  # pragma: no cover - handled at runtime if dependency is missing
    genai = None
    types = None


ModerationDecision = Literal["approved", "rejected", "needs_review"]


class ModerationResult(BaseModel):
    decision: ModerationDecision
    category: str = Field(description="ok, inappropriate, troll, low_effort, spam, unclear")
    reason: str = Field(description="Short practical reason for the moderation decision.")
    confidence: float | None = None


class RewriteResult(BaseModel):
    display_text: str = Field(description="Gameplay-ready rewritten story text.")
    comic_summary: str = Field(description="1-2 sentence visual summary for comic generation.")


@dataclass
class ComicGenerationResult:
    prompt: str
    image_bytes: bytes
    mime_type: str


class GeminiServiceError(RuntimeError):
    pass


def _ensure_sdk_available() -> None:
    if genai is None or types is None:
        raise GeminiServiceError("google-genai dependency is not installed.")
    if not settings.gemini_api_key:
        raise GeminiServiceError("GEMINI_API_KEY is required for story processing.")


@lru_cache(maxsize=1)
def _get_client():
    _ensure_sdk_available()
    return genai.Client(api_key=settings.gemini_api_key)


def _extract_response_text(response) -> str:
    response_text = (getattr(response, "text", None) or "").strip()
    if response_text:
        return response_text

    candidates = getattr(response, "candidates", None) or []
    if candidates:
        parts = getattr(candidates[0].content, "parts", []) or []
        for part in parts:
            part_text = (getattr(part, "text", None) or "").strip()
            if part_text:
                return part_text

    raise GeminiServiceError("Model did not return text output.")


def moderate_story_text(original_text: str) -> ModerationResult:
    prompt = build_moderation_prompt(original_text)
    try:
        response = _get_client().models.generate_content(
            model=settings.gemini_text_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
                response_mime_type="application/json",
                response_json_schema=ModerationResult.model_json_schema(),
            ),
        )
        parsed = getattr(response, "parsed", None)
        if parsed is not None:
            result = ModerationResult.model_validate(parsed)
        else:
            result = ModerationResult.model_validate_json(_extract_response_text(response))
        return result
    except Exception as exc:  # pragma: no cover - network/API behavior
        raise GeminiServiceError(f"Moderation failed: {exc}") from exc


def rewrite_story_for_gameplay(original_text: str) -> RewriteResult:
    prompt = build_rewrite_prompt(original_text)
    try:
        response = _get_client().models.generate_content(
            model=settings.gemini_text_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.35,
                response_mime_type="application/json",
                response_json_schema=RewriteResult.model_json_schema(),
            ),
        )
        parsed = getattr(response, "parsed", None)
        if parsed is not None:
            result = RewriteResult.model_validate(parsed)
        else:
            result = RewriteResult.model_validate_json(_extract_response_text(response))
        cleaned_display = build_display_text(result.display_text, limit=420)
        cleaned_summary = build_display_text(result.comic_summary, limit=280)
        return RewriteResult(display_text=cleaned_display, comic_summary=cleaned_summary)
    except Exception as exc:  # pragma: no cover - network/API behavior
        raise GeminiServiceError(f"Rewrite failed: {exc}") from exc


def generate_comic_for_story(comic_summary: str) -> ComicGenerationResult:
    prompt = build_comic_prompt(comic_summary)
    try:
        response = _get_client().models.generate_content(
            model=settings.gemini_image_model,
            contents=[prompt],
        )
        parts = list(getattr(response, "parts", []) or [])
        if not parts:
            candidates = getattr(response, "candidates", None) or []
            if candidates:
                parts = list(getattr(candidates[0].content, "parts", []) or [])

        for part in parts:
            inline_data = getattr(part, "inline_data", None)
            if inline_data and inline_data.data:
                mime_type = inline_data.mime_type or "image/png"
                raw_data = inline_data.data
                if isinstance(raw_data, str):
                    image_bytes = base64.b64decode(raw_data)
                else:
                    image_bytes = raw_data
                return ComicGenerationResult(
                    prompt=prompt,
                    image_bytes=image_bytes,
                    mime_type=mime_type,
                )
        raise GeminiServiceError("Image generation returned no inline image data.")
    except Exception as exc:  # pragma: no cover - network/API behavior
        raise GeminiServiceError(f"Comic generation failed: {exc}") from exc
