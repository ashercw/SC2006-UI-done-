from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from datetime import timedelta
import atexit

db = SQLAlchemy()
_app = None  # Global app instance

def get_app():
    global _app
    if _app is not None:
        return _app
    return create_app()

def create_app():
    global _app
    if _app is not None:
        return _app

    app = Flask(__name__)
    CORS(app)

    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-jwt-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

    db.init_app(app)

    with app.app_context():
        # Import routes
        from .routes import init_auth_routes
        
        # Initialize routes
        init_auth_routes(app)
        
        # Create database tables
        db.create_all()

    _app = app
    
    # Register cleanup
    def cleanup():
        global _app
        if _app is not None:
            _app = None
    atexit.register(cleanup)

    return app
