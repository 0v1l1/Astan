from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Note
from datetime import datetime, date
from pydantic import BaseModel

router = APIRouter()

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
    today = datetime.utcnow().date()
    notes = db.query(Note).filter(
        Note.date >= datetime.combine(today, datetime.min.time())
    ).all()
    return notes

@router.get("/history")
def get_notes_history(db: Session = Depends(get_db)):
    notes = db.query(Note).order_by(Note.date.desc()).all()
    return notes
