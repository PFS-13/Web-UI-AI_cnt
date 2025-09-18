@echo off
echo ================================
echo 🚀 Starting All Services
echo ================================

REM Jalankan React (frontend)
start cmd /k "cd frontend && npm install"

REM Jalankan Node.js (backend-node)
start cmd /k "cd backend && npm install"

echo Semua service sudah dijalankan di window terpisah.
pause
