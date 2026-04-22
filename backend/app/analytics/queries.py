"""Analytics queries.

These functions read from the gameplay/story tables and return the typed
data shapes defined in :mod:`app.analytics.schemas`. They are completely
side-effect-free and do no rendering.
"""

from __future__ import annotations

import re
import statistics
from collections import Counter
from typing import Iterable

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.analytics.schemas import (
    DreamLexicon,
    LengthBucket,
    LexiconWord,
    StoryLengthShowdown,
    TricksterEntry,
    TricksterLeaderboard,
)
from app.models import GameplayEvent, Story


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


_WORD_RE = re.compile(r"[A-Za-z']+")

# Tiny built-in stoplist. Keeps the dependency surface zero (no NLTK download).
# These are the most common English fillers — removing them surfaces the
# actually distinctive words.
_STOPWORDS: frozenset[str] = frozenset(
    """
    a an and the of to in is it i was were be been being am are
    on at by for with as from this that these those there here
    not no nor or but so if then than too very can could would should will
    just only also more most some any all any one two
    he she they we you me him her them his hers their our ours yours my mine
    do does did done doing have has had having get got getting
    s t d ll re ve m
    """.split()
)


def _tokenize(text: str) -> list[str]:
    """Lowercase, alphanum-only word tokens with stopwords stripped."""
    if not text:
        return []
    return [
        token.lower()
        for token in _WORD_RE.findall(text)
        if len(token) > 2 and token.lower() not in _STOPWORDS
    ]


def _safe_div(num: float, denom: float) -> float:
    return float(num / denom) if denom else 0.0


def _word_count(text: str) -> int:
    return len(_WORD_RE.findall(text or ""))


# ---------------------------------------------------------------------------
# 1. Trickster leaderboard
# ---------------------------------------------------------------------------


def compute_trickster_leaderboard(
    db: Session,
    min_plays: int = 1,
    top_n: int = 10,
) -> TricksterLeaderboard:
    """Stories ranked by how often players guessed wrong on them.

    Only ``event_type == 'guess'`` events are counted (filtered via
    ``was_correct IS NOT NULL`` for resilience against missing/legacy event
    types).
    """
    correct_expr = func.sum(case((GameplayEvent.was_correct.is_(True), 1), else_=0))
    plays_expr = func.count(GameplayEvent.id)

    rows = db.execute(
        select(
            Story.id,
            Story.title,
            Story.label,
            plays_expr.label("plays"),
            correct_expr.label("correct"),
        )
        .join(GameplayEvent, GameplayEvent.story_id == Story.id)
        .where(GameplayEvent.was_correct.is_not(None))
        .group_by(Story.id, Story.title, Story.label)
        .having(plays_expr >= min_plays)
        # Lowest accuracy first (= most-tricky), tie-break by play count.
        .order_by(
            (correct_expr * 1.0 / plays_expr).asc(),
            plays_expr.desc(),
        )
    ).all()

    entries: list[TricksterEntry] = []
    for row in rows[:top_n]:
        accuracy = _safe_div(row.correct, row.plays)
        entries.append(
            TricksterEntry(
                story_id=row.id,
                title=(row.title or f"Story #{row.id}").strip() or f"Story #{row.id}",
                label=row.label,
                times_played=int(row.plays),
                times_correct=int(row.correct),
                accuracy=accuracy,
                fooled_pct=1.0 - accuracy,
            )
        )

    return TricksterLeaderboard(
        entries=entries,
        min_plays_threshold=min_plays,
        has_data=bool(entries),
    )


# ---------------------------------------------------------------------------
# 2. Dream lexicon
# ---------------------------------------------------------------------------


def _collect_corpus_counts(stories: Iterable[Story]) -> tuple[Counter[str], int]:
    """Return ``(word_counter, total_token_count)`` over a story iterable."""
    counter: Counter[str] = Counter()
    total = 0
    for story in stories:
        tokens = _tokenize(story.original_text or "")
        counter.update(tokens)
        total += len(tokens)
    return counter, total


