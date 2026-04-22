from __future__ import annotations

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.models import GameplayEvent, Story

MIN_PLAYS_FOR_TRICKIEST = 3
TRICKIEST_LIMIT = 5


def overall_accuracy(db: Session) -> dict:
    row = db.execute(
        select(
            func.count().label("total"),
            func.sum(case((GameplayEvent.was_correct.is_(True), 1), else_=0)).label("correct"),
        ).where(GameplayEvent.was_correct.isnot(None))
    ).one()

    total = int(row.total or 0)
    correct = int(row.correct or 0)
    pct = (correct / total * 100) if total else 0.0

    return {"correct": correct, "total": total, "pct": round(pct, 1)}


def label_accuracy(db: Session) -> dict:
    rows = db.execute(
        select(
            Story.label,
            func.count().label("total"),
            func.sum(case((GameplayEvent.was_correct.is_(True), 1), else_=0)).label("correct"),
        )
        .join(Story, Story.id == GameplayEvent.story_id)
        .where(GameplayEvent.was_correct.isnot(None))
        .group_by(Story.label)
    ).all()

    result = {
        "dream": {"correct": 0, "total": 0, "pct": 0.0},
        "real": {"correct": 0, "total": 0, "pct": 0.0},
    }
    for row in rows:
        if row.label not in result:
            continue
        total = int(row.total or 0)
        correct = int(row.correct or 0)
        pct = (correct / total * 100) if total else 0.0
        result[row.label] = {"correct": correct, "total": total, "pct": round(pct, 1)}

    return result


def trickiest_stories(db: Session) -> list[dict]:
    total_col = func.count().label("total")
    correct_col = func.sum(case((GameplayEvent.was_correct.is_(True), 1), else_=0)).label("correct")

    rows = db.execute(
        select(
            Story.id,
            Story.title,
            Story.label,
            total_col,
            correct_col,
        )
        .join(GameplayEvent, GameplayEvent.story_id == Story.id)
        .where(GameplayEvent.was_correct.isnot(None))
        .group_by(Story.id, Story.title, Story.label)
        .having(total_col >= MIN_PLAYS_FOR_TRICKIEST)
        .order_by((correct_col * 1.0 / total_col).asc(), total_col.desc())
        .limit(TRICKIEST_LIMIT)
    ).all()

    return [
        {
            "id": row.id,
            "title": row.title or "Untitled",
            "label": row.label,
            "plays": int(row.total),
            "correct_pct": round(float(row.correct or 0) / int(row.total) * 100, 1),
        }
        for row in rows
    ]
