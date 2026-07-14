from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Note
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from auth import get_current_user_id

router = APIRouter()

LOCAL_TZ = timezone(timedelta(hours=3))


def get_local_date():
    return datetime.now(LOCAL_TZ).date()


class NoteCreate(BaseModel):
    content: str


@router.post("/")
def create_note(
    note: NoteCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    db_note = Note(content=note.content, user_id=user_id)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


@router.get("/")
def get_today_notes(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    today = get_local_date()
    start_of_day = datetime.combine(today, datetime.min.time()).replace(tzinfo=LOCAL_TZ)
    return db.query(Note).filter(
        Note.user_id == user_id,
        Note.date >= start_of_day,
    ).all()


@router.get("/history")
def get_notes_history(
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    return (
        db.query(Note)
        .filter(Note.user_id == user_id)
        .order_by(Note.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
