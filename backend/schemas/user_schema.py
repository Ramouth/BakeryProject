from backend.extensions import ma 
from backend.models.user_models import User
from marshmallow import fields, validate

class UserSchema(ma.SQLAlchemyAutoSchema):
    """Schema for serializing and deserializing User objects"""
    
    class Meta:
        model = User
        load_instance = False
        include_fk = True
        exclude = ("password_hash", "profile_picture", "is_admin")  # Exclude these fields from default mapping
    
    # Field customizations
    id = fields.Integer(dump_only=True)  # Read-only field
    username = fields.String(required=True, validate=validate.Length(min=1, max=80))
    email = fields.Email(required=True)
    password = fields.String(required=True, load_only=True)  # Only used when loading, never expose
    
    # Explicitly define these fields with attributes
    profilePicture = fields.Integer(attribute='profile_picture', default=1, allow_none=True)
    isAdmin = fields.Boolean(attribute='is_admin', default=False)
    
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)