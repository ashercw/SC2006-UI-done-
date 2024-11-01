from flask import Flask
from flask_sqlalchemy import SQLAlchemy  # type: ignore
from .config import Config

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize database
    db.init_app(app)

    # Register blueprints (API routes)
    from .routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    return app
