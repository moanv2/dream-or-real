# dream-or-real

`dream-or-real` is a small hackathon game: read a bizarre story, decide whether it was a `dream` or a `real` event, then reveal the answer. The app also accepts anonymous story submissions.

## Stack

- Frontend: Next.js App Router
- Backend: FastAPI, SQLAlchemy 2.x, Pydantic, SQLite
- Infra: Docker and Docker Compose

## Run It

```bash
docker compose up --build
```

Then open:

- Frontend: `http://localhost:3000`
- Backend health check: `http://localhost:8000/health`

## Backend API

- `GET /health`
- `GET /api/stories/random`
- `GET /api/stories/{story_id}/reveal`
- `POST /api/stories/submit`
- `GET /api/stories`

Example submit payload:

```json
{
  "title": "The vending machine knew my nickname",
  "text": "I bought a soda and the machine thanked me by name.",
  "label": "dream",
  "reveal_text": "It was a dream. The machine had my old school nickname and acted offended when I hesitated."
}
```

## Seed Data

On backend startup, the SQLite database is seeded from the repo `stories/` directory:

- `stories/Dreams/*.txt` -> `dream`
- `stories/AmazingStories/*.txt` -> `real`

Seeded stories get:

- a derived `display_text` preview
- a deterministic comic image path from `frontend/public/comics`
- `source=seed`
- `status=approved`

Anonymous submissions are stored in the same database with `source=user` and `status=approved`.
