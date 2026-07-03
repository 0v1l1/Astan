@echo off
cd /d "%~dp0"
echo Starting LifeGoal Backend...
start cmd /k python -m uvicorn main:app --reload --port 8000

timeout /t 3

echo Starting LifeGoal Frontend...
cd lifegoal-frontend
start cmd /k npm start

echo.
echo LifeGoal запущен!
echo Бэкенд: http://localhost:8000
echo Фронтенд: http://localhost:3000
pause
