from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Todo
from datetime import datetime, date
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

class TodoCreate(BaseModel):
    title: str
    priority: str  # high, medium, low
    is_recurring: bool = False
    recurring_days: Optional[str] = None  # "0,2,4" for Mon,Wed,Fri

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    priority: Optional[str] = None
    completed: Optional[bool] = None

@router.get("/")
def get_todos(db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    todos = db.query(Todo).filter(
        (Todo.created_at >= datetime.combine(today, datetime.min.time())) |
        (Todo.is_recurring == True)
    ).all()
    return todos

@router.post("/")
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    db_todo = Todo(
        title=todo.title,
        priority=todo.priority,
        is_recurring=todo.is_recurring,
        recurring_days=todo.recurring_days
    )
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

@router.put("/{todo_id}")
def update_todo(todo_id: int, todo: TodoUpdate, db: Session = Depends(get_db)):
    db_todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not db_todo:
        return {"error": "Todo not found"}

    if todo.title:
        db_todo.title = todo.title
    if todo.priority:
        db_todo.priority = todo.priority
    if todo.completed is not None:
        db_todo.completed = todo.completed
        if todo.completed:
            db_todo.completed_date = datetime.utcnow()

    db.commit()
    db.refresh(db_todo)
    return db_todo

@router.get("/history")
def get_todos_history(db: Session = Depends(get_db)):
    todos = db.query(Todo).order_by(Todo.created_at.desc()).all()
    return todos

@router.get("/completed-percentage")
def get_completion_percentage(db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    today_todos = db.query(Todo).filter(
        (Todo.created_at >= datetime.combine(today, datetime.min.time())) |
        (Todo.is_recurring == True)
    ).all()

    if not today_todos:
        return {"percentage": 0}

    completed = sum(1 for t in today_todos if t.completed)
    percentage = (completed / len(today_todos)) * 100
    return {"percentage": percentage}
