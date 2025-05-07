from . import ma
from backend.models.bakery_models import Bakery
from marshmallow import fields, validate, post_dump, post_load

class BakerySchema(ma.SQLAlchemyAutoSchema):
    """Schema for serializing and deserializing Bakery objects"""
    
    class Meta:
        model = Bakery
        load_instance = True
        include_fk = True
        include_relationships = True
        # Exclude the fields that will be renamed
        exclude = ("zip_code", "street_name", "street_number", "image_url", "website_url")
    
    # Field customizations
    id = fields.Integer(dump_only=True)  # Read-only field
    name = fields.String(required=True, validate=validate.Length(min=1, max=80))
    
    # Define fields with camelCase naming
    zipCode = fields.String(
        required=True,
        validate=validate.Regexp(r'^\d{4}$', error='Zip code must be a 4-digit number'),
        attribute='zip_code'
    )
    streetName = fields.String(attribute='street_name')
    streetNumber = fields.String(attribute='street_number')
    imageUrl = fields.String(attribute='image_url')
    websiteUrl = fields.String(attribute='website_url')
    
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    
    # Nested fields
    products = fields.List(fields.Nested('ProductSchema', exclude=('bakery',)), dump_only=True)
    
    @post_dump
    def add_camel_case_fields(self, data, **kwargs):
        """Convert snake_case model attributes to camelCase API fields"""
        obj = kwargs.get('obj')
        if obj:
            # Map model attributes to schema fields
            data['zipCode'] = obj.zip_code
            data['streetName'] = obj.street_name if obj.street_name else None
            data['streetNumber'] = obj.street_number if obj.street_number else None
            data['imageUrl'] = obj.image_url if obj.image_url else None
            data['websiteUrl'] = obj.website_url if obj.website_url else None
        return data
    
    @post_load
    def process_fields(self, data, **kwargs):
        """Map camelCase fields to snake_case model attributes"""
        if 'zipCode' in data:
            data['zip_code'] = data.pop('zipCode')
        if 'streetName' in data:
            data['street_name'] = data.pop('streetName')
        if 'streetNumber' in data:
            data['street_number'] = data.pop('streetNumber')
        if 'imageUrl' in data:
            data['image_url'] = data.pop('imageUrl')
        if 'websiteUrl' in data:
            data['website_url'] = data.pop('websiteUrl')
        return data