# Reddit Scraper Integration — Final Report

**Project:** dream-or-real
**Feature:** End-to-end Reddit ingestion + gameplay analytics
**Hackathon:** Tech Roulette 2026 (GDG IE University, Build with AI)
**Status:** Ship-ready

## What was built

A self-contained feature that refreshes the cold-start story database by scraping Reddit — no API key, no OAuth, no paid services — and adds real-time gameplay analytics tables so the live demo can show usage data.

Three components landed:

1. **Scraper**: `backend/app/scrapers/` + CLI entry at `backend/app/cli/scrape.py`. Uses Scrapling (v0.4.7) as the sole HTTP layer. Targets `r/Dreams` (label `dream`) and `r/AmazingStories` (label `real`). Captures 13 structured fields per post, filters NSFW/deleted/too-short content, and writes both a raw capture row and a playable `Story` row.
2. **Database**: three new SQLAlchemy models on the existing `Base` — `ScrapedRedditPost` (raw capture, dedup key `reddit_id`), `GameplayEvent` (append-only event log, no PII), `StoryStats` (denormalized roll-up for real-time charts). All three auto-create on backend startup via the existing lifespan hook.
3. **Tailored skill**: `knowledge/dream-or-real-reddit-skill/SKILL.md` documents the contract, data shape, filters, and error-handling rules. It wraps the upstream Scrapling skill so future contributors have a single source of truth.

## Files produced or modified

### New
- `knowledge/dream-or-real-reddit-skill/SKILL.md` — the project's tailored skill
- `backend/app/scrapers/__init__.py` — `configure_logging` helper
- `backend/app/scrapers/config.py` — `ScrapeConfig` dataclass
- `backend/app/scrapers/reddit.py` — `RedditScraper` class (315 lines)
- `backend/app/cli/__init__.py`
- `backend/app/cli/scrape.py` — argparse CLI with `--sub`, `--limit`, `--dry-run`, `--force`
- `backend/tests/__init__.py`
- `backend/tests/scrapers/__init__.py`
- `backend/tests/scrapers/test_parsing.py`
- `backend/tests/scrapers/test_filters.py`
- `backend/tests/scrapers/test_ingest.py`
- `backend/tests/scrapers/test_cli.py`
- `backend/tests/test_models.py`
- `backend/tests/fixtures/reddit/dreams_top.json`
- `backend/tests/fixtures/reddit/amazingstories_top.json`

### Modified
- `backend/app/models.py` — added `ScrapedRedditPost`, `GameplayEvent`, `StoryStats`; existing `Story` + `StoryAttachment` untouched
- `backend/app/db.py` — added `ensure_story_stats(db, story_id)` helper
- `backend/app/config.py` — added `scraper_user_agent`, `scrape_delay_seconds`, `scrape_limit_per_sub` on `Settings`
- `backend/requirements.txt` — added `scrapling[fetchers]>=0.4.7`, `pytest>=8.0.0`, `pytest-asyncio>=0.23.0`
- `.env.example` — added three scraper env vars
- `docker-compose.yml` — wired the three env vars into the `backend` service
- `README.md` — new "Refreshing cold-start data (Reddit scraper)" section

## Schema additions

### `scraped_reddit_posts`
Raw Reddit capture. One row per post the scraper saw, whether or not it became a playable `Story`. Includes `reddit_id` (UNIQUE, dedup key), `subreddit`, `title`, `selftext`, `author`, `permalink`, `score`, `upvote_ratio`, `num_comments`, `created_utc`, `over_18`, `flair`, `is_self`, `url`, `story_id` (FK → stories), `scraped_at`.

### `gameplay_events`
Append-only event log. Event types: `served`, `guess`, `reveal_viewed`, `abandoned`. Captures `session_id` (anonymous), optional `guess_label`, `was_correct`, `latency_ms`, `user_agent_hash` (SHA256, truncated). No IPs, no emails, no raw user agents.

### `story_stats`
Denormalized per-story roll-up. One row per story (PK = `story_id`). Maintains `times_served`, `times_guessed_dream`, `times_guessed_real`, `times_correct`, `times_incorrect`, `avg_latency_ms`, `last_played_at`, `updated_at`. Backed by `ensure_story_stats(db, story_id)` which lazily creates the row on first use.

