#!/bin/bash

# Install Python dependencies if needed
pip3 install -r requirements.txt

# Start Flask backend
cd Backend
# Run the Flask app in the background
python3 run.py&

cd foodtracker
python3 app.py&

cd ..
cd ..
npm start 



