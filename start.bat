@echo off
echo ================================
echo 🚀 Starting All Services
echo ================================

REM Jalankan React (frontend)
start cmd /k "cd frontend && npm run dev"

REM Jalankan Node.js (backend-node)
start cmd /k "cd backend-node && node index.js"

REM Jalankan Python FastAPI (backend-python)
start cmd /k "cd backend-python && python -m uvicorn app.main:app --reload --port 8000"

echo Semua service sudah dijalankan di window terpisah.
pause
