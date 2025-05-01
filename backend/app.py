from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
import logging
from logging.handlers import RotatingFileHandler
from config import Config, DevelopmentConfig, ProductionConfig
from models import db
from schemas import ma
import datetime

# Import blueprints
from blueprints.bakery_bp import bakery_bp
from blueprints.product_bp import product_bp
from blueprints.review_bp import bakery_review_bp, product_review_bp
from blueprints.user_bp import user_bp
from blueprints.auth_bp import auth_bp

def create_app(config_class=None):
    """Create and configure the Flask application"""
    # Determine which config to use
    if config_class is None:
        env = os.environ.get('FLASK_ENV', 'development')
        if env == 'production':
            config_class = ProductionConfig
        else:
            config_class = DevelopmentConfig
    
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.url_map.strict_slashes = False
    
    # Configure logging
    if not app.debug:
        if not os.path.exists('logs'):
            os.mkdir('logs')
        file_handler = RotatingFileHandler('logs/bakery_app.log', maxBytes=10240, backupCount=10)
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('Bakery App startup')
    
    @app.before_request
    def log_request_info():
        if app.config.get('DEBUG', False):
            app.logger.debug('Headers: %s', request.headers)
            app.logger.debug('Method: %s', request.method)
            # Don't log request bodies as they might contain sensitive information
    
    # Initialize extensions
    db.init_app(app)
    ma.init_app(app)
    
    # Initialize JWT with extended configuration
    jwt = JWTManager(app)
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=1)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = datetime.timedelta(days=30)
    
    # Setup CORS - allow from multiple origins
    # In production, this should be configured with the actual frontend domain
    allowed_origins = app.config.get('ALLOWED_ORIGINS', ['http://localhost:5173', 'https://crumbcompass.example.com'])
    
    CORS(app, resources={
        r"/*": {
            "origins": allowed_origins,
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
            "expose_headers": ["Content-Type", "X-CSRFToken"],
            "supports_credentials": True,
            "max_age": 86400  # Cache preflight requests for 1 day
        }
    })
    
    # Register blueprints
    app.register_blueprint(bakery_bp, url_prefix='/bakeries')
    app.register_blueprint(product_bp, url_prefix='/products') 
    app.register_blueprint(bakery_review_bp, url_prefix='/bakeryreviews')
    app.register_blueprint(product_review_bp, url_prefix='/productreviews') 
    app.register_blueprint(user_bp, url_prefix='/users') 
    app.register_blueprint(auth_bp, url_prefix='/auth') 
    
    # Global error handler for uncaught exceptions
    @app.errorhandler(Exception)
    def handle_generic_error(error):
        app.logger.error(f'Unhandled exception: {str(error)}')
        return jsonify({
            'message': 'An unexpected error occurred. Please try again later.',
            'error': str(error) if app.config.get('DEBUG', False) else None
        }), 500
    
    # Create all database tables
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    app.run(host=host, port=port, debug=app.config.get('DEBUG', False))