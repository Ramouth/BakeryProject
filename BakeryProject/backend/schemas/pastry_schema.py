from . import ma
from backend.models.pastry import Pastry  # ✅
from marshmallow import fields, validate

class PastrySchema(ma.SQLAlchemyAutoSchema):
    """Schema for serializing and deserializing Pastry objects"""
    
    class Meta:
        model = Pastry
        load_instance = True
        include_fk = True
        include_relationships = True
        # Exclude the bakery_id field to avoid collision
        exclude = ("bakery_id",)
    
    # Field customizations
    id = fields.Integer(dump_only=True)  # Read-only field
    name = fields.String(required=True, validate=validate.Length(min=1, max=80))
    # Define bakeryId as a separate field without attribute mapping
    bakeryId = fields.Integer(required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    
    # Nested fields - Include bakery details when serializing
    bakery = fields.Nested('BakerySchema', only=('id', 'name'))

    # Methods to handle the attribute mapping manually
    def dump(self, obj, *args, **kwargs):
    # Check if obj is a list (many objects)
        if isinstance(obj, list):
        # If it's a list, we can call the superclass dump with many=True
            return super().dump(obj, many=True, *args, **kwargs)
        else:
            # Otherwise, it's a single object
            result = super().dump(obj, *args, **kwargs)
            result['bakeryId'] = obj.bakery_id if obj else None
            return result


    def _dump_single(self, obj):
        # This method handles dumping a single pastry
        result = super().dump(obj)
        result['bakeryId'] = obj.bakery_id if obj else None
        return result


    def load(self, data, *args, **kwargs):
        # Extract bakeryId from input data to use later
        bakery_id = data.get('bakeryId', None)
        # Create a copy to avoid modifying the input
        processed_data = {**data}
        # If bakeryId is present, add it as bakery_id
        if 'bakeryId' in processed_data:
            processed_data['bakery_id'] = bakery_id
            del processed_data['bakeryId']
        # Load the processed data
        result = super().load(processed_data, *args, **kwargs)
        return result