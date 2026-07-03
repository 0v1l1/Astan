from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import WorkoutTemplate, WorkoutLog, ExerciseLog, Exercise
from datetime import datetime, date
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

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
def get_templates(db: Session = Depends(get_db)):
    templates = db.query(WorkoutTemplate).all()
    return templates

@router.post("/templates")
def create_template(template: WorkoutTemplateCreate, db: Session = Depends(get_db)):
    db_template = WorkoutTemplate(name=template.name)
    db.add(db_template)
    db.flush()

    for exercise in template.exercises:
        db_exercise = Exercise(
            template_id=db_template.id,
            name=exercise.name,
            sets=exercise.sets,
            reps=exercise.reps,
            weight=exercise.weight
        )
        db.add(db_exercise)

    db.commit()
    db.refresh(db_template)
    return db_template

@router.post("/log")
def log_workout(workout: WorkoutLogCreate, db: Session = Depends(get_db)):
    db_log = WorkoutLog(
        template_id=workout.template_id,
        note=workout.note
    )
    db.add(db_log)
    db.flush()

    for exercise in workout.exercises:
        db_exercise_log = ExerciseLog(
            workout_id=db_log.id,
            exercise_name=exercise.name,
            weight=exercise.weight,
            sets=exercise.sets,
            reps=exercise.reps
        )
        db.add(db_exercise_log)

    db.commit()
    db.refresh(db_log)
    return db_log

@router.get("/logs")
def get_workout_logs(skip: int = 0, limit: int = 30, db: Session = Depends(get_db)):
    logs = db.query(WorkoutLog).order_by(WorkoutLog.date.desc()).offset(skip).limit(limit).all()
    return logs

@router.get("/logs/today")
def get_today_workouts(db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    logs = db.query(WorkoutLog).filter(
        WorkoutLog.date >= datetime.combine(today, datetime.min.time())
    ).all()
    return len(logs) > 0
