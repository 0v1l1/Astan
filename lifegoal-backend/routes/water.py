from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import WaterLog
from datetime import datetime, date
from pydantic import BaseModel

router = APIRouter()

class WaterLogCreate(BaseModel):
    amount: float  # in litres

@router.post("/")
def log_water(water: WaterLogCreate, db: Session = Depends(get_db)):
    db_water = WaterLog(amount=water.amount)
    db.add(db_water)
    db.commit()
    db.refresh(db_water)
    return db_water

@router.get("/today")
def get_today_water(db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    logs = db.query(WaterLog).filter(
        WaterLog.date >= datetime.combine(today, datetime.min.time())
    ).all()

    total = sum(log.amount for log in logs)
    goal = 3.0
    percentage = min((total / goal) * 100, 100)

    return {"total": total, "goal": goal, "percentage": percentage}

@router.get("/history")
def get_water_history(db: Session = Depends(get_db)):
    logs = db.query(WaterLog).order_by(WaterLog.date.desc()).all()
    return logs
