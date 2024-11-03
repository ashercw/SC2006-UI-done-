from flask import jsonify, request
from . import db
from .models import User, Sleep
from datetime import datetime, timedelta
import jwt
from functools import wraps
from flask import current_app
from werkzeug.security import generate_password_hash
import os
import traceback

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Temporarily bypass authentication for testing
        return f(None, *args, **kwargs)
    return decorated

def init_auth_routes(app):
    @app.route('/api/auth/signup', methods=['POST'])
    def signup():
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name', 'date_of_birth']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400

        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 409

        try:
            # Convert date_of_birth string to date object
            dob = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
            
            # Create new user
            new_user = User(
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=data['email'],
                password=data['password'],
                date_of_birth=dob,
                weight=data.get('weight'),
                height=data.get('height'),
                goal=data.get('goal')
            )
            
            db.session.add(new_user)
            db.session.commit()

            return jsonify({
                'message': 'Registration successful',
                'user': {
                    'id': new_user.id,
                    'email': new_user.email,
                    'first_name': new_user.first_name,
                    'last_name': new_user.last_name
                }
            }), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 400

    @app.route('/api/sleep', methods=['POST'])
    def add_sleep_record():
        try:
            data = request.get_json()
            print("Received data:", data)  # Debug print
            
            # Convert string times to Time objects
            date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            bed_time = datetime.strptime(data['sleepTime'], '%H:%M').time()
            wake_time = datetime.strptime(data['wakeTime'], '%H:%M').time()
            
            print(f"Parsed values - date: {date}, bed_time: {bed_time}, wake_time: {wake_time}")  # Debug print
            
            # Create new sleep record
            sleep_record = Sleep(
                user_id=1,  # Hardcoded for testing
                date=date,
                bed_time=bed_time,
                wake_time=wake_time
            )
            
            # Add and commit to database
            db.session.add(sleep_record)
            db.session.commit()
            
            print("Sleep record added successfully")  # Debug print
            
            return jsonify({
                'message': 'Sleep record added successfully',
                'sleep_record': {
                    'id': sleep_record.id,
                    'date': sleep_record.date.strftime('%Y-%m-%d'),
                    'bed_time': sleep_record.bed_time.strftime('%H:%M'),
                    'wake_time': sleep_record.wake_time.strftime('%H:%M'),
                    'duration': sleep_record.sleep_duration,
                    'quality': data.get('quality', 'good')
                }
            }), 201
            
        except Exception as e:
            db.session.rollback()
            print(f"Error adding sleep record: {str(e)}")
            print("Traceback:", traceback.format_exc())  # Print full traceback
            return jsonify({'error': str(e)}), 400

    @app.route('/api/sleep', methods=['GET'])
    def get_sleep_records():
        try:
            sleep_records = Sleep.query.filter_by(user_id=1).order_by(Sleep.date.desc()).all()
            print(f"Found {len(sleep_records)} sleep records")  # Debug print
            
            return jsonify({
                'sleep_records': [{
                    'id': record.id,
                    'date': record.date.strftime('%Y-%m-%d'),
                    'bed_time': record.bed_time.strftime('%H:%M'),
                    'wake_time': record.wake_time.strftime('%H:%M'),
                    'duration': record.sleep_duration,
                    'quality': 'good'  # Default quality
                } for record in sleep_records]
            }), 200
            
        except Exception as e:
            print(f"Error getting sleep records: {str(e)}")
            print("Traceback:", traceback.format_exc())  # Print full traceback
            return jsonify({'error': str(e)}), 400

    return app
