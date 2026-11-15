@echo off
echo ========================================================
echo Starting AI Resume Screening System...
echo ========================================================

cd /d "%~dp0"

echo [1/4] Checking Python Virtual Environment...
if not exist "ml-model\venv" (
    echo Creating Python virtual environment...
    python -m venv ml-model\venv
)

echo [2/4] Installing / Updating Python Dependencies...
call ml-model\venv\Scripts\activate.bat
pip install -r ml-model\requirements.txt

echo [3/4] Installing Frontend Dependencies...
cd frontend\ai_resume_screening
call npm install
cd ..\..

echo [4/4] Launching Backend and Frontend...
start "Backend - FastAPI" cmd /k "cd /d %~dp0\ml-model && call venv\Scripts\activate.bat && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
start "Frontend - Vite React" cmd /k "cd /d %~dp0\frontend\ai_resume_screening && npm run dev"

echo ========================================================
echo Both Backend (port 8000) and Frontend (port 5173) are starting!
echo Once loaded, open: http://localhost:5173
echo ========================================================
pause
