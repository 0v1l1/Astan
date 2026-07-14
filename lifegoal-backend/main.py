import os
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("uvicorn.error")

app = FastAPI(title="LifeGoal API")

# CORS: kept as an explicit allow-list (not "*") since the API accepts
# cookies/headers for auth. Add FRONTEND_ORIGINS env var (comma-separated)
# to extend this without a code change when you add new deploy URLs.
default_origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://lifegoal-seven.vercel.app",
]
extra_origins = [o.strip() for o in os.getenv("FRONTEND_ORIGINS", "").split(",") if o.strip()]
origins = default_origins + extra_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def check_config():
    if not os.getenv("TELEGRAM_BOT_TOKEN"):
        logger.warning(
            "TELEGRAM_BOT_TOKEN is not set — every authenticated request will fail with 500. "
            "Set it to the token from @BotFather."
        )
    if os.getenv("DATABASE_URL", "").startswith("sqlite") or not os.getenv("DATABASE_URL"):
        logger.warning(
            "Using SQLite. On Render this file does not persist across deploys — "
            "set DATABASE_URL to a Postgres instance for real data."
        )


# Import routes
from routes import workouts, todos, food, water, notes, profile, sleep

app.include_router(workouts.router, prefix="/api/workouts", tags=["workouts"])
app.include_router(todos.router, prefix="/api/todos", tags=["todos"])
app.include_router(food.router, prefix="/api/food", tags=["food"])
app.include_router(water.router, prefix="/api/water", tags=["water"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(sleep.router, prefix="/api/sleep", tags=["sleep"])


@app.get("/")
def read_root():
    return {"message": "LifeGoal API is running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
