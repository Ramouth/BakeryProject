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