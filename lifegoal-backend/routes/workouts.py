from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import WorkoutTemplate, WorkoutLog, ExerciseLog, Exercise
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import List, Optional
from auth import get_current_user_id

router = APIRouter()

# Same Moscow timezone as todos.py/food.py/etc. This used to be
# datetime.utcnow() here specifically, which disagreed with the rest of the
# app about what day "today" is for a few hours around midnight.
LOCAL_TZ = timezone(timedelta(hours=3))


def get_local_date():
    return datetime.now(LOCAL_TZ).date()


class ExerciseCreate(BaseModel):
    name: str
    sets: int
    reps: int
    weight: float


class WorkoutTemplateCreate(BaseModel):
    name: str
    exercises: List[ExerciseCreate]


class WorkoutLogCreate(BaseModel):
    template_id: int
    note: Optional[str] = None
    exercises: List[ExerciseCreate]


@router.get("/templates")
def get_templates(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    return db.query(WorkoutTemplate).filter(WorkoutTemplate.user_id == user_id).all()


@router.post("/templates")
def create_template(
    template: WorkoutTemplateCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    db_template = WorkoutTemplate(name=template.name, user_id=user_id)
    db.add(db_template)
    db.flush()

    for exercise in template.exercises:
        db.add(Exercise(
            template_id=db_template.id,
            name=exercise.name,
            sets=exercise.sets,
            reps=exercise.reps,
            weight=exercise.weight,
        ))

    db.commit()
    db.refresh(db_template)
    return db_template


def _get_owned_template(template_id: int, user_id: int, db: Session) -> WorkoutTemplate:
    template = db.query(WorkoutTemplate).filter(
        WorkoutTemplate.id == template_id, WorkoutTemplate.user_id == user_id
    ).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.post("/log")
def log_workout(
    workout: WorkoutLogCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    # Make sure the template being logged actually belongs to this user
    # before attaching a log to it.
    _get_owned_template(workout.template_id, user_id, db)

    db_log = WorkoutLog(template_id=workout.template_id, note=workout.note, user_id=user_id)
    db.add(db_log)
    db.flush()

    for exercise in workout.exercises:
        db.add(ExerciseLog(
            workout_id=db_log.id,
            exercise_name=exercise.name,
            weight=exercise.weight,
            sets=exercise.sets,
            reps=exercise.reps,
        ))

    db.commit()
    db.refresh(db_log)
    return db_log


@router.get("/logs")
def get_workout_logs(
    skip: int = 0,
    limit: int = 30,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    return (
        db.query(WorkoutLog)
        .filter(WorkoutLog.user_id == user_id)
        .order_by(WorkoutLog.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/logs/today")
def get_today_workouts(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    today = get_local_date()
    start_of_day = datetime.combine(today, datetime.min.time()).replace(tzinfo=LOCAL_TZ)
    logs = db.query(WorkoutLog).filter(
        WorkoutLog.user_id == user_id,
        WorkoutLog.date >= start_of_day,
    ).all()
    return len(logs) > 0
