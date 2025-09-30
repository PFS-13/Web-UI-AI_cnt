@echo off
echo ================================
echo  Build All Services
echo ================================

REM Jalankan React (frontend)
start cmd /k "cd frontend && npm run build"

REM Jalankan Node.js (backend-node)
start cmd /k "cd backend && npm run build"

echo Semua service sudah dijalankan di window terpisah.
pause
