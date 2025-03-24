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
    
    # Field customizations
    id = fields.Integer(dump_only=True)  # Read-only field
    firstName = fields.String(
        required=True, 
        validate=validate.Length(min=1, max=80),
        attribute='first_name'  # Map to model attribute
    )
    lastName = fields.String(
        required=True, 
        validate=validate.Length(min=1, max=80),
        attribute='last_name'  # Map to model attribute
    )
    email = fields.Email(required=True)
    isAdmin = fields.Boolean(attribute='is_admin', default=False)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    
    # Explicitly define which fields to dump and load
    class Meta:
        model = Contact
        load_instance = True
        include_fk = True
        include_relationships = True
        # Exclude the model fields that would conflict with our custom fields
        exclude = ("first_name", "last_name", "is_admin")