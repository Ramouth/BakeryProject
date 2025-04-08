from . import ma
from backend.models.pastry import Pastry
from marshmallow import fields, validate

class PastrySchema(ma.SQLAlchemyAutoSchema):
    """Schema for serializing and deserializing Pastry objects"""

    class Meta:
        model = Pastry
        load_instance = True
        include_fk = True
        include_relationships = True
        # We exclude bakery_id because we’re exposing it under the name bakeryId
        exclude = ("bakery_id",)

    # Field customizations
    id = fields.Integer(dump_only=True)
    name = fields.String(required=True, validate=validate.Length(min=1, max=80))
    bakeryId = fields.Integer(required=True)  # The external field name, used for input/output
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    # Use fully qualified path for the nested schema to avoid RegistryError
    bakery = fields.Nested('backend.schemas.bakery_schema.BakerySchema', only=('id', 'name'))

    # Custom dump: If a single object is dumped, make sure to pass its bakery_id as bakeryId.
    def dump(self, obj, *args, **kwargs):
        if isinstance(obj, list):
            return super().dump(obj, many=True, *args, **kwargs)
        else:
            result = super().dump(obj, *args, **kwargs)
            result['bakeryId'] = obj.bakery_id if obj else None
            return result

    # This helper method is used to dump a single instance; it mirrors the above logic.
    def _dump_single(self, obj):
        result = super().dump(obj)
        result['bakeryId'] = obj.bakery_id if obj else None
        return result

    # Custom load: Map the incoming bakeryId field back to bakery_id for the model.
    def load(self, data, *args, **kwargs):
        bakery_id = data.get('bakeryId', None)
        # Create a copy of the data to avoid modifying the input dictionary
        processed_data = {**data}
        if 'bakeryId' in processed_data:
            processed_data['bakery_id'] = bakery_id
            del processed_data['bakeryId']
        result = super().load(processed_data, *args, **kwargs)
        return result
