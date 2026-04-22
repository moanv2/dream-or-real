# user_analytics

Analytics dashboard module. Exposes aggregated user-behavior metrics at `GET /api/analytics/dashboard`, rendered on the frontend at `/analytics`.

## Current endpoints

`GET /api/analytics/dashboard` returns:

```json
{
  "overall_accuracy": { "correct": int, "total": int, "pct": float },
  "label_accuracy": {
    "dream": { "correct": int, "total": int, "pct": float },
    "real":  { "correct": int, "total": int, "pct": float }
  },
  "trickiest_stories": [
    { "id": int, "title": str, "label": "dream"|"real", "plays": int, "correct_pct": float }
  ]
}
```

## Adding a visual

1. Add a query function in `queries.py` (pure SQLAlchemy — takes `db: Session`, returns serializable dict/list).
2. Expose it from `router.py` by adding its result to the `dashboard()` response, OR add a dedicated endpoint if the payload is heavy.
3. On the frontend, add a component under `frontend/components/analytics/` and slot it into the 3x2 grid in `frontend/app/analytics/page.tsx` by replacing one of the `<PlaceholderCard />` slots.

Keep queries guarded against empty data (return zeroed structures when `total == 0`).
