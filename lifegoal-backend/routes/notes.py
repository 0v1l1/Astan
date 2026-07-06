from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Note
from datetime import datetime, date, timezone, timedelta
from pydantic import BaseModel

router = APIRouter()

LOCAL_TZ = timezone(timedelta(hours=3))

def get_local_date():
    return datetime.now(LOCAL_TZ).date()

class NoteCreate(BaseModel):
    content: str

@router.post("/")
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    db_note = Note(content=note.content)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@router.get("/")
def get_today_notes(db: Session = Depends(get_db)):
    today = get_local_date()
    start_of_day = datetime.combine(today, datetime.min.time()).replace(tzinfo=LOCAL_TZ)
    notes = db.query(Note).filter(
        Note.date >= start_of_day
    ).all()
    return notes

@router.get("/history")
def get_notes_history(db: Session = Depends(get_db)):
    notes = db.query(Note).order_by(Note.date.desc()).all()
    return notes