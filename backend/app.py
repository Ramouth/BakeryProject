from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
import os, datetime, logging
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv
from sqlalchemy import event
from flask_migrate import Migrate

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

    # ——— Logging ———
    if not app.debug:
        os.makedirs('logs', exist_ok=True)
        handler = RotatingFileHandler(
            'logs/bakery_app.log', maxBytes=10_240, backupCount=10
        )
        handler.setLevel(logging.INFO)
        handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        app.logger.addHandler(handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('Bakery App startup')

    @app.before_request
    def log_request():
        if app.debug:
            app.logger.debug(
                f'{request.method} {request.path} — Headers: {dict(request.headers)}'
            )

    # ——— Initialize extensions ———
    init_extensions(app)
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

    # ——— CORS ———
    allowed = app.config.get('ALLOWED_ORIGINS', ['http://localhost:5173'])
    CORS(app, resources={r"/*": {
        "origins": allowed,
        "methods": ["GET","POST","PATCH","PUT","DELETE","OPTIONS"],
        "allow_headers": ["Content-Type","Authorization"],
        "supports_credentials": True,
        "max_age": 86400
    }})

    # ——— Register blueprints ———
    app.register_blueprint(bakery_bp, url_prefix='/bakeries')
    app.register_blueprint(product_bp, url_prefix='/products')
    app.register_blueprint(bakery_review_bp, url_prefix='/bakeryreviews')
    app.register_blueprint(product_review_bp, url_prefix='/productreviews')
    app.register_blueprint(user_bp, url_prefix='/users')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(category_bp, url_prefix='/categories')

    # ——— Error handling ———
    @app.errorhandler(Exception)
    def catch_all(e):
        app.logger.error(f'Unhandled exception: {e}')
        return jsonify({
            'message': 'Internal server error',
            'error': str(e) if app.debug else None
        }), 500

    # import models so Flask‑Migrate can detect them
    with app.app_context():
        from backend.models import __all_models__  # noqa

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(
        host=os.getenv('HOST', '0.0.0.0'),
        port=int(os.getenv('PORT', 5000)),
        debug=app.debug
    )