@echo off
echo 🚀 Starting Docker containers...
docker compose up -d

echo 🕒 Waiting a few seconds for MySQL to initialize...
timeout /t 5 /nobreak >nul

echo ⚙️ Starting Node.js server...
cd server
node server.js
cd ..
pause
