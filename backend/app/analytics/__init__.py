"""Fun analytics + visualizations for the dream-or-real game.

Each visualization exposes two functions:

* ``compute_<name>(db)`` — pure data, returns a Pydantic model. Use this from
  the API layer when the frontend renders charts itself (Recharts, Chart.js).
* ``render_<name>(data)`` — returns a PNG ``bytes`` payload. Use this when the
  frontend wants a static image (`<img src="/api/analytics/foo.png" />`).

Three visualizations are provided:

1. ``trickster_leaderboard``  — the stories that fooled the most players
2. ``dream_lexicon``          — words that appear in dream stories far more
   often than in real stories ("dreamiest" words)
3. ``story_length_showdown``  — overlaid distribution of word counts for
   dream vs real stories
"""

from app.analytics.queries import (
    compute_dream_lexicon,
    compute_story_length_showdown,
    compute_trickster_leaderboard,
)
from app.analytics.visualizations import (
    render_dream_lexicon,
    render_story_length_showdown,
    render_trickster_leaderboard,
)

__all__ = [
    "compute_trickster_leaderboard",
    "compute_dream_lexicon",
    "compute_story_length_showdown",
    "render_trickster_leaderboard",
    "render_dream_lexicon",
    "render_story_length_showdown",
]
