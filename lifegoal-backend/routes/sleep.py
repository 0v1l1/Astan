from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Sleep, SleepGoal
from pydantic import BaseModel
from typing import Optional
from auth import get_current_user_id

router = APIRouter()


class SleepCreate(BaseModel):
    bedtime: str
    wake: str
    hours: float
    quality: int


class GoalUpdate(BaseModel):
    bedtime: str
    wake: str


@router.get("/goal")
def get_goal(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    goal = db.query(SleepGoal).filter(SleepGoal.user_id == user_id).first()
    if not goal:
        goal = SleepGoal(user_id=user_id, bedtime="23:00", wake="07:00")
        db.add(goal)
        db.commit()
        db.refresh(goal)
    return goal


@router.put("/goal")
def update_goal(
    data: GoalUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    goal = db.query(SleepGoal).filter(SleepGoal.user_id == user_id).first()
    if not goal:
        goal = SleepGoal(user_id=user_id)
        db.add(goal)
    goal.bedtime = data.bedtime
    goal.wake = data.wake
    db.commit()
    db.refresh(goal)
    return goal


@router.post("/")
def log_sleep(
    entry: SleepCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    db_entry = Sleep(
        bedtime=entry.bedtime, wake=entry.wake,
        hours=entry.hours, quality=entry.quality,
        user_id=user_id,
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


@router.get("/history")
def get_history(
    skip: int = 0,
    limit: int = 30,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    return (
        db.query(Sleep)
        .filter(Sleep.user_id == user_id)
        .order_by(Sleep.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.delete("/{entry_id}")
def delete_sleep(
    entry_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    entry = db.query(Sleep).filter(Sleep.id == entry_id, Sleep.user_id == user_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "deleted"}
