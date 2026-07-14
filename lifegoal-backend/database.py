from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool
import os

# Render's filesystem for a web service is ephemeral: a SQLite file here
# will be wiped on redeploy (and sometimes just on restart). Set DATABASE_URL
# to a managed Postgres instance (Render's own Postgres works fine) for
# anything you want to actually keep. SQLite remains the default so local
# development still works with zero setup.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./lifegoal.db")

# Render (and some other providers) hand out URLs starting with "postgres://",
# a scheme SQLAlchemy 2.x rejects outright — it wants "postgresql://".
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {}
engine_kwargs = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine_kwargs["poolclass"] = StaticPool
else:
    # Render/most managed Postgres providers close idle connections; recycle
    # and pre-ping so the pool doesn't hand out dead connections.
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 300

engine = create_engine(DATABASE_URL, connect_args=connect_args, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
