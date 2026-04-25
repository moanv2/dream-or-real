# dream-or-real

**Live demo:** https://moanv2.github.io/dream-or-real/

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

## Quick start (run locally)

Prerequisites: Docker Desktop (with Docker Compose v2) and a Google Gemini API key.

1. Clone the repo and enter it:

   ```bash
   git clone https://github.com/moanv2/dream-or-real.git
   cd dream-or-real
   ```

2. Create your `.env`:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and set `GEMINI_API_KEY=<your key>`. The other defaults work
   out of the box for local dev.

3. Build and start both services:

   ```bash
   docker compose up --build
   ```

4. Open the app:

   - Frontend: http://localhost:3000
   - Backend health: http://localhost:8000/health
   - API docs: http://localhost:8000/docs

To stop: `Ctrl+C`, then `docker compose down` (add `-v` to also wipe the
SQLite volume and start fresh).

## Run the frontend against the live/deployed backend

The GitHub Pages build at https://moanv2.github.io/dream-or-real/ is a static
export of `frontend/` pointed at a hosted backend via the
`NEXT_PUBLIC_API_BASE_URL` repo variable (see
`.github/workflows/deploy-pages.yml`).

To run the frontend locally without Docker:

```bash
cd frontend
npm ci
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 npm run dev
```

On Windows PowerShell:

```powershell
cd frontend
npm ci
$env:NEXT_PUBLIC_API_BASE_URL="http://localhost:8000"; npm run dev
```

## Environment variables

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
- `FRONTEND_ORIGIN` (comma-separated; the deployed frontend origin
  `https://moanv2.github.io` must be included for CORS in production)
- `STORIES_DIR`
- `MEDIA_DIR`
- `NEXT_PUBLIC_API_BASE_URL` (baked into the Next.js build at build time)

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

To import local `stories/` files through the full AI pipeline (moderation ->
rewrite/title -> comic generation) as playable stories, run:

```bash
docker compose run --rm backend python scripts/process_seed_stories.py
```

Useful flags:
- `--limit N` process only first N files
- `--force` reprocess even if identical text was already imported
- `--stories-dir /stories` override source folder path

## Refreshing cold-start data (Reddit scraper)

Cold-start stories are scraped directly from Reddit's public JSON endpoints
(no API key or OAuth needed). Posts are persisted in the
`scraped_reddit_posts` table inside `data/dream_or_real.db`, de-duplicated on
`reddit_id`, and can later be linked to gameplay `stories` via `story_id`.

Run inside the container:

```bash
docker compose run --rm backend python -m app.scrape_reddit --limit 20 --sort hot
```

Or from a local venv (from the `backend/` directory):

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m app.scrape_reddit --limit 20
```

CLI flags:
- `--subreddit NAME` (repeatable; defaults to `dreams` and `amazingstories`)
- `--limit N` — max posts fetched per subreddit (default 20)
- `--sort {hot,new,top,rising}` (default `hot`)
- `--include-empty` — also store link-only posts with no body
- `--delay-seconds N` — override the inter-subreddit delay
- `-v/--verbose`

Scraper configuration (env vars):
- `SCRAPER_USER_AGENT` — custom `User-Agent` for requests
- `SCRAPE_LIMIT_PER_SUB` — default posts per subreddit (default 50)
- `SCRAPE_DELAY_SECONDS` — delay between subreddit requests (default 2)

### Security model

The scraper is designed to run safely in an untrusted sandbox:

- **Read-only, no credentials.** It only hits Reddit's public HTTPS JSON
  endpoints. No API keys, no OAuth, no cookies are stored or sent.
- **TLS enforced.** `verify=True` on every request; redirects are restricted
  to public hosts (`follow_redirects="safe"`) so the scraper cannot be
  redirected to an internal/private IP.
- **Input allow-listing.** Subreddit names are validated against a strict
  regex (`^[A-Za-z0-9_]{2,21}$`) before being interpolated into the URL,
  preventing path traversal or header injection through CLI input.
- **Parameterized DB writes.** All inserts/updates go through the SQLAlchemy
  ORM; there is no string-built SQL.
- **Length-capped fields.** Every free-text field is truncated to its
  column's `VARCHAR` limit before hitting the database.
- **Bounded I/O.** A 15-second timeout, 3-retry cap, and configurable
  inter-request delay keep the scraper from hanging or flooding upstream.
- **Isolated environment.** Run it inside the Docker container or in a
  dedicated Python venv (`backend/.venv`) so Scrapling and its transitive
  deps (curl_cffi, browser-impersonation payloads) never pollute your
  system Python.

Tests (no network I/O) live at `backend/tests/test_reddit_scraper.py`:

```bash
cd backend && .venv/bin/python -m pytest tests/test_reddit_scraper.py
```

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
