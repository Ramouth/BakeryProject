from flask_sqlalchemy import SQLAlchemy

# Create database instance
db = SQLAlchemy()

# Import models to make them available when importing the models package
# These imports must come after db creation to avoid circular imports
from .bakery_models import Bakery
from .product_models import Product
from .review_models import BakeryReview, ProductReview
from .user_models import User