@echo off
echo Starting GEO Agent Platform...

:: Start Backend
start "GEO Backend" cmd /k "cd backend && .\venv\Scripts\python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: Start Frontend
start "GEO Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Application starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this launcher (servers will keep running)...
pause >nul
