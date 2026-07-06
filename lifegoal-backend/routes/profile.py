from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import UserProfile
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

LOCAL_TZ = timezone(timedelta(hours=3))

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
    profile.updated_at = datetime.now(LOCAL_TZ)
    db.commit()
    db.refresh(profile)
    return profile