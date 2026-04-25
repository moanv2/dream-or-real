from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db import Base, SessionLocal, apply_migrations, engine
from app.routers.stories import router as stories_router
from app.seed import seed_stories
from app.analytics.router import router as extras_analytics_router
from user_analytics import router as analytics_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    apply_migrations()
    settings.media_uploads_dir.mkdir(parents=True, exist_ok=True)
    settings.media_generated_comics_dir.mkdir(parents=True, exist_ok=True)
    with SessionLocal() as db:
        seed_stories(db, settings.stories_dir)
    yield


app = FastAPI(title="Dream or Real API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/media", StaticFiles(directory=settings.media_dir, check_dir=False), name="media")


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(stories_router)
app.include_router(analytics_router)
app.include_router(extras_analytics_router)
