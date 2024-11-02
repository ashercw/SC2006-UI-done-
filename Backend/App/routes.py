from flask import jsonify, request
from . import db
from .models import User
from datetime import datetime, timedelta
import jwt
from functools import wraps
from flask import current_app
from werkzeug.security import generate_password_hash
import os

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
        data = request.get_json()
        
        if not data or not data.get('email'):
            return jsonify({'error': 'Email is required'}), 400

        user = User.query.filter_by(email=data['email']).first()
        
        if not user:
            # For security reasons, don't reveal if email exists
            return jsonify({'message': 'If the email exists, a reset link will be sent'}), 200

        # In a real application, you would:
        # 1. Generate a reset token
        # 2. Save it to the database with an expiration
        # 3. Send an email with the reset link
        # For now, we'll just return a success message
        
        return jsonify({
            'message': 'If the email exists, a reset link will be sent'
        }), 200

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
