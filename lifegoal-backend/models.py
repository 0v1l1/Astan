from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class WorkoutTemplate(Base):
    __tablename__ = "workout_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    exercises = relationship("Exercise", back_populates="template", cascade="all, delete-orphan")
    created_at = Column(DateTime, default=datetime.utcnow)

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("workout_templates.id"))
    name = Column(String)
    sets = Column(Integer)
    reps = Column(Integer)
    weight = Column(Float)
    template = relationship("WorkoutTemplate", back_populates="exercises")

class WorkoutLog(Base):
    __tablename__ = "workout_logs"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("workout_templates.id"))
    date = Column(DateTime, default=datetime.utcnow)
    note = Column(Text, nullable=True)
    exercises = relationship("ExerciseLog", back_populates="workout")

class ExerciseLog(Base):
    __tablename__ = "exercise_logs"

    id = Column(Integer, primary_key=True, index=True)
    workout_id = Column(Integer, ForeignKey("workout_logs.id"))
    exercise_name = Column(String)
    weight = Column(Float)
    sets = Column(Integer)
    reps = Column(Integer)
    workout = relationship("WorkoutLog", back_populates="exercises")

class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    priority = Column(String)  # high, medium, low
    completed = Column(Boolean, default=False)
    completed_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_recurring = Column(Boolean, default=False)
    recurring_days = Column(String, nullable=True)  # "1,3,5" for Mon,Wed,Fri

class Food(Base):
    __tablename__ = "foods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    meal_type = Column(String)  # breakfast, lunch, dinner, snack
    date = Column(DateTime, default=datetime.utcnow)

class WaterLog(Base):
    __tablename__ = "water_logs"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)  # in litres
    date = Column(DateTime, default=datetime.utcnow)

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    date = Column(DateTime, default=datetime.utcnow)

class UserProfile(Base):
    __tablename__ = "user_profile"

    id = Column(Integer, primary_key=True, index=True)
    height = Column(Float, nullable=True)  # in cm
    weight = Column(Float, nullable=True)  # in kg
    updated_at = Column(DateTime, default=datetime.utcnow)
