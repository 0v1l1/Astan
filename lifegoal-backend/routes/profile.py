from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import UserProfile
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class ProfileUpdate(BaseModel):
    height: Optional[float] = None
    weight: Optional[float] = None

@router.get("/")
def get_profile(db: Session = Depends(get_db)):
    profile = db.query(UserProfile).first()
    if not profile:
        profile = UserProfile()
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("/")
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db)):
    profile = db.query(UserProfile).first()
    if not profile:
        profile = UserProfile()
        db.add(profile)

    if data.height is not None:
        profile.height = data.height
    if data.weight is not None:
        profile.weight = data.weight

    profile.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(profile)
    return profile
