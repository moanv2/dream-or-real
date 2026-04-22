"""Matplotlib renderers for the analytics module.

Each renderer returns ``bytes`` containing a PNG payload, ready to be served
straight from a FastAPI endpoint:

    @router.get("/analytics/trickster.png")
    def trickster_png(db: Session = Depends(get_db)):
        data = compute_trickster_leaderboard(db)
        return Response(content=render_trickster_leaderboard(data), media_type="image/png")

The matplotlib backend is forced to ``Agg`` so this module is safe to import
in headless containers (no display server required).
"""

from __future__ import annotations

import io

import matplotlib

matplotlib.use("Agg")  # Must precede the pyplot import. Headless-safe.

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import Patch  # noqa: E402

from app.analytics.schemas import (  # noqa: E402
    DreamLexicon,
    StoryLengthShowdown,
    TricksterLeaderboard,
)


# Brand-ish palette. Purple = dream, cyan = real-life. Kept in one place so
# the frontend can mirror these colors when it renders the JSON variant.
DREAM_COLOR = "#7C3AED"
REAL_COLOR = "#06B6D4"
GRID_COLOR = "#E5E7EB"
TEXT_COLOR = "#111827"
MUTED_COLOR = "#6B7280"
BG_COLOR = "#FFFFFF"


def _empty_figure(message: str) -> bytes:
    """Render a blank-state PNG when there's no data to show yet."""
    fig, ax = plt.subplots(figsize=(8, 4), facecolor=BG_COLOR)
    ax.set_facecolor(BG_COLOR)
    ax.text(
        0.5, 0.5, message,
        ha="center", va="center",
        fontsize=14, color=MUTED_COLOR,
        transform=ax.transAxes,
    )
    ax.axis("off")
    return _save_png(fig)


def _save_png(fig) -> bytes:
    buffer = io.BytesIO()
    fig.savefig(
        buffer,
        format="png",
        dpi=150,
        bbox_inches="tight",
        facecolor=fig.get_facecolor(),
        edgecolor="none",
    )
    plt.close(fig)
    buffer.seek(0)
    return buffer.getvalue()


def _truncate(text: str, limit: int = 50) -> str:
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


# ---------------------------------------------------------------------------
# 1. Trickster leaderboard
# ---------------------------------------------------------------------------


def render_trickster_leaderboard(data: TricksterLeaderboard) -> bytes:
    """Horizontal bars, hardest stories on top."""
    if not data.has_data:
        return _empty_figure("No gameplay data yet — start guessing!")

    entries = data.entries
    titles = [_truncate(e.title) for e in entries]
    fooled_pcts = [e.fooled_pct * 100 for e in entries]
    colors = [DREAM_COLOR if e.label == "dream" else REAL_COLOR for e in entries]

    height = max(4.5, 0.45 * len(entries) + 1.5)
    fig, ax = plt.subplots(figsize=(10, height), facecolor=BG_COLOR)
    ax.set_facecolor(BG_COLOR)

    y_pos = list(range(len(entries)))
    bars = ax.barh(
        y_pos, fooled_pcts,
        color=colors, edgecolor="white", linewidth=0.6,
    )

    ax.set_yticks(y_pos)
    ax.set_yticklabels(titles, fontsize=9, color=TEXT_COLOR)
    ax.invert_yaxis()  # most-tricky at top
    ax.set_xlabel("% of guesses that got it WRONG", color=TEXT_COLOR)
    ax.set_xlim(0, 105)
    ax.axvline(50, color=GRID_COLOR, linestyle="--", linewidth=1, zorder=0)

    for bar, entry in zip(bars, entries):
        ax.text(
            bar.get_width() + 1.5,
            bar.get_y() + bar.get_height() / 2,
            f"{entry.times_played - entry.times_correct}/{entry.times_played} fooled",
            va="center", fontsize=8, color=MUTED_COLOR,
        )

    ax.set_title(
        f"Trickster Leaderboard — top {len(entries)} stories that fooled the most players",
        fontsize=13, color=TEXT_COLOR, pad=14, loc="left",
    )

    legend_handles = [
        Patch(facecolor=DREAM_COLOR, label="Dream story"),
        Patch(facecolor=REAL_COLOR, label="Real story"),
    ]
    ax.legend(handles=legend_handles, loc="lower right", framealpha=0.95)

    for spine in ("top", "right"):
        ax.spines[spine].set_visible(False)
    ax.tick_params(colors=TEXT_COLOR)
    ax.grid(axis="x", color=GRID_COLOR, linewidth=0.5, zorder=0)

    return _save_png(fig)


# ---------------------------------------------------------------------------
# 2. Dream lexicon
# ---------------------------------------------------------------------------


