from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Todo
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import Optional
from auth import get_current_user_id

router = APIRouter()

# Moscow timezone (UTC+3), used everywhere in this file so "today" agrees
# with the rest of the app.
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


def _serialize(todo: Todo, today) -> dict:
    # A recurring todo is a single row reused every day, so its stored
    # `completed` flag can't mean "done today" — otherwise, once you check
    # it off once, it reads as done forever. For recurring items we treat
    # it as done only if completed_date falls on today; regular one-off
    # todos keep using the stored flag as-is.
    is_done_today = todo.completed
    if todo.is_recurring:
        is_done_today = bool(todo.completed_date and todo.completed_date.date() == today)

    return {
        "id": todo.id,
        "title": todo.title,
        "priority": todo.priority,
        "completed": is_done_today,
        "completed_date": todo.completed_date,
        "created_at": todo.created_at,
        "is_recurring": todo.is_recurring,
        "recurring_days": todo.recurring_days,
    }


@router.get("/")
def get_todos(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    today = get_local_date()
    start_of_day = datetime.combine(today, datetime.min.time()).replace(tzinfo=LOCAL_TZ)

    todos = db.query(Todo).filter(
        Todo.user_id == user_id,
        (Todo.created_at >= start_of_day) | (Todo.is_recurring == True),  # noqa: E712
    ).all()
    return [_serialize(t, today) for t in todos]


@router.post("/")
def create_todo(
    todo: TodoCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    db_todo = Todo(
        title=todo.title,
        priority=todo.priority,
        is_recurring=todo.is_recurring,
        recurring_days=todo.recurring_days,
        created_at=get_local_datetime(),
        user_id=user_id,
    )
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return _serialize(db_todo, get_local_date())


def _get_owned_todo(todo_id: int, user_id: int, db: Session) -> Todo:
    db_todo = db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == user_id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return db_todo


@router.put("/{todo_id}")
def update_todo(
    todo_id: int,
    todo: TodoUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    db_todo = _get_owned_todo(todo_id, user_id, db)

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
    return _serialize(db_todo, get_local_date())


@router.delete("/{todo_id}")
def delete_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    db_todo = _get_owned_todo(todo_id, user_id, db)
    db.delete(db_todo)
    db.commit()
    return {"message": "Todo deleted"}


@router.get("/history")
def get_todos_history(
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    today = get_local_date()
    todos = (
        db.query(Todo)
        .filter(Todo.user_id == user_id)
        .order_by(Todo.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [_serialize(t, today) for t in todos]


@router.get("/completed-percentage")
def get_completion_percentage(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    today = get_local_date()
    start_of_day = datetime.combine(today, datetime.min.time()).replace(tzinfo=LOCAL_TZ)

    today_todos = db.query(Todo).filter(
        Todo.user_id == user_id,
        (Todo.created_at >= start_of_day) | (Todo.is_recurring == True),  # noqa: E712
    ).all()

    if not today_todos:
        return {"percentage": 0, "completed": 0, "total": 0}

    serialized = [_serialize(t, today) for t in today_todos]
    completed = sum(1 for t in serialized if t["completed"])
    percentage = round((completed / len(serialized)) * 100, 1)
    return {"percentage": percentage, "completed": completed, "total": len(serialized)}
