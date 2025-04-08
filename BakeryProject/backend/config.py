import os
from dotenv import load_dotenv

# Load environment variables from a .env file (if present)
load_dotenv()

class ProductionConfig:
    DEBUG = False
    TESTING = False
    # If DATABASE_URL is not set in the environment, use PostgreSQL with these defaults
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "postgresql://bakery_user:gruppe8@localhost:5432/bakery_reviews"
    )
    SECRET_KEY = os.environ.get("SECRET_KEY", "production-secret-key")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Recommended settings for secure cookies in production:
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_SECURE = True
    REMEMBER_COOKIE_HTTPONLY = True

    # Optionally, you can add any other production-specific configuration here.
