# backend/app.py
from flask import Flask, request
from flask_cors import CORS
from config import Config, DevelopmentConfig, ProductionConfig
from models import db
from schemas import ma
from utils.caching import cache, configure_cache
import logging

# Import blueprints
from blueprints.bakery_bp import bakery_bp
from blueprints.product_bp import product_bp
from blueprints.review_bp import bakery_review_bp, product_review_bp
from blueprints.user_bp import user_bp
from blueprints.auth_bp import auth_bp

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
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
            "supports_credentials": True
        }
    })
    # Configure caching
    configure_cache(app)
    
    # Register blueprints
    app.register_blueprint(bakery_bp, url_prefix='/bakeries')
    app.register_blueprint(product_bp, url_prefix='/products') 
    app.register_blueprint(bakery_review_bp, url_prefix='/bakeryreviews')
    app.register_blueprint(product_review_bp, url_prefix='/productreviews') 
    app.register_blueprint(user_bp, url_prefix='/users') 
    app.register_blueprint(auth_bp, url_prefix='/auth') 
    
    # Create all database tables
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)