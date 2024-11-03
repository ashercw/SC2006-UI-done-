#!/bin/bash

# Install Python dependencies if needed
pip3 install -r requirements.txt

# Start Flask backend
cd Backend
python3 -m flask --app App run &

# Wait for Flask to start
sleep 2

# Start React frontend
cd ..
npm start
