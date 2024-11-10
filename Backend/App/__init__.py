from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_mail import Mail
import os
from datetime import timedelta
import atexit

db = SQLAlchemy()
mail = Mail()
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
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-jwt-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

    # Email configuration
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME', 'your-email@gmail.com')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD', 'your-app-specific-password')
    app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@fitnessapp.com')

    # Initialize extensions
    db.init_app(app)
    mail.init_app(app)

    with app.app_context():
        # Import routes
        from .routes import init_auth_routes
        from PostureCorrector.posture import posture_blueprint
        
        # Initialize routes
        init_auth_routes(app)
        
        # Register the posture blueprint
        app.register_blueprint(posture_blueprint, url_prefix='/api')
        
        # Create database tables
        db.create_all()
        print("Database tables created successfully")  # Debug print

    _app = app
    
    # Register cleanup
    def cleanup():
        global _app
        if _app is not None:
            _app = None
    atexit.register(cleanup)

    return app
