"""
Schema definitions for serializing/deserializing data models.
"""
# Define what's exposed by this package
__all__ = [
    'BakerySchema',
    'ProductSchema', 
    'BakeryReviewSchema', 
    'ProductReviewSchema',
    'UserSchema',
    'CategorySchema',
    'SubcategorySchema'
]

# Import the schemas, but don't do anything with them yet
# Just make them available for import from this package
from .bakery_schema import BakerySchema
from .product_schema import ProductSchema
from .review_schema import BakeryReviewSchema, ProductReviewSchema
from .user_schema import UserSchema
from .category_schema import CategorySchema, SubcategorySchema