def render_dream_lexicon(data: DreamLexicon) -> bytes:
    """Two-sided horizontal bar chart: dreamy vs real-coded words."""
    if not data.has_data or (not data.dreamy_words and not data.real_words):
        return _empty_figure("Need at least one dream and one real story to compare vocabularies.")

    fig, (ax_dream, ax_real) = plt.subplots(
        1, 2, figsize=(12, 6), facecolor=BG_COLOR,
        gridspec_kw={"wspace": 0.45},
    )

    def _draw(ax, words, color, title_emoji, side_title):
        if not words:
            ax.text(0.5, 0.5, "(not enough data)", ha="center", va="center",
                    color=MUTED_COLOR, transform=ax.transAxes, fontsize=11)
            ax.axis("off")
            return

        # When drawing the "real" side, flip the score sign so longer bar = stronger signal.
        scores = [abs(w.dreaminess) * 1000 for w in words]
        labels = [w.word for w in words]
        y_pos = list(range(len(words)))

        ax.barh(y_pos, scores, color=color, edgecolor="white", linewidth=0.6)
        ax.set_yticks(y_pos)
        ax.set_yticklabels(labels, fontsize=10, color=TEXT_COLOR)
        ax.invert_yaxis()
        ax.set_facecolor(BG_COLOR)
        ax.set_xlabel("relative frequency skew (×1000)", color=MUTED_COLOR, fontsize=9)
        title = f"{title_emoji}  {side_title}".strip()
        ax.set_title(title, fontsize=13, color=TEXT_COLOR, pad=10, loc="left")

        for i, word in enumerate(words):
            ax.text(
                scores[i] + max(scores) * 0.02,
                i,
                f"{word.dream_count}d / {word.real_count}r",
                va="center", fontsize=8, color=MUTED_COLOR,
            )

        for spine in ("top", "right"):
            ax.spines[spine].set_visible(False)
        ax.tick_params(colors=TEXT_COLOR)
        ax.grid(axis="x", color=GRID_COLOR, linewidth=0.5, zorder=0)

    _draw(ax_dream, data.dreamy_words, DREAM_COLOR, "", "Dreamiest words")
    _draw(ax_real, data.real_words, REAL_COLOR, "", "Most 'real-life' words")

    fig.suptitle(
        f"Dream Lexicon — vocabulary that gives each genre away "
        f"({data.dream_story_count} dreams, {data.real_story_count} real stories)",
        fontsize=12, color=TEXT_COLOR, y=1.02,
    )

    return _save_png(fig)


# ---------------------------------------------------------------------------
# 3. Story length showdown
# ---------------------------------------------------------------------------


def render_story_length_showdown(data: StoryLengthShowdown) -> bytes:
    """Side-by-side bars per word-count bin, plus an average annotation."""
    if not data.has_data or not data.buckets:
        return _empty_figure("Add some stories first to see the length showdown.")

    centers = [(b.bucket_start + b.bucket_end) / 2 for b in data.buckets]
    width = (data.buckets[0].bucket_end - data.buckets[0].bucket_start) * 0.4
    dream_counts = [b.dream_count for b in data.buckets]
    real_counts = [b.real_count for b in data.buckets]

    fig, ax = plt.subplots(figsize=(11, 5.5), facecolor=BG_COLOR)
    ax.set_facecolor(BG_COLOR)

    ax.bar(
        [c - width / 2 for c in centers], dream_counts, width=width,
        color=DREAM_COLOR, edgecolor="white", linewidth=0.6,
        label=f"Dreams (avg {data.dream_avg_words:.0f}w, median {data.dream_median_words}w)",
    )
    ax.bar(
        [c + width / 2 for c in centers], real_counts, width=width,
        color=REAL_COLOR, edgecolor="white", linewidth=0.6,
        label=f"Real stories (avg {data.real_avg_words:.0f}w, median {data.real_median_words}w)",
    )

    # Vertical mean lines to drive the comparison home.
    ax.axvline(
        data.dream_avg_words, color=DREAM_COLOR, linestyle="--", linewidth=1.2,
        alpha=0.7,
    )
    ax.axvline(
        data.real_avg_words, color=REAL_COLOR, linestyle="--", linewidth=1.2,
        alpha=0.7,
    )

    bucket_size = data.buckets[0].bucket_end - data.buckets[0].bucket_start
    last_label = f"{data.buckets[-1].bucket_start}+"
    tick_positions = [c for c in centers]
    tick_labels = [
        f"{b.bucket_start}–{b.bucket_end}" if i < len(data.buckets) - 1 else last_label
        for i, b in enumerate(data.buckets)
    ]
    ax.set_xticks(tick_positions)
    ax.set_xticklabels(tick_labels, rotation=45, ha="right", fontsize=8, color=TEXT_COLOR)

    ax.set_xlabel("Word count", color=TEXT_COLOR)
    ax.set_ylabel("Number of stories", color=TEXT_COLOR)

    winner = "dreams" if data.dream_avg_words > data.real_avg_words else "real stories"
    diff_pct = abs(data.dream_avg_words - data.real_avg_words) / max(
        min(data.dream_avg_words, data.real_avg_words), 1.0
    ) * 100
    ax.set_title(
        f"Story Length Showdown — {winner} are {diff_pct:.0f}% longer on average "
        f"(bins of {bucket_size} words)",
        fontsize=13, color=TEXT_COLOR, pad=14, loc="left",
    )

    ax.legend(loc="upper right", framealpha=0.95)
    for spine in ("top", "right"):
        ax.spines[spine].set_visible(False)
    ax.tick_params(colors=TEXT_COLOR)
    ax.grid(axis="y", color=GRID_COLOR, linewidth=0.5)

    return _save_png(fig)
