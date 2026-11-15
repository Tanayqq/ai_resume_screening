Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting AI Resume Screening System..." -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Virtual Environment
if (-not (Test-Path "$rootDir\ml-model\venv")) {
    Write-Host "[1/4] Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv "$rootDir\ml-model\venv"
}

# 2. Python Dependencies
Write-Host "[2/4] Installing backend requirements..." -ForegroundColor Yellow
& "$rootDir\ml-model\venv\Scripts\pip.exe" install -r "$rootDir\ml-model\requirements.txt"

# 3. Frontend Dependencies
Write-Host "[3/4] Installing frontend requirements..." -ForegroundColor Yellow
Set-Location "$rootDir\frontend\ai_resume_screening"
npm install
Set-Location $rootDir

# 4. Start Services
Write-Host "[4/4] Launching Backend and Frontend in separate windows..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\ml-model'; & '.\venv\Scripts\Activate.ps1'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\frontend\ai_resume_screening'; npm run dev"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Services started! Frontend will be live at http://localhost:5173" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
