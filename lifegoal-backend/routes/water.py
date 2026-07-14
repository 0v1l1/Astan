from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import WaterLog
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from auth import get_current_user_id

router = APIRouter()

LOCAL_TZ = timezone(timedelta(hours=3))


def get_local_date():
    return datetime.now(LOCAL_TZ).date()


class WaterLogCreate(BaseModel):
    amount: float


@router.post("/")
def log_water(
    water: WaterLogCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    db_water = WaterLog(amount=water.amount, user_id=user_id)
    db.add(db_water)
    db.commit()
    db.refresh(db_water)
    return db_water


@router.get("/today")
def get_today_water(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    today = get_local_date()
    start_of_day = datetime.combine(today, datetime.min.time()).replace(tzinfo=LOCAL_TZ)
    logs = db.query(WaterLog).filter(
        WaterLog.user_id == user_id,
        WaterLog.date >= start_of_day,
    ).all()
    total = sum(log.amount for log in logs)
    goal = 3.0
    percentage = min((total / goal) * 100, 100)
    return {"total": total, "goal": goal, "percentage": percentage}


@router.get("/history")
def get_water_history(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    logs = (
        db.query(WaterLog)
        .filter(WaterLog.user_id == user_id)
        .order_by(WaterLog.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return logs
