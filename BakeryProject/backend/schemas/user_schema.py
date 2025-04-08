from . import ma
from backend.models.user import Contact
from marshmallow import fields, validate

class ContactSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Contact
        load_instance = True
        include_fk = True
        include_relationships = True
        exclude = ("first_name", "last_name", "is_admin")

    id = fields.Integer(dump_only=True)
    firstName = fields.String(
        required=True,
        validate=validate.Length(min=1, max=80),
        attribute='first_name'
    )
    lastName = fields.String(
        required=True,
        validate=validate.Length(min=1, max=80),
        attribute='last_name'
    )
    email = fields.Email(required=True)
    isAdmin = fields.Boolean(attribute='is_admin', default=False)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
