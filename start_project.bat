@echo off
REM ========================================================
REM  SMALLBIZ STARTUP SCRIPT  (Windows PowerShell / CMD)
REM  Runs Docker (MySQL), Flask backend, and React frontend
REM ========================================================

echo.
echo 🐳  Starting Docker containers...
docker compose up --build -d

echo.
echo 🔥  Starting Flask backend...
cd server
start cmd /k "python app.py"

cd ..

echo.
echo ⚛️  Starting React frontend...
cd client
start cmd /k "npm run dev"

cd ..

echo.
echo ✅  All services launched!
echo 🗂️  Flask API:     http://localhost:5000
echo 🎨  React client:  http://localhost:5173
pause
