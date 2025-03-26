from flask import Flask, request
from flask_cors import CORS
from config import Config, DevelopmentConfig, ProductionConfig
from models import db
from schemas import ma
from utils.caching import cache, configure_cache
import logging

# Import blueprints
from blueprints.bakery_bp import bakery_bp
from blueprints.pastry_bp import pastry_bp
from blueprints.review_bp import bakery_review_bp, pastry_review_bp
from blueprints.user_bp import user_bp


def create_app(config_class=DevelopmentConfig):
    """Create and configure the Flask application"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    app.url_map.strict_slashes = False

    @app.before_request
    def log_request_info():
        app.logger.debug('Headers: %s', request.headers)
        app.logger.debug('Method: %s', request.method)
    
    # Initialize extensions
    db.init_app(app)
    ma.init_app(app)
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:5173"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
            "supports_credentials": True
        }
    })
    # Configure caching
    configure_cache(app)
    
    # Register blueprints
    app.register_blueprint(bakery_bp, url_prefix='/bakeries')
    app.register_blueprint(pastry_bp, url_prefix='/pastries')
    app.register_blueprint(bakery_review_bp, url_prefix='/bakeryreviews')
    app.register_blueprint(pastry_review_bp, url_prefix='/pastryreviews')
    app.register_blueprint(user_bp, url_prefix='/contacts')
    
    # Create all database tables
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)