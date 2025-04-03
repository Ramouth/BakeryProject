# schemas/review_schema.py
from . import ma
from models.review import BakeryReview, ProductReview
from marshmallow import fields, validate, post_dump, post_load

class BaseReviewSchema:
    """Base class for review schemas with common attributes"""
    id = fields.Integer(dump_only=True)
    review = fields.String(required=True)
    # Define fields without attribute mapping
    overallRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=10)
    )
    # UserId is now optional
    userId = fields.Integer(required=False)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class BakeryReviewSchema(ma.SQLAlchemyAutoSchema):
    """Schema for serializing and deserializing BakeryReview objects"""
    
    class Meta:
        model = BakeryReview
        load_instance = True
        include_fk = True
        include_relationships = True
        # Exclude fields that will cause collisions
        exclude = (
            "overall_rating", "user_id", "bakery_id", 
            "service_rating", "price_rating", 
            "atmosphere_rating", "location_rating"
        )
    
    # Common fields
    id = fields.Integer(dump_only=True)
    review = fields.String(required=True)
    overallRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=10),
        attribute='overall_rating'
    )
    # UserId is now optional
    userId = fields.Integer(required=False, attribute='user_id')
    
    # Field customizations for specific bakery review fields
    bakeryId = fields.Integer(required=True, attribute='bakery_id')
    serviceRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=10),
        attribute='service_rating'
    )
    priceRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=10),
        attribute='price_rating'
    )
    atmosphereRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=10),
        attribute='atmosphere_rating'
    )
    locationRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=10),
        attribute='location_rating'
    )
    
    # Nested fields for related objects
    user = fields.Nested('UserSchema', only=('id', 'username'), dump_only=True)
    bakery = fields.Nested('BakerySchema', only=('id', 'name'), dump_only=True)
    
    # Virtual fields for easier frontend access
    username = fields.String(dump_only=True)
    bakery_name = fields.String(dump_only=True)
    
    @post_dump
    def add_computed_fields(self, data, **kwargs):
        """Add computed fields after serialization"""
        obj = kwargs.get('obj')
        if obj:
            # Map model attributes to schema fields
            data['overallRating'] = obj.overall_rating
            data['bakeryId'] = obj.bakery_id
            data['serviceRating'] = obj.service_rating
            data['priceRating'] = obj.price_rating
            data['atmosphereRating'] = obj.atmosphere_rating
            data['locationRating'] = obj.location_rating
            
            # Only add userId if it exists
            if obj.user_id is not None:
                data['userId'] = obj.user_id
            
            # Add computed fields
            if obj.user:
                data['username'] = obj.user.username
            if obj.bakery:
                data['bakery_name'] = obj.bakery.name
        return data
    
    @post_load
    def map_fields(self, data, **kwargs):
        """Map camelCase API fields to snake_case model attributes"""
        result = {}
        
        # Map standard fields
        if 'review' in data:
            result['review'] = data['review']
        if 'overallRating' in data:
            result['overall_rating'] = data['overallRating']
        if 'userId' in data:
            result['user_id'] = data['userId']
        if 'bakeryId' in data:
            result['bakery_id'] = data['bakeryId']
        
        # Map rating fields
        if 'serviceRating' in data:
            result['service_rating'] = data['serviceRating']
        if 'priceRating' in data:
            result['price_rating'] = data['priceRating']
        if 'atmosphereRating' in data:
            result['atmosphere_rating'] = data['atmosphereRating']
        if 'locationRating' in data:
            result['location_rating'] = data['locationRating']
            
        # For updates, pass the existing instance id
        if 'id' in data:
            result['id'] = data['id']
            
        return result

class ProductReviewSchema(ma.SQLAlchemyAutoSchema):
    """Schema for serializing and deserializing ProductReview objects"""
    
    class Meta:
        model = ProductReview
        load_instance = True
        include_fk = True
        include_relationships = True
        # Exclude fields that will cause collisions
        exclude = (
            "overall_rating", "user_id", "product_id", 
            "taste_rating", "price_rating", "presentation_rating"
        )
    
    # Common fields
    id = fields.Integer(dump_only=True)
    review = fields.String(required=True)
    overallRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=10),
        attribute='overall_rating'
    )
    # UserId is now optional
    userId = fields.Integer(required=False, attribute='user_id')
    
    # Field customizations for specific product review fields
    productId = fields.Integer(required=True, attribute='product_id')
    tasteRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=10),
        attribute='taste_rating'
    )
    priceRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=10),
        attribute='price_rating'
    )
    presentationRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=10),
        attribute='presentation_rating'
    )
    
    # Nested fields for related objects
    user = fields.Nested('UserSchema', only=('id', 'username'), dump_only=True)
    product = fields.Nested('ProductSchema', only=('id', 'name'), dump_only=True)
    
    # Virtual fields for easier frontend access
    username = fields.String(dump_only=True)
    product_name = fields.String(dump_only=True)
    
    @post_dump
    def add_computed_fields(self, data, **kwargs):
        """Add computed fields after serialization"""
        obj = kwargs.get('obj')
        if obj:
            # Map model attributes to schema fields
            data['overallRating'] = obj.overall_rating
            data['productId'] = obj.product_id
            data['tasteRating'] = obj.taste_rating
            data['priceRating'] = obj.price_rating
            data['presentationRating'] = obj.presentation_rating
            
            # Only add userId if it exists
            if obj.user_id is not None:
                data['userId'] = obj.user_id
            
            # Add computed fields
            if obj.user:
                data['username'] = obj.user.username
            if obj.product:
                data['product_name'] = obj.product.name
        return data
    
    @post_load
    def map_fields(self, data, **kwargs):
        """Map camelCase API fields to snake_case model attributes"""
        result = {}
        
        # Map standard fields
        if 'review' in data:
            result['review'] = data['review']
        if 'overallRating' in data:
            result['overall_rating'] = data['overallRating']
        if 'userId' in data:
            result['user_id'] = data['userId']
        if 'productId' in data:
            result['product_id'] = data['productId']
        
        # Map rating fields
        if 'tasteRating' in data:
            result['taste_rating'] = data['tasteRating']
        if 'priceRating' in data:
            result['price_rating'] = data['priceRating']
        if 'presentationRating' in data:
            result['presentation_rating'] = data['presentationRating']
            
        # For updates, pass the existing instance id
        if 'id' in data:
            result['id'] = data['id']
            
        return result