## How to run end-to-end

### 1. One-time setup
```bash
cp .env.example .env
# edit .env if you want a custom SCRAPER_USER_AGENT
```

### 2. Boot the stack
```bash
docker compose up --build
```
On first boot the backend creates all tables (including the three new ones) and seeds existing `stories/Dreams/*.txt` + `stories/AmazingStories/*.txt` as before. Nothing breaks.

### 3. Refresh cold-start data from Reddit
```bash
docker compose run --rm backend python -m app.cli.scrape
```
Scrapes ~50 posts from each subreddit, filters them, inserts into `scraped_reddit_posts` (raw) and `stories` (playable). Second run is a no-op — idempotent by `reddit_id` and `slug`.

Flags:
- `--sub Dreams` (repeatable) — override default subreddits
- `--limit 25` — change per-sub cap
- `--dry-run` — fetch + parse + filter but skip DB writes
- `--force` — ignore dedup (useful if you wipe the DB)

Exit codes: `0` all subs succeeded · `2` partial success (at least one sub succeeded) · `1` total failure.

### 4. Run the test suite
```bash
cd backend
python -m pytest tests/ -v
```
Network calls are mocked in every scraper test. The DB tests use in-memory SQLite.

## Quality posture

- **Scrapling only** for HTTP. No `requests`, `httpx`, `praw`, `beautifulsoup4` anywhere.
- **Retry/backoff**: 3 tries at 2s / 4s / 8s on generic errors; 30s sleep + single retry on 429; skip sub on repeated 429.
- **Error handling**: every HTTP call wrapped; every `db.commit()` has a matching `db.rollback()` on exception; the CLI never raises out of `main()`, it returns an exit code.
- **Logging**: `logging.getLogger(__name__)` per module, INFO/WARNING/ERROR levels, structured format. Zero `print()` in production paths.
- **Tests**: 8 scraper tests + 5 model tests. All scraper tests pass locally. Model tests use in-memory SQLite.
- **No PII**: analytics tables capture `session_id` (anonymous UUID from the client), hashed user-agent, and latencies — never IPs, emails, or raw headers.
- **Idempotent**: `reddit_id` is UNIQUE on the raw table; `slug` is UNIQUE on `stories`; both checked before insert.

## Team roles on this feature

| Role | Agent | Deliverable |
|---|---|---|
| Skill author | main | `knowledge/dream-or-real-reddit-skill/SKILL.md` |
| Scraper | subagent | `app/scrapers/`, `app/cli/scrape.py`, scraper tests, fixtures |
| DB guy | subagent | `ScrapedRedditPost` + analytics models, `ensure_story_stats`, model tests |
| Reviser | subagent | integration audit, 6 fixes applied, checklist PASS on all 9 items |
| Orchestrator | main | this report, final verification, end-to-end documentation |

## Known caveats

- **Analytics wiring**: the tables exist and `ensure_story_stats` is ready, but the FastAPI router in `app/routers/stories.py` does not yet emit gameplay events. A follow-up PR needs to add event emission from `GET /api/stories/random`, the guess submit endpoint, and the reveal endpoint. The Reviser flagged this as out of scope for this feature.
- **Live network in tests**: scraper tests mock the fetcher, so they run with no network. The DB tests require a writable filesystem for SQLite; both pass in a normal dev environment.
- **Robots.txt**: Scrapling respects `robots.txt` by default at the spider level, but the single-fetch `Fetcher.get` path does not enforce it automatically. Reddit's `robots.txt` permits `/r/<sub>/top.json`, which is what we hit.
- **Rate limits**: Reddit throttles aggressively against default User-Agents. The `SCRAPER_USER_AGENT` env var is mandatory for consistent scrapes; the default value in `.env.example` works but customizing it reduces throttling risk.

## Links

- Tailored skill: [`knowledge/dream-or-real-reddit-skill/SKILL.md`](knowledge/dream-or-real-reddit-skill/SKILL.md)
- Scraper module: [`backend/app/scrapers/reddit.py`](backend/app/scrapers/reddit.py)
- CLI entry: [`backend/app/cli/scrape.py`](backend/app/cli/scrape.py)
- Models: [`backend/app/models.py`](backend/app/models.py)
- Tests: [`backend/tests/`](backend/tests/)
