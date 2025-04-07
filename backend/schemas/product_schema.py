# schemas/product_schema.py
from . import ma
from models.product import Product
from marshmallow import fields, validate, post_dump, post_load

class ProductSchema(ma.SQLAlchemyAutoSchema):
    """Schema for serializing and deserializing Product objects"""
    
    class Meta:
        model = Product
        load_instance = True
        include_fk = True
        include_relationships = True
        # Exclude fields that will be renamed
        exclude = ("bakery_id", "image_url")
    
    # Field customizations
    id = fields.Integer(dump_only=True)  # Read-only field
    name = fields.String(required=True, validate=validate.Length(min=1, max=80))
    
    # Define camelCase fields
    bakeryId = fields.Integer(required=True, attribute='bakery_id')
    category = fields.String(required=True)
    imageUrl = fields.String(attribute='image_url')
    
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    
    # Nested fields
    bakery = fields.Nested('BakerySchema', only=('id', 'name'), dump_only=True)
    
    @post_dump
    def add_camel_case_fields(self, data, **kwargs):
        """Convert snake_case model attributes to camelCase API fields"""
        obj = kwargs.get('obj')
        if obj:
            # Map model attributes to schema fields
            data['bakeryId'] = obj.bakery_id
            data['imageUrl'] = obj.image_url if obj.image_url else None
        return data
    
    @post_load
    def process_fields(self, data, **kwargs):
        """Map camelCase fields to snake_case model attributes"""
        if 'bakeryId' in data:
            data['bakery_id'] = data.pop('bakeryId')
        if 'imageUrl' in data:
            data['image_url'] = data.pop('imageUrl')
        return data