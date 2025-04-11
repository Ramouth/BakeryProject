from flask import Flask
from .models import db
from .schemas import ma
from .utils.caching import cache, configure_cache
from flask_migrate import Migrate   # Import Flask-Migrate
from .app import create_app

# Create a global migrate instance
migrate = Migrate()

def create_app(config_object=None):
    """
    Create and initialize the Flask application.
    """
    app = Flask(__name__)

    # Configure app
    if config_object is not None:
        app.config.from_object(config_object)
    else:
        from .config import DevelopmentConfig
        app.config.from_object(DevelopmentConfig)

    # Initialize extensions
    db.init_app(app)
    ma.init_app(app)
    configure_cache(app)
    migrate.init_app(app, db)  # Initialize Flask-Migrate and register its CLI commands

    # Register blueprints
    with app.app_context():
        from .blueprints.bakery_bp import bakery_bp
        from .blueprints.pastry_bp import pastry_bp
        from .blueprints.review_bp import bakery_review_bp, pastry_review_bp
        from .blueprints.user_bp import user_bp

        app.register_blueprint(bakery_bp, url_prefix='/bakeries')
        app.register_blueprint(pastry_bp, url_prefix='/pastries')
        app.register_blueprint(bakery_review_bp, url_prefix='/bakeryreviews')
        app.register_blueprint(pastry_review_bp, url_prefix='/pastryreviews')
        app.register_blueprint(user_bp, url_prefix='/contacts')

        # Optional: import models to ensure SQLAlchemy sees them (needed in some lazy-load setups)
        from .models.bakery import Bakery
        from .models.pastry import Pastry
        from .models.review import BakeryReview, PastryReview
        from .models.user import Contact
        
        # DO NOT CALL db.create_all() if you're using Flask-Migrate
        # db.create_all()

    return app
