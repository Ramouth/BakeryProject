from flask import Flask, request, jsonify
from flask_cors import CORS
import os, datetime, logging, sys
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv
from sqlalchemy import event
from waitress import serve

from backend.config import DevelopmentConfig, ProductionConfig
from backend.extensions import db, ma, migrate, jwt, cors, cache, init_extensions
from backend.utils.caching import configure_cache

# Blueprints
from backend.blueprints.bakery_bp import bakery_bp
from backend.blueprints.product_bp import product_bp
from backend.blueprints.review_bp import bakery_review_bp, product_review_bp
from backend.blueprints.user_bp import user_bp
from backend.blueprints.auth_bp import auth_bp
from backend.blueprints.category_bp import category_bp

# Load environment variables from .env file
load_dotenv()

def create_app(config_class=None):
    # choose configuration
    if not config_class:
        config_class = (
            ProductionConfig
            if os.getenv('FLASK_ENV') == 'production'
            else DevelopmentConfig
        )

    app = Flask(__name__, static_folder='static')
    app.config.from_object(config_class)
    app.url_map.strict_slashes = False

    # ——— JWT configuration ———
    app.config.update({
        'JWT_TOKEN_LOCATION': ['headers'],
        'JWT_HEADER_NAME': 'Authorization',
        'JWT_HEADER_TYPE': 'Bearer',
        'JWT_ERROR_MESSAGE_KEY': 'message',
        'JWT_ACCESS_TOKEN_EXPIRES': datetime.timedelta(hours=1),
        'JWT_REFRESH_TOKEN_EXPIRES': datetime.timedelta(days=30),
    })

    # ——— Configure logging ———
    configure_logging(app)

    # ——— Initialize extensions ———
    init_extensions(app)
    
    # Only configure cache if it's not disabled in .env
    if os.getenv('CACHE_TYPE', 'simple') != 'null':
        configure_cache(app)
    
    # ——— Enable SQLite foreign key constraints ———
    if 'sqlite' in app.config.get('SQLALCHEMY_DATABASE_URI', ''):
        def _set_sqlite_pragma(dbapi_connection, connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON;")
            cursor.close()
            app.logger.info("SQLite foreign key constraints enabled")
            
        with app.app_context():
            event.listen(db.engine, "connect", _set_sqlite_pragma)

    # ——— Configure CORS ———
    configure_cors(app)

    # ——— Register blueprints ———
    register_blueprints(app)

    # ——— Production security headers ———
    if not app.debug and os.getenv('SECURE_HEADERS', 'False').lower() == 'true':
        @app.after_request
        def add_security_headers(response):
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
            response.headers['X-Content-Type-Options'] = 'nosniff'
            response.headers['X-Frame-Options'] = 'SAMEORIGIN'
            response.headers['X-XSS-Protection'] = '1; mode=block'
            response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
            return response

    # ——— Error handling ———
    @app.errorhandler(Exception)
    def catch_all(e):
        app.logger.error(f'Unhandled exception: {e}', exc_info=True)
        return jsonify({
            'message': 'Internal server error',
            'error': str(e) if app.debug else 'An unexpected error occurred'
        }), 500

    # ——— Initialize database ———
    with app.app_context():
        initialize_database(app)
        
    @app.before_request
    def log_request():
        if request.path != '/health' and not request.path.startswith('/static/'):
            app.logger.info(f'{request.remote_addr} - {request.method} {request.path}')

    return app

def configure_logging(app):
    """Set up logging for the application"""
    if not app.debug:
        log_dir = os.path.dirname(os.getenv('LOG_FILE_PATH', 'logs/bakery_app.log'))
        os.makedirs(log_dir, exist_ok=True)
        
        # File handler
        file_handler = RotatingFileHandler(
            os.getenv('LOG_FILE_PATH', 'logs/bakery_app.log'),
            maxBytes=1024 * 1024 * 5,  # 5 MB
            backupCount=10
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(getattr(logging, os.getenv('LOG_LEVEL', 'INFO')))
        
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s'
        ))
        console_handler.setLevel(getattr(logging, os.getenv('LOG_LEVEL', 'INFO')))
        
        # Add handlers
        app.logger.addHandler(file_handler)
        app.logger.addHandler(console_handler)
        app.logger.setLevel(getattr(logging, os.getenv('LOG_LEVEL', 'INFO')))
        
        # Remove default handler
        app.logger.handlers = [h for h in app.logger.handlers if not isinstance(h, logging.StreamHandler) or h is console_handler]
        
        app.logger.info('Bakery App starting with production logging')

def configure_cors(app):
    """Configure CORS for the application"""
    # Parse comma-separated list of allowed origins
    allowed_origin = os.getenv('ALLOWED_ORIGIN', '')
    origins = [origin.strip() for origin in allowed_origin.split(',') if origin.strip()]
    
    # In production, we should NEVER default to localhost
    if not origins and app.debug:
        origins = ['http://localhost:5173']
    elif not origins:
        # For production, if no origins are specified, only allow the main domain
        app.logger.warning("No CORS origins specified in environment, defaulting to secure settings")
        origins = ['https://crumbcompass.dk', 'https://www.crumbcompass.dk', 'https://api.crumbcompass.dk']
    
    app.logger.info(f"CORS configured with allowed origins: {origins}")
    
    CORS(app, resources={r"/*": {
        "origins": origins,
        "methods": ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 86400
    }})

def register_blueprints(app):
    """Register all application blueprints"""
    app.register_blueprint(bakery_bp, url_prefix='/bakeries')
    app.register_blueprint(product_bp, url_prefix='/products')
    app.register_blueprint(bakery_review_bp, url_prefix='/bakeryreviews')
    app.register_blueprint(product_review_bp, url_prefix='/productreviews')
    app.register_blueprint(user_bp, url_prefix='/users')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(category_bp, url_prefix='/categories')
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({"status": "healthy", "time": datetime.datetime.now().isoformat()})

def initialize_database(app):
    """Initialize database, import models and create tables"""
    try:
        # Import models so Flask‑Migrate can detect them
        from backend.models import __all_models__  # noqa
        
        # Check if tables need to be created
        inspector = db.inspect(db.engine)
        if not inspector.get_table_names():
            db.create_all()
            app.logger.info("Database tables created successfully")
        else:
            app.logger.info("Database tables already exist")
    except Exception as e:
        app.logger.error(f"Error initializing database: {e}", exc_info=True)
        raise

if __name__ == '__main__':
    app = create_app()
    
    # For production, use a production WSGI server
    if os.getenv('FLASK_ENV') == 'production':
        host = os.getenv('HOST', '0.0.0.0')
        port = int(os.getenv('PORT', 5000))
        app.logger.info(f"Starting production server on {host}:{port}")
        
        # Use waitress as a production WSGI server
        serve(app, host=host, port=port, threads=8)
    else:
        # Development mode
        app.run(
            host=os.getenv('HOST', '0.0.0.0'),
            port=int(os.getenv('PORT', 5000)),
            debug=True
        )
