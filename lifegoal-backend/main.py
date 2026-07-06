from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="LifeGoal API")

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://lifegoal-seven.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routes
from routes import workouts, todos, food, water, notes, profile

app.include_router(workouts.router, prefix="/api/workouts", tags=["workouts"])
app.include_router(todos.router, prefix="/api/todos", tags=["todos"])
app.include_router(food.router, prefix="/api/food", tags=["food"])
app.include_router(water.router, prefix="/api/water", tags=["water"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])

@app.get("/")
def read_root():
    return {"message": "LifeGoal API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)