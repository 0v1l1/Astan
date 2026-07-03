from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Food
from datetime import datetime, date
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class FoodCreate(BaseModel):
    name: str
    meal_type: str  # breakfast, lunch, dinner, snack

@router.post("/")
def add_food(food: FoodCreate, db: Session = Depends(get_db)):
    db_food = Food(name=food.name, meal_type=food.meal_type)
    db.add(db_food)
    db.commit()
    db.refresh(db_food)
    return db_food

@router.get("/")
def get_today_food(db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    foods = db.query(Food).filter(
        Food.date >= datetime.combine(today, datetime.min.time())
    ).all()
    return foods

@router.get("/history")
def get_food_history(db: Session = Depends(get_db)):
    foods = db.query(Food).order_by(Food.date.desc()).all()
    return foods
