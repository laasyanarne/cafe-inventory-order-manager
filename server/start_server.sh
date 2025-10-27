#!/bin/bash
# Start the Flask server with the virtual environment

# Navigate to server directory
cd "$(dirname "$0")"

# Activate virtual environment
source venv/bin/activate

# Run Flask app
python3 app.py
