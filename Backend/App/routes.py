from flask import jsonify, request, current_app
from . import db
from .models import User, Sleep, WorkoutList
from datetime import datetime, timedelta
import jwt
from functools import wraps
from werkzeug.security import generate_password_hash
import os
import random
import string
from flask_mail import Mail, Message
import traceback

mail = Mail()

def generate_temp_password(length=12):
    """Generate a random temporary password"""
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(random.choice(characters) for i in range(length))

def send_password_email(email, password):
    """Send email with temporary password"""
    try:
        msg = Message(
            'Your Temporary Password',
            sender=current_app.config['MAIL_DEFAULT_SENDER'],
            recipients=[email]
        )
        msg.body = f'''Your temporary password is: {password}
        
Please use this password to log in and change it immediately for security purposes.

Best regards,
The Fitness App Team
'''
        print(f"Attempting to send email to {email}")  # Debug print
        mail.send(msg)
        print("Email sent successfully")  # Debug print
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")  # Debug print
        print(f"Traceback: {traceback.format_exc()}")  # Print full traceback
        return False

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id']).first()
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

def init_auth_routes(app):
    # Initialize Flask-Mail with the app
    mail.init_app(app)

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

            # Generate token
            token = jwt.encode({
                'user_id': new_user.id,
                'exp': datetime.utcnow() + timedelta(days=1)
            }, current_app.config['SECRET_KEY'])

            return jsonify({
                'message': 'Registration successful',
                'token': token,
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

    @app.route('/api/auth/login', methods=['POST'])
    def login():
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400

        user = User.query.filter_by(email=data['email']).first()

        if not user or not user.verifyPassword(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401

        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=1)
        }, current_app.config['SECRET_KEY'])

        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
        }), 200

    @app.route('/api/auth/reset-password', methods=['POST'])
    def reset_password():
        try:
            data = request.get_json()
            
            if not data or not data.get('email'):
                return jsonify({'error': 'Email is required'}), 400

            print(f"Received reset password request for email: {data['email']}")  # Debug print
            
            user = User.query.filter_by(email=data['email']).first()
            
            if not user:
                print("User not found")  # Debug print
                return jsonify({'message': 'If the email exists, a password will be sent'}), 200

            # Generate temporary password
            temp_password = generate_temp_password()
            print(f"Generated temporary password")  # Debug print
            
            # Update user's password in database
            user.password = temp_password
            db.session.commit()
            print(f"Password updated in database")  # Debug print
            
            # Print mail configuration
            print(f"Mail Configuration:")
            print(f"MAIL_SERVER: {current_app.config.get('MAIL_SERVER')}")
            print(f"MAIL_PORT: {current_app.config.get('MAIL_PORT')}")
            print(f"MAIL_USE_TLS: {current_app.config.get('MAIL_USE_TLS')}")
            print(f"MAIL_USERNAME: {current_app.config.get('MAIL_USERNAME')}")
            print(f"MAIL_DEFAULT_SENDER: {current_app.config.get('MAIL_DEFAULT_SENDER')}")
            
            # Send email with temporary password
            if send_password_email(user.email, temp_password):
                return jsonify({
                    'message': 'Your password has been sent to your email'
                }), 200
            else:
                return jsonify({'error': 'Failed to send email'}), 500
            
        except Exception as e:
            db.session.rollback()
            print(f"Error in reset_password: {str(e)}")  # Debug print
            print(f"Traceback: {traceback.format_exc()}")  # Print full traceback
            return jsonify({'error': 'Failed to reset password'}), 500

    @app.route('/api/auth/verify-token', methods=['GET'])
    @token_required
    def verify_token(current_user):
        return jsonify({
            'message': 'Token is valid',
            'user': {
                'id': current_user.id,
                'email': current_user.email,
                'first_name': current_user.first_name,
                'last_name': current_user.last_name
            }
        }), 200

    # Sleep tracking routes
    @app.route('/api/sleep', methods=['POST'])
    @token_required
    def add_sleep_record(current_user):
        try:
            data = request.get_json()
            
            # Convert string times to Time objects
            date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            bed_time = datetime.strptime(data['sleepTime'], '%H:%M').time()
            wake_time = datetime.strptime(data['wakeTime'], '%H:%M').time()
            
            # Create new sleep record
            sleep_record = Sleep(
                user_id=current_user.id,
                date=date,
                bed_time=bed_time,
                wake_time=wake_time
            )
            
            # Add and commit to database
            db.session.add(sleep_record)
            db.session.commit()
            
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
            print(f"Error adding sleep record: {str(e)}")  # Add debug print
            return jsonify({'error': str(e)}), 400

    @app.route('/api/sleep', methods=['GET'])
    @token_required
    def get_sleep_records(current_user):
        try:
            # Get date range from query parameters
            start_date = request.args.get('start_date')
            end_date = request.args.get('end_date')
            
            query = Sleep.query.filter_by(user_id=current_user.id)
            
            if start_date:
                start = datetime.strptime(start_date, '%Y-%m-%d').date()
                query = query.filter(Sleep.date >= start)
            
            if end_date:
                end = datetime.strptime(end_date, '%Y-%m-%d').date()
                query = query.filter(Sleep.date <= end)
            
            sleep_records = query.order_by(Sleep.date.desc()).all()
            
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
            print(f"Error getting sleep records: {str(e)}")  # Add debug print
            return jsonify({'error': str(e)}), 400

    @app.route('/api/sleep/<int:record_id>', methods=['PUT'])
    @token_required
    def update_sleep_record(current_user, record_id):
        sleep_record = Sleep.query.filter_by(id=record_id, user_id=current_user.id).first()
        
        if not sleep_record:
            return jsonify({'error': 'Sleep record not found'}), 404
            
        try:
            data = request.get_json()
            
            if 'date' in data:
                sleep_record.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            if 'sleepTime' in data:
                sleep_record.bed_time = datetime.strptime(data['sleepTime'], '%H:%M').time()
            if 'wakeTime' in data:
                sleep_record.wake_time = datetime.strptime(data['wakeTime'], '%H:%M').time()
            
            sleep_record.sleep_duration = sleep_record.get_sleep_duration()
            db.session.commit()
            
            return jsonify({
                'message': 'Sleep record updated successfully',
                'sleep_record': {
                    'id': sleep_record.id,
                    'date': sleep_record.date.strftime('%Y-%m-%d'),
                    'bed_time': sleep_record.bed_time.strftime('%H:%M'),
                    'wake_time': sleep_record.wake_time.strftime('%H:%M'),
                    'duration': sleep_record.sleep_duration,
                    'quality': data.get('quality', 'good')
                }
            }), 200
            
        except Exception as e:
            db.session.rollback()
            print(f"Error updating sleep record: {str(e)}")  # Add debug print
            return jsonify({'error': str(e)}), 400

    @app.route('/api/sleep/<int:record_id>', methods=['DELETE'])
    @token_required
    def delete_sleep_record(current_user, record_id):
        sleep_record = Sleep.query.filter_by(id=record_id, user_id=current_user.id).first()
        
        if not sleep_record:
            return jsonify({'error': 'Sleep record not found'}), 404
            
        try:
            db.session.delete(sleep_record)
            db.session.commit()
            return jsonify({'message': 'Sleep record deleted successfully'}), 200
            
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting sleep record: {str(e)}")  # Add debug print
            return jsonify({'error': str(e)}), 400

    # Workout tracking routes
    @app.route('/api/workouts/stats', methods=['GET'])
    @token_required
    def get_workout_stats(current_user):
        try:
            # Get workouts for the current user
            workouts = WorkoutList.query.filter_by(user_id=current_user.id).all()
            
            # Calculate total workouts completed
            total_workouts = len(workouts)
            
            # Calculate total calories burned (based on workout duration and difficulty)
            total_calories = sum([
                workout.duration * {
                    'easy': 5,      # 5 calories per minute for easy workouts
                    'medium': 7,    # 7 calories per minute for medium workouts
                    'hard': 10      # 10 calories per minute for hard workouts
                }.get(workout.difficulty.lower(), 5)  # default to 5 if difficulty not recognized
                for workout in workouts
            ])
            
            return jsonify({
                'total_workouts': total_workouts,
                'total_calories': total_calories
            }), 200
            
        except Exception as e:
            print(f"Error getting workout stats: {str(e)}")
            return jsonify({'error': str(e)}), 400

    @app.route('/api/workouts', methods=['POST'])
    @token_required
    def add_workout(current_user):
        try:
            data = request.get_json()
            
            # Create new workout record
            workout = WorkoutList(
                user_id=current_user.id,
                workout_type=data['workoutType'],
                difficulty=data['difficulty'],
                duration=data['duration'],
                date=datetime.strptime(data['date'], '%Y-%m-%d').date() if 'date' in data else None
            )
            
            db.session.add(workout)
            db.session.commit()
            
            return jsonify({
                'message': 'Workout added successfully',
                'workout': {
                    'id': workout.id,
                    'type': workout.workout_type,
                    'difficulty': workout.difficulty,
                    'duration': workout.duration,
                    'date': workout.date.strftime('%Y-%m-%d') if workout.date else None
                }
            }), 201
            
        except Exception as e:
            db.session.rollback()
            print(f"Error adding workout: {str(e)}")
            return jsonify({'error': str(e)}), 400
