from flask_marshmallow import Marshmallow

# Create Marshmallow instance
ma = Marshmallow()

# Import schema modules to make them available when importing the schemas package
from .bakery_schema import BakerySchema
from .product_schema import productSchema
from .review_schema import BakeryReviewSchema, productReviewSchema
from .user_schema import ContactSchema