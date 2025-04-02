from . import ma
from models.user import Contact
from marshmallow import fields, validate

class ContactSchema(ma.SQLAlchemyAutoSchema):
    """Schema for serializing and deserializing Contact objects"""
    
    class Meta:
        model = Contact
        load_instance = True
        include_fk = True
        include_relationships = True
        # Exclude the model fields that conflict with our custom fields
        exclude = ("first_name", "last_name", "is_admin")

    # Field customizations (mapping to database fields)
    id = fields.Integer(dump_only=True)  # Read-only field
    firstName = fields.String(
        required=True, 
        validate=validate.Length(min=1, max=80),
        attribute='first_name'  # Maps to DB column `first_name`
    )
    lastName = fields.String(
        required=True, 
        validate=validate.Length(min=1, max=80),
        attribute='last_name'  # Maps to DB column `last_name`
    )
    email = fields.Email(required=True)
    isAdmin = fields.Boolean(attribute='is_admin', default=False)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
