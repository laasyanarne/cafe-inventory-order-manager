#!/bin/bash
# ========================================================
# SMALLBIZ STARTUP SCRIPT (macOS / Linux)
# Runs Docker (MySQL), Flask backend, and React frontend
# ========================================================

echo ""
echo "🐳  Starting Docker containers..."
docker-compose up -d

echo ""
echo "🔥  Starting Flask backend..."
cd server
# Run Flask backend in a new Terminal tab
osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"' && python3 app.py"'

cd ..

echo ""
echo "⚛️  Starting React frontend..."
cd client
# Run React frontend in a new Terminal tab
osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"' && npm run dev"'

cd ..

echo ""
echo "✅  All services launched!"
echo "🗂️  Flask API:     http://localhost:5001"
echo "🎨  React client:  http://localhost:5173"
