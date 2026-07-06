from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Food
from datetime import datetime, date, timezone, timedelta
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

LOCAL_TZ = timezone(timedelta(hours=3))

def get_local_date():
    return datetime.now(LOCAL_TZ).date()

class FoodCreate(BaseModel):
    name: str
    meal_type: str
    grams: int = 0

class FoodUpdate(BaseModel):
    name: Optional[str] = None
    meal_type: Optional[str] = None
    grams: Optional[int] = None

@router.post("/")
def add_food(food: FoodCreate, db: Session = Depends(get_db)):
    db_food = Food(name=food.name, meal_type=food.meal_type, grams=food.grams)
    db.add(db_food)
    db.commit()
    db.refresh(db_food)
    return db_food

@router.get("/")
def get_today_food(db: Session = Depends(get_db)):
    today = get_local_date()
    start_of_day = datetime.combine(today, datetime.min.time()).replace(tzinfo=LOCAL_TZ)
    foods = db.query(Food).filter(Food.date >= start_of_day).all()
    return foods

@router.get("/history")
def get_food_history(db: Session = Depends(get_db)):
    foods = db.query(Food).order_by(Food.date.desc()).all()
    return foods

@router.delete("/{food_id}")
def delete_food(food_id: int, db: Session = Depends(get_db)):
    db_food = db.query(Food).filter(Food.id == food_id).first()
    if not db_food:
        raise HTTPException(status_code=404, detail="Food not found")
    db.delete(db_food)
    db.commit()
    return {"message": "Food deleted"}

@router.put("/{food_id}")
def update_food(food_id: int, food: FoodUpdate, db: Session = Depends(get_db)):
    db_food = db.query(Food).filter(Food.id == food_id).first()
    if not db_food:
        raise HTTPException(status_code=404, detail="Food not found")
    if food.name is not None:
        db_food.name = food.name
    if food.meal_type is not None:
        db_food.meal_type = food.meal_type
    if food.grams is not None:
        db_food.grams = food.grams
    db.commit()
    db.refresh(db_food)
    return db_food