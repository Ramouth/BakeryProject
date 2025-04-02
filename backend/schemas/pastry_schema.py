from . import ma
from models.pastry import Pastry
from marshmallow import fields, validate, post_dump, post_load

class PastrySchema(ma.SQLAlchemyAutoSchema):
    """Schema for serializing and deserializing Pastry objects"""
    
    class Meta:
        model = Pastry
        load_instance = True
        include_fk = True
        include_relationships = True
        # Exclude the bakery_id field to avoid collision when we define our bakeryId field
        exclude = ("bakery_id",)
    
    # Field customizations
    id = fields.Integer(dump_only=True)  # Read-only field
    name = fields.String(required=True, validate=validate.Length(min=1, max=80))
    # Define bakeryId as a separate field
    bakeryId = fields.Integer(required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    
    # Nested fields - Include bakery details when serializing
    bakery = fields.Nested('BakerySchema', only=('id', 'name'))
    
    # Methods to handle the field mapping
    @post_dump
    def add_bakery_id(self, data, **kwargs):
        """Add bakeryId after serialization"""
        obj = kwargs.get('obj')
        if obj:
            data['bakeryId'] = obj.bakery_id
        return data
    
    @post_load
    def process_bakery_id(self, data, **kwargs):
        """Process bakeryId during deserialization"""
        if 'bakeryId' in data:
            data['bakery_id'] = data.pop('bakeryId')
        return data