from . import ma
from models.pastry import Pastry
from marshmallow import fields, validate

class PastrySchema(ma.SQLAlchemyAutoSchema):
    """Schema for serializing and deserializing Pastry objects"""
    
    class Meta:
        model = Pastry
        load_instance = True
        include_fk = True
        include_relationships = True
    
    # Field customizations
    id = fields.Integer(dump_only=True)  # Read-only field
    name = fields.String(required=True, validate=validate.Length(min=1, max=80))
    bakeryId = fields.Integer(required=True, attribute='bakery_id')  # Map to model attribute
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    
    # Nested fields - Include bakery details when serializing
    bakery = fields.Nested('BakerySchema', only=('id', 'name'))