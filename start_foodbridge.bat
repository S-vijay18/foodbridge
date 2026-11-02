@echo off
title FoodBridge - Smart Food Waste Donation Platform
echo ========================================================
echo   Starting FoodBridge Servers...
echo ========================================================

echo Starting FastAPI Backend on http://localhost:8000 ...
start "FoodBridge Backend" cmd /k "cd backend && venv\Scripts\uvicorn.exe main:app --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo Starting Vite React Frontend on http://localhost:5173 ...
start "FoodBridge Frontend" cmd /k "cd frontend && npm run dev -- --host 0.0.0.0 --port 5173"

echo.
echo ========================================================
echo   FoodBridge is now running!
echo   Frontend: http://localhost:5173
echo   API Docs: http://localhost:8000/docs
echo ========================================================
pause

