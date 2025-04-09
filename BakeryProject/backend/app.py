# Flask application factory and entry point for the BakeryProject backend.
# This file sets up the Flask app, including configuration, extensions, blueprints, and CORS.
# It can be run directly for development or loaded by a WSGI server for production.

import logging
from flask import Flask, request
from flask_cors import CORS
from flask_migrate import Migrate

from backend.models import db  # Database (SQLAlchemy)
from backend.schemas import ma  # Serialization (Marshmallow)
from backend.utils.caching import cache, configure_cache  # Caching utility
from backend.config import DevelopmentConfig, ProductionConfig  # Config classes

# Import Flask blueprints for modular route organization
from backend.blueprints.bakery_bp import bakery_bp
from backend.blueprints.pastry_bp import pastry_bp
from backend.blueprints.review_bp import bakery_review_bp, pastry_review_bp
from backend.blueprints.user_bp import user_bp

def create_app(config_class=DevelopmentConfig):
    """Factory to create and configure the Flask application."""
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.url_map.strict_slashes = False  # Allow URLs with or without trailing slashes

    # Set up logging level (DEBUG in development, INFO or higher in production)
    if app.config.get('DEBUG'):
        app.logger.setLevel(logging.DEBUG)
    else:
        app.logger.setLevel(logging.INFO)

    # Log each request's method and headers for debugging (only visible at DEBUG level)
    @app.before_request
    def log_request_info():
        app.logger.debug(f"Incoming {request.method} request to {request.path} with headers: {dict(request.headers)}")

    # Initialize extensions
    db.init_app(app)   # Initialize SQLAlchemy (database)
    ma.init_app(app)   # Initialize Marshmallow (serialization)
    
    # Enable Cross-Origin Resource Sharing (CORS) for the frontend (adjust origins as needed)
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:5173", "http://192.168.0.20:5173"],
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
            "supports_credentials": True
        }
    })

    # Set up database migration support
    # Note: Flask-Migrate is also configured via the separate migrate.py CLI script.
    migrate = Migrate(app, db)

    # Configure caching for the application (using Flask-Caching if enabled in config)
    configure_cache(app)  # Sets up cache with app config (e.g., cache type, default timeout)

    # Register blueprints for different parts of the API
    app.register_blueprint(bakery_bp, url_prefix='/bakeries')       # Bakery-related routes
    app.register_blueprint(pastry_bp, url_prefix='/pastries')       # Pastry-related routes
    app.register_blueprint(bakery_review_bp, url_prefix='/bakeryreviews')  # Bakery review routes
    app.register_blueprint(pastry_review_bp, url_prefix='/pastryreviews')  # Pastry review routes
    app.register_blueprint(user_bp, url_prefix='/contacts')         # User/contacts routes

    # Define a simple root endpoint for testing connectivity
    @app.route('/')
    def index():
        return {"message": "BakeryProject API is running"}, 200

    return app

# Create a global WSGI application instance
# This allows running the app via WSGI servers (e.g., Gunicorn) by pointing to "app"
app = create_app()  # default to DevelopmentConfig; use ProductionConfig for production

# Run the Flask development server if this script is executed directly
if __name__ == '__main__':
    app.run(debug=True)

