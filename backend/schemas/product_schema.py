from backend.schemas import ma
from backend.models.product_models import Product
from marshmallow import fields, validate, post_dump, post_load

class ProductSchema(ma.SQLAlchemyAutoSchema):
    """Schema for serializing and deserializing Product objects"""
    
    class Meta:
        model = Product
        load_instance = True
        include_fk = True
        include_relationships = True
        # Exclude fields that will be renamed
        exclude = ("bakery_id", "category_id", "subcategory_id", "image_url")
    
    # Field customizations
    id = fields.Integer(dump_only=True)
    name = fields.String(required=True, validate=validate.Length(min=1, max=80))
    
    # Add description field expected by frontend
    description = fields.String(required=False, allow_none=True)
    
    # Define camelCase fields
    bakeryId = fields.Integer(required=True, attribute='bakery_id')
    categoryId = fields.Integer(required=False, attribute='category_id', allow_none=True)
    subcategoryId = fields.Integer(required=False, attribute='subcategory_id', allow_none=True)
    imageUrl = fields.String(attribute='image_url', allow_none=True)
    
    # Add rating fields expected by frontend
    average_rating = fields.Float(dump_only=True)
    averageRating = fields.Float(attribute='average_rating', dump_only=True)
    review_count = fields.Integer(dump_only=True)
    reviewCount = fields.Integer(attribute='review_count', dump_only=True)
    
    # Timestamps with both naming conventions
    created_at = fields.DateTime(dump_only=True)
    createdAt = fields.DateTime(attribute='created_at', dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    updatedAt = fields.DateTime(attribute='updated_at', dump_only=True)
    
    # Nested fields
    bakery = fields.Nested('BakerySchema', only=('id', 'name'), dump_only=True)
    category = fields.Nested('CategorySchema', only=('id', 'name'), dump_only=True)
    subcategory = fields.Nested('SubcategorySchema', only=('id', 'name', 'categoryId'), dump_only=True)
    
    @post_dump
    def add_camel_case_fields(self, data, **kwargs):
        """Convert snake_case model attributes to camelCase API fields"""
        obj = kwargs.get('obj')
        if obj:
            # Map model attributes to schema fields
            data['bakeryId'] = obj.bakery_id
            data['categoryId'] = obj.category_id
            data['subcategoryId'] = obj.subcategory_id
            data['imageUrl'] = obj.image_url if obj.image_url else None
            
            # Add support for both naming conventions for rating fields
            if hasattr(obj, 'average_rating'):
                data['average_rating'] = obj.average_rating
                data['averageRating'] = obj.average_rating
            
            if hasattr(obj, 'review_count'):
                data['review_count'] = obj.review_count
                data['reviewCount'] = obj.review_count
                
            # Add consistent timestamp fields
            if hasattr(obj, 'created_at'):
                data['createdAt'] = obj.created_at
                
            if hasattr(obj, 'updated_at'):
                data['updatedAt'] = obj.updated_at
        return data
    
    @post_load
    def process_fields(self, data, **kwargs):
        """Map camelCase fields to snake_case model attributes"""
        # Handle main fields
        if 'bakeryId' in data:
            data['bakery_id'] = data.pop('bakeryId')
        if 'categoryId' in data:
            data['category_id'] = data.pop('categoryId')
        if 'subcategoryId' in data:
            data['subcategory_id'] = data.pop('subcategoryId')
        if 'imageUrl' in data:
            data['image_url'] = data.pop('imageUrl')
            
        # Handle alternate field names
        if 'averageRating' in data:
            data['average_rating'] = data.pop('averageRating')
        if 'reviewCount' in data:
            data['review_count'] = data.pop('reviewCount')
        if 'createdAt' in data:
            data['created_at'] = data.pop('createdAt')
        if 'updatedAt' in data:
            data['updated_at'] = data.pop('updatedAt')
            
        return data