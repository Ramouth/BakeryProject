from flask_marshmallow import Marshmallow

# Create Marshmallow instance
ma = Marshmallow()

# Import schema modules to make them available when importing the schemas package
from .bakery_schema import BakerySchema
from .pastry_schema import PastrySchema
from .review_schema import BakeryReviewSchema, PastryReviewSchema
from .user_schema import ContactSchema