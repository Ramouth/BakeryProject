# backend/config.py

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
    
    # Security configurations
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-please-change-in-production')
    
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
    
    # Override these in environment or .env file
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SECRET_KEY = os.environ.get('SECRET_KEY')
    
    # Set secure cookie options in production
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_SECURE = True
    REMEMBER_COOKIE_HTTPONLY = True

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
