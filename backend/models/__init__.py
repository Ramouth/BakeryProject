from flask_sqlalchemy import SQLAlchemy

# Create database instance
db = SQLAlchemy()

# Import models to make them available when importing the models package
# These imports must come after db creation to avoid circular imports
from .bakery import Bakery
from .product import Product
from .review import BakeryReview, ProductReview
from .user import User