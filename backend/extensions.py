from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow
from flask_migrate import Migrate
from flask_cors import CORS
from flask_caching import Cache

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()
ma = Marshmallow()
migrate = Migrate()
cors = CORS()
cache = Cache()

def init_extensions(app):
    """Initialize all Flask extensions"""
    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)
    cache.init_app(app)
    migrate.init_app(app, db)  # Note: migrate needs both app and db