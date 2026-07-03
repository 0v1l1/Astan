#!/usr/bin/env python3
import subprocess
import sys
import time
import os
import webbrowser

os.chdir(os.path.dirname(os.path.abspath(__file__)))

print("=" * 50)
print("LifeGoal Tracker - Starting...")
print("=" * 50)

# Install dependencies
print("\n[1/3] Installing dependencies...")
try:
    subprocess.run([sys.executable, "-m", "pip", "install", "-q",
                   "fastapi", "uvicorn", "sqlalchemy", "pydantic",
                   "python-dotenv", "python-multipart"],
                  check=True)
    print("✓ Dependencies installed")
except Exception as e:
    print(f"✗ Error installing dependencies: {e}")
    sys.exit(1)

# Initialize database
print("\n[2/3] Initializing database...")
os.chdir("lifegoal-backend")
try:
    exec(open("init_db.py").read())
    print("✓ Database initialized")
except Exception as e:
    print(f"✗ Error initializing database: {e}")

os.chdir("..")

# Start backend
print("\n[3/3] Starting servers...")
print("Backend: http://localhost:8000")
print("Frontend: http://localhost:3000")
print("=" * 50)

backend_process = subprocess.Popen([sys.executable, "-m", "uvicorn",
                                   "main:app", "--reload", "--port", "8000"],
                                  cwd="lifegoal-backend")

time.sleep(2)

frontend_process = subprocess.Popen([sys.executable, "-m", "http.server", "3000",
                                    "--directory", "lifegoal-frontend/build"],
                                   stdout=subprocess.DEVNULL,
                                   stderr=subprocess.DEVNULL)

print("\nOpening browser...")
time.sleep(1)
webbrowser.open("http://localhost:3000")

try:
    backend_process.wait()
except KeyboardInterrupt:
    print("\n\nShutting down...")
    backend_process.terminate()
    frontend_process.terminate()
