from . import ma
from models.bakery import Bakery
from marshmallow import fields, validate, post_dump, post_load

class BakerySchema(ma.SQLAlchemyAutoSchema):
    """Schema for serializing and deserializing Bakery objects"""
    
    class Meta:
        model = Bakery
        load_instance = True
        include_fk = True
        include_relationships = True
        # Exclude the zip_code field to avoid collision when we define our zipCode field
        exclude = ("zip_code",)
    
    # Field customizations
    id = fields.Integer(dump_only=True)  # Read-only field
    name = fields.String(required=True, validate=validate.Length(min=1, max=80))
    # Define zipCode as a separate field
    zipCode = fields.String(
        required=True,
        validate=validate.Regexp(r'^\d{4}$', error='Zip code must be a 4-digit number')
    )
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    
    # Methods to handle the field mapping
    @post_dump
    def add_zip_code(self, data, **kwargs):
        """Add zipCode after serialization"""
        obj = kwargs.get('obj')
        if obj:
            data['zipCode'] = obj.zip_code
        return data
    
    @post_load
    def process_zip_code(self, data, **kwargs):
        """Process zipCode during deserialization"""
        if 'zipCode' in data:
            data['zip_code'] = data.pop('zipCode')
        return data