def compute_dream_lexicon(
    db: Session,
    top_n: int = 15,
    min_occurrences: int = 3,
) -> DreamLexicon:
    """Words that skew strongly toward dream stories vs real stories.

    "Dreaminess" is computed as the difference of relative frequencies:
    ``dream_count/dream_total - real_count/real_total``. A positive value
    means the word is more dream-coded than real-coded.

    Words appearing fewer than ``min_occurrences`` times in the *combined*
    corpus are dropped to avoid noisy long-tail entries.
    """
    dream_stories = list(db.scalars(select(Story).where(Story.label == "dream")))
    real_stories = list(db.scalars(select(Story).where(Story.label == "real")))

    dream_counts, dream_total = _collect_corpus_counts(dream_stories)
    real_counts, real_total = _collect_corpus_counts(real_stories)

    has_data = bool(dream_total and real_total)
    if not has_data:
        return DreamLexicon(
            dreamy_words=[],
            real_words=[],
            dream_story_count=len(dream_stories),
            real_story_count=len(real_stories),
            has_data=False,
        )

    vocabulary = set(dream_counts) | set(real_counts)
    scored: list[LexiconWord] = []
    for word in vocabulary:
        d = dream_counts.get(word, 0)
        r = real_counts.get(word, 0)
        if d + r < min_occurrences:
            continue
        score = (d / dream_total) - (r / real_total)
        scored.append(
            LexiconWord(
                word=word,
                dream_count=d,
                real_count=r,
                dreaminess=score,
            )
        )

    scored.sort(key=lambda w: w.dreaminess, reverse=True)
    dreamy = scored[:top_n]
    real = list(reversed(scored[-top_n:])) if len(scored) >= top_n else []

    return DreamLexicon(
        dreamy_words=dreamy,
        real_words=real,
        dream_story_count=len(dream_stories),
        real_story_count=len(real_stories),
        has_data=True,
    )


# ---------------------------------------------------------------------------
# 3. Story length showdown
# ---------------------------------------------------------------------------


def compute_story_length_showdown(
    db: Session,
    bucket_size: int = 50,
    max_buckets: int = 20,
) -> StoryLengthShowdown:
    """Word-count distribution per label, plus summary stats.

    The histogram uses fixed-width bins of ``bucket_size`` words, capped at
    ``max_buckets`` bins (anything past the cap is collected into the final
    bin's range — preventing extremely long stories from stretching the chart
    flat).
    """
    dream_lengths: list[int] = []
    real_lengths: list[int] = []

    for story in db.scalars(select(Story)):
        wc = _word_count(story.original_text or "")
        if wc <= 0:
            continue
        if story.label == "dream":
            dream_lengths.append(wc)
        elif story.label == "real":
            real_lengths.append(wc)

    has_data = bool(dream_lengths or real_lengths)
    if not has_data:
        return StoryLengthShowdown(
            buckets=[],
            dream_avg_words=0.0,
            real_avg_words=0.0,
            dream_median_words=0,
            real_median_words=0,
            dream_story_count=0,
            real_story_count=0,
            has_data=False,
        )

    cap = bucket_size * max_buckets

    def _binned_counts(lengths: list[int]) -> Counter[int]:
        counts: Counter[int] = Counter()
        for length in lengths:
            capped = min(length, cap - 1)
            bin_index = capped // bucket_size
            counts[bin_index] += 1
        return counts

    dream_bins = _binned_counts(dream_lengths)
    real_bins = _binned_counts(real_lengths)

    used_indices = sorted(set(dream_bins) | set(real_bins))
    if used_indices:
        last = used_indices[-1]
        # Fill in any empty bins between the first and last used so the chart
        # has no visual gaps.
        used_indices = list(range(used_indices[0], last + 1))

    buckets = [
        LengthBucket(
            bucket_start=i * bucket_size,
            bucket_end=(i + 1) * bucket_size,
            dream_count=dream_bins.get(i, 0),
            real_count=real_bins.get(i, 0),
        )
        for i in used_indices
    ]

    return StoryLengthShowdown(
        buckets=buckets,
        dream_avg_words=(sum(dream_lengths) / len(dream_lengths)) if dream_lengths else 0.0,
        real_avg_words=(sum(real_lengths) / len(real_lengths)) if real_lengths else 0.0,
        dream_median_words=int(statistics.median(dream_lengths)) if dream_lengths else 0,
        real_median_words=int(statistics.median(real_lengths)) if real_lengths else 0,
        dream_story_count=len(dream_lengths),
        real_story_count=len(real_lengths),
        has_data=True,
    )
