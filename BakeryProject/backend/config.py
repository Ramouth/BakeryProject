import os
from dotenv import load_dotenv

# Load environment variables from a .env file if it exists
load_dotenv()

# Get the base directory of the project (important for SQLite path)
basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    """Base configuration"""
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        f'sqlite:///{os.path.join(basedir, "bakery_reviews.db")}'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-please-change-in-production')
    JSON_SORT_KEYS = False
    JSONIFY_PRETTYPRINT_REGULAR = False

    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_recycle': 280,
        'pool_pre_ping': True,
        'pool_size': 10,
        'max_overflow': 20,
    }

    CACHE_TYPE = 'simple'
    CACHE_DEFAULT_TIMEOUT = 300  # seconds


class DevelopmentConfig(Config):
    """Development-specific configuration"""
    DEBUG = True
    SQLALCHEMY_ECHO = True


class ProductionConfig(Config):
    """Production-specific configuration"""
    DEBUG = False
    TESTING = False

    # Make sure to override these securely in production
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SECRET_KEY = os.environ.get('SECRET_KEY')

    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_SECURE = True
    REMEMBER_COOKIE_HTTPONLY = True


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
