from flask_marshmallow import Marshmallow

# Create Marshmallow instance
ma = Marshmallow()

# Import schema modules to make them available when importing the schemas package
from backend.schemas.bakery_schema import BakerySchema
from backend.schemas.product_schema import ProductSchema
from backend.schemas.review_schema import BakeryReviewSchema, ProductReviewSchema
from backend.schemas.user_schema import UserSchema
from backend.schemas.category_schema import CategorySchema, SubcategorySchema