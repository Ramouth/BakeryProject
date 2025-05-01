from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os, datetime, logging
from logging.handlers import RotatingFileHandler

from config import DevelopmentConfig, ProductionConfig
from models import db
from schemas import ma

# Blueprints
from blueprints.bakery_bp import bakery_bp
from blueprints.product_bp import product_bp
from blueprints.review_bp import bakery_review_bp, product_review_bp
from blueprints.user_bp import user_bp
from blueprints.auth_bp import auth_bp

def create_app(config_class=None):
    # Pick config
    if not config_class:
        config_class = ProductionConfig if os.getenv('FLASK_ENV')=='production' else DevelopmentConfig

    app = Flask(__name__, static_folder='static')
    app.config.from_object(config_class)
    app.url_map.strict_slashes = False

    # —————— JWT CONFIGURATION ——————
    app.config.update({
        # Where to look for the token
        'JWT_TOKEN_LOCATION': ['headers'],
        # Header name & type
        'JWT_HEADER_NAME': 'Authorization',
        'JWT_HEADER_TYPE': 'Bearer',
        # Use “message” key instead of “msg” in errors
        'JWT_ERROR_MESSAGE_KEY': 'message',
        # Token expiry
        'JWT_ACCESS_TOKEN_EXPIRES': datetime.timedelta(hours=1),
        'JWT_REFRESH_TOKEN_EXPIRES': datetime.timedelta(days=30),
    })
    jwt = JWTManager(app)

    # —————— LOGGING ——————
    if not app.debug:
        os.makedirs('logs', exist_ok=True)
        handler = RotatingFileHandler('logs/bakery_app.log', maxBytes=10_240, backupCount=10)
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
            app.logger.debug(f'{request.method} {request.path} — Headers: {dict(request.headers)}')

    # —————— EXTENSIONS ——————
    db.init_app(app)
    ma.init_app(app)

    # —————— CORS ——————
    allowed = app.config.get('ALLOWED_ORIGINS', ['http://localhost:5173'])
    CORS(app, resources={r"/*": {
        "origins": allowed,
        "methods": ["GET","POST","PATCH","PUT","DELETE","OPTIONS"],
        "allow_headers": ["Content-Type","Authorization"],
        "supports_credentials": True,
        "max_age": 86400
    }})

    # —————— BLUEPRINTS ——————
    app.register_blueprint(bakery_bp, url_prefix='/bakeries')
    app.register_blueprint(product_bp, url_prefix='/products')
    app.register_blueprint(bakery_review_bp, url_prefix='/bakeryreviews')
    app.register_blueprint(product_review_bp, url_prefix='/productreviews')
    app.register_blueprint(user_bp, url_prefix='/users')
    app.register_blueprint(auth_bp, url_prefix='/auth')

    # —————— ERROR HANDLING ——————
    @app.errorhandler(Exception)
    def catch_all(e):
        app.logger.error(f'Unhandled exception: {e}')
        return jsonify({
            'message': 'Internal server error',
            'error': str(e) if app.debug else None
        }), 500

    # —————— DB INIT ——————
    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host=os.getenv('HOST','0.0.0.0'),
            port=int(os.getenv('PORT',5000)),
            debug=app.debug)
