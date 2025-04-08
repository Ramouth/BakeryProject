from . import ma
from backend.models.bakery import Bakery
from marshmallow import fields, validate

class BakerySchema(ma.SQLAlchemyAutoSchema):
    """Schema for serializing and deserializing Bakery objects"""
    
    class Meta:
        model = Bakery
        load_instance = True
        include_fk = True
        include_relationships = True
        # Exclude the zip_code field to avoid collision
        exclude = ("zip_code",)
    
    # Field customizations
    id = fields.Integer(dump_only=True)  # Read-only field
    name = fields.String(required=True, validate=validate.Length(min=1, max=80))
    # Define zipCode as a separate field
    zipCode = fields.String(
        required=True,
        validate=validate.Regexp(r'^\d{4}$', error='Zip code must be a 4-digit number'),
        # No attribute mapping here
    )
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    # Methods to handle the attribute mapping manually
    def dump(self, obj, *args, **kwargs):
    # Check if obj is a list (many objects)
        if isinstance(obj, list):
        # If it's a list, we can call the superclass dump with many=True
            return super().dump(obj, many=True, *args, **kwargs)
        else:
            # Otherwise, it's a single object
            result = super().dump(obj, *args, **kwargs)
            result['zipCode'] = obj.zip_code if obj else None
            return result


    def _dump_single(self, obj):
        # This method handles dumping a single bakery
        result = super().dump(obj)
        result['zipCode'] = obj.zip_code if obj else None
        return result


    def load(self, data, *args, **kwargs):
        # Extract zipCode from input data to use later
        zip_code = data.get('zipCode', None)
        # Create a copy to avoid modifying the input
        processed_data = {**data}
        # If zipCode is present, add it as zip_code
        if 'zipCode' in processed_data:
            processed_data['zip_code'] = zip_code
            del processed_data['zipCode']
        # Load the processed data
        result = super().load(processed_data, *args, **kwargs)
        return result