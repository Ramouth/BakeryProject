from . import ma
from models.bakery import Bakery
from marshmallow import fields, validate

class BakerySchema(ma.SQLAlchemyAutoSchema):
    """Schema for serializing and deserializing Bakery objects"""
    
    class Meta:
        model = Bakery
        load_instance = True
        include_fk = True
        include_relationships = True
    
    # Field customizations
    id = fields.Integer(dump_only=True)  # Read-only field
    name = fields.String(required=True, validate=validate.Length(min=1, max=80))
    zipCode = fields.String(
        required=True,
        validate=validate.Regexp(r'^\d{4}$', error='Zip code must be a 4-digit number'),
        attribute='zip_code'  # Map to model attribute
    )
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    # Nested fields if needed
    # pastries = fields.Nested('PastrySchema', many=True, exclude=('bakery',))