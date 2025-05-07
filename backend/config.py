import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

class Config:
    """Base configuration"""
    # Determine the absolute path of the backend directory
    basedir = os.path.abspath(os.path.dirname(__file__))

    # Default database file in backend/instance
    default_db = os.path.join(basedir, 'instance', 'new_bakery_reviews.db')

    # Database configuration: use DATABASE_URL env var or default to the instance file
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or f"sqlite:///{default_db}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Security configurations with safe defaults for development
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-dev-key-please-change-in-production'
    
    # CORS configuration
    ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:5173').split(',')
    
    # API configurations
    JSON_SORT_KEYS = False
    JSONIFY_PRETTYPRINT_REGULAR = False  # Disable pretty printing for performance

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    SQLALCHEMY_ECHO = True  # Log SQL queries

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    
    # Enforce required environment variables in production
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    if not SQLALCHEMY_DATABASE_URI:
        raise ValueError("DATABASE_URL is not set. Please provide it in the environment variables.")
    
    SECRET_KEY = os.environ.get('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY is not set. Please provide it in the environment variables.")
    
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    if not JWT_SECRET_KEY:
        raise ValueError("JWT_SECRET_KEY is not set. Please provide it in the environment variables.")
    
    # Set secure cookie options in production
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_SECURE = True
    REMEMBER_COOKIE_HTTPONLY = True

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'  # Use in-memory database for testing
