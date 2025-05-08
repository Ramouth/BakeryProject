# models/__init__.py

# Do NOT create a new db instance here
# Instead, simply import models in the correct dependency order

# First import models without relationships to other models
from .user_models import User
from .category_models import Category, Subcategory

# Then import models with relationships
from .bakery_models import Bakery
from .product_models import Product

# Finally import models with relationships to multiple models
from .review_models import BakeryReview, ProductReview

# Define __all_models__ for Flask-Migrate
__all_models__ = [
    'User',
    'Category', 
    'Subcategory',
    'Bakery',
    'Product',
    'BakeryReview',
    'ProductReview'
]