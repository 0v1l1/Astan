from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Todo
from datetime import datetime, date, timezone, timedelta
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

# Московский часовой пояс (UTC+3)
LOCAL_TZ = timezone(timedelta(hours=3))

def get_local_date():
    return datetime.now(LOCAL_TZ).date()

def get_local_datetime():
    return datetime.now(LOCAL_TZ)

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
    today = get_local_date()
    start_of_day = datetime.combine(today, datetime.min.time()).replace(tzinfo=LOCAL_TZ)
    
    todos = db.query(Todo).filter(
        (Todo.created_at >= start_of_day) |
        (Todo.is_recurring == True)
    ).all()
    return todos

@router.post("/")
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    db_todo = Todo(
        title=todo.title,
        priority=todo.priority,
        is_recurring=todo.is_recurring,
        recurring_days=todo.recurring_days,
        created_at=get_local_datetime()
    )
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

@router.put("/{todo_id}")
def update_todo(todo_id: int, todo: TodoUpdate, db: Session = Depends(get_db)):
    db_todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    if todo.title is not None:
        db_todo.title = todo.title
    if todo.priority is not None:
        db_todo.priority = todo.priority
    if todo.completed is not None:
        db_todo.completed = todo.completed
        if todo.completed:
            db_todo.completed_date = get_local_datetime()
        else:
            db_todo.completed_date = None

    db.commit()
    db.refresh(db_todo)
    return db_todo

@router.delete("/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    db_todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    db.delete(db_todo)
    db.commit()
    return {"message": "Todo deleted"}

@router.get("/history")
def get_todos_history(db: Session = Depends(get_db)):
    todos = db.query(Todo).order_by(Todo.created_at.desc()).all()
    return todos

@router.get("/completed-percentage")
def get_completion_percentage(db: Session = Depends(get_db)):
    today = get_local_date()
    start_of_day = datetime.combine(today, datetime.min.time()).replace(tzinfo=LOCAL_TZ)
    
    today_todos = db.query(Todo).filter(
        (Todo.created_at >= start_of_day) |
        (Todo.is_recurring == True)
    ).all()

    if not today_todos:
        return {"percentage": 0, "completed": 0, "total": 0}

    completed = sum(1 for t in today_todos if t.completed)
    percentage = round((completed / len(today_todos)) * 100, 1)
    return {"percentage": percentage, "completed": completed, "total": len(today_todos)}