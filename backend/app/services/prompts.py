from __future__ import annotations

MODERATION_PROMPT_TEMPLATE = """You are moderating an anonymous short-story game submission.

Evaluate the ORIGINAL raw text and classify it.

Rules:
- Reject inappropriate sexual content, explicit graphic violence, hateful abuse, or harassment.
- Reject obvious troll/fabricated low-quality submissions that break the game spirit.
- Reject low-effort stories that are trivial or boring (for example: "I ate an apple.").
- Reject spam or gibberish.
- Use "needs_review" only if uncertain.
- Keep reason short and practical for a user-safe explanation.

Submission text:
---
{story_text}
---
"""

REWRITE_PROMPT_TEMPLATE = """Rewrite the following short story for gameplay in a "dream or real" guessing game.

Constraints:
- Preserve the actual events and tone from the original.
- Keep ambiguity so players can still guess dream vs real.
- Do not explicitly reveal whether it is dream or real.
- Keep a natural narrative voice, not robotic.
- Remove filler and redundancy.
- Do not invent new facts.
- Target length: 280 to 420 characters.
- Also produce a concise 1-2 sentence visual summary for comic generation.

Original text:
---
{story_text}
---
"""

COMIC_PROMPT_TEMPLATE = """Create a single colorful comic-style illustration of the scene below.

Style requirements:
- one-page comic panel or storyboard frame
- clean composition, readable shapes, expressive characters
- safe for work
- no dialogue bubbles or tiny unreadable text
- slightly uncanny/funny mood
- avoid photorealism, prefer illustrated editorial-comic look
- do not hint whether the story is dream or real

Scene summary:
{comic_summary}
"""


def build_moderation_prompt(story_text: str) -> str:
    return MODERATION_PROMPT_TEMPLATE.format(story_text=story_text)


def build_rewrite_prompt(story_text: str) -> str:
    return REWRITE_PROMPT_TEMPLATE.format(story_text=story_text)


def build_comic_prompt(comic_summary: str) -> str:
    return COMIC_PROMPT_TEMPLATE.format(comic_summary=comic_summary.strip())
