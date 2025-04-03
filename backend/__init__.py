# Import necessary modules
from flask import Flask

# Import models, config, and utils
from models import db
from schemas import ma
from utils.caching import cache

# Create app factory function
def create_app(config_object=None):
    """
    Create and initialize Flask application
    
    Args:
        config_object: Configuration object or class to use
        
    Returns:
        Configured Flask application
    """
    app = Flask(__name__)
    
    # Configure from object if provided, otherwise use development config
    if config_object is not None:
        app.config.from_object(config_object)
    else:
        from config import DevelopmentConfig
        app.config.from_object(DevelopmentConfig)
    
    # Initialize extensions
    db.init_app(app)
    ma.init_app(app)
    
    # Initialize caching
    from utils.caching import configure_cache
    configure_cache(app)
    
    # Register blueprints
    with app.app_context():
        from blueprints.bakery_bp import bakery_bp
        from blueprints.product_bp import product_bp
        from blueprints.review_bp import bakery_review_bp, product_review_bp
        from blueprints.user_bp import user_bp
        
        app.register_blueprint(bakery_bp, url_prefix='/bakeries')
        app.register_blueprint(product_bp, url_prefix='/products')
        app.register_blueprint(bakery_review_bp, url_prefix='/bakeryreviews')
        app.register_blueprint(product_review_bp, url_prefix='/productreviews')
        app.register_blueprint(user_bp, url_prefix='/contacts')
        
        # Create database tables
        db.create_all()
    
    return app