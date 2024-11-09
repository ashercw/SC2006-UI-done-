from flask import Flask
from .posture import posture_corrector  # Import the posture blueprint
from flask_cors import CORS

def get_app():
    app = Flask(__name__)
    CORS(app)
    
    #Register blueprints
    app.register_blueprint(posture_corrector, url_prefix='/api')  # '/api' prefix for posture routes
    
    # Additional app configurations if needed
    return app
