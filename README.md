# dream-or-real

`dream-or-real` is a hackathon game:
- read a short bizarre story + comic image
- guess `dream` or `real`
- reveal the answer and context
- submit anonymous stories

This version adds AI-powered processing for **user-submitted stories**:
- moderation/filtering on original raw text
- rewrite/summarization for gameplay display
- comic generation (Nano Banana Pro)
- optional image attachments shown only on reveal

## Stack

- Frontend: Next.js (App Router)
- Backend: FastAPI, SQLAlchemy 2.x, Pydantic, SQLite
- AI: Google Gemini via `google-genai` Python SDK
- Infra: Docker + Docker Compose

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

Required for AI processing:
- `GEMINI_API_KEY`
- `GEMINI_TEXT_MODEL` (default: `gemini-2.5-flash`)
- `GEMINI_IMAGE_MODEL` (default: `gemini-3-pro-image-preview`)

Core app vars:
- `DATABASE_URL`
- `FRONTEND_ORIGIN`
- `STORIES_DIR`
- `MEDIA_DIR`
- `NEXT_PUBLIC_API_BASE_URL`

## Run with Docker Compose

```bash
docker compose up --build
```

Then open:
- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:8000/health`

## Submission Processing Pipeline

For `source=user` stories:
1. Store original text exactly as submitted (`original_text`)
2. Moderate original text with Gemini structured output
3. If approved, rewrite for gameplay (`display_text`)
4. Generate comic image from rewrite summary (Nano Banana Pro)
5. Save generated comic under backend media storage

If moderation rejects:
- story is stored
- status becomes `rejected`
- no rewrite/comic generation

If rewrite fails:
- story stays approved and playable
- backend falls back to deterministic shortening
- processing state is marked failed

If comic generation fails:
- story stays approved and playable
- comic remains empty
- processing state is marked failed

## Seed Stories

On backend startup, seed data loads from:
- `stories/Dreams/*.txt` -> `dream`
- `stories/AmazingStories/*.txt` -> `real`

Seeded stories are not retroactively AI-processed.

## Refreshing cold-start data (Reddit scraper)

Cold-start stories can be regenerated from Reddit without any API key:

```bash
docker compose run --rm backend python -m app.cli.scrape
```

This fetches ~50 posts from r/Dreams and r/AmazingStories, filters them, and inserts into the database. See `backend/app/scrapers/` for details. Uses Scrapling under the hood.

Scraper configuration:
- `SCRAPER_USER_AGENT`: Custom User-Agent for requests
- `SCRAPE_LIMIT_PER_SUB`: Posts per subreddit (default 50)
- `SCRAPE_DELAY_SECONDS`: Delay between requests (default 2)

## Media Storage

Stored locally under `MEDIA_DIR`:
- uploads: `uploads/`
- generated comics: `generated_comics/`

Served by backend at:
- `/media/uploads/...`
- `/media/generated_comics/...`

## API Endpoints

- `GET /health`
- `GET /api/stories`
- `GET /api/stories/random`
- `GET /api/stories/{story_id}/reveal`
- `POST /api/stories/submit` (multipart form)

### Submit Endpoint Contract

`POST /api/stories/submit` (multipart form-data):
- `text` (required)
- `label` (`dream` or `real`, required)
- `attachments` (optional, multiple image files)

Example:

```bash
curl -X POST http://localhost:8000/api/stories/submit \
  -F "text=I woke up on a train that seemed to move underwater." \
  -F "label=dream" \
  -F "attachments=@/path/to/photo.jpg"
```
