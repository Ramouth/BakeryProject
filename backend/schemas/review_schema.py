from . import ma
from models.review import BakeryReview, PastryReview
from marshmallow import fields, validate

class BaseReviewSchema:
    """Base class for review schemas with common attributes"""
    id = fields.Integer(dump_only=True)  # Read-only field
    review = fields.String(required=True)
    overallRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=5),
        attribute='overall_rating'  # Map to model attribute
    )
    contactId = fields.Integer(required=True, attribute='contact_id')
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class BakeryReviewSchema(ma.SQLAlchemyAutoSchema, BaseReviewSchema):
    """Schema for serializing and deserializing BakeryReview objects"""
    
    class Meta:
        model = BakeryReview
        load_instance = True
        include_fk = True
        include_relationships = True
    
    # Field customizations for specific bakery review fields
    bakeryId = fields.Integer(required=True, attribute='bakery_id')
    serviceRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=5),
        attribute='service_rating'
    )
    priceRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=5),
        attribute='price_rating'
    )
    atmosphereRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=5),
        attribute='atmosphere_rating'
    )
    locationRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=5),
        attribute='location_rating'
    )
    
    # Nested fields for related objects
    contact = fields.Nested('ContactSchema', only=('id', 'firstName', 'lastName'))
    bakery = fields.Nested('BakerySchema', only=('id', 'name'))
    
    # Virtual fields for easier frontend access
    contact_name = fields.Method("get_contact_name", dump_only=True)
    bakery_name = fields.Method("get_bakery_name", dump_only=True)
    
    def get_contact_name(self, obj):
        if obj.contact:
            return f"{obj.contact.first_name} {obj.contact.last_name}"
        return None
    
    def get_bakery_name(self, obj):
        if obj.bakery:
            return obj.bakery.name
        return None

class PastryReviewSchema(ma.SQLAlchemyAutoSchema, BaseReviewSchema):
    """Schema for serializing and deserializing PastryReview objects"""
    
    class Meta:
        model = PastryReview
        load_instance = True
        include_fk = True
        include_relationships = True
    
    # Field customizations for specific pastry review fields
    pastryId = fields.Integer(required=True, attribute='pastry_id')
    tasteRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=5),
        attribute='taste_rating'
    )
    priceRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=5),
        attribute='price_rating'
    )
    presentationRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=5),
        attribute='presentation_rating'
    )
    
    # Nested fields for related objects
    contact = fields.Nested('ContactSchema', only=('id', 'firstName', 'lastName'))
    pastry = fields.Nested('PastrySchema', only=('id', 'name'))
    
    # Virtual fields for easier frontend access
    contact_name = fields.Method("get_contact_name", dump_only=True)
    pastry_name = fields.Method("get_pastry_name", dump_only=True)
    
    def get_contact_name(self, obj):
        if obj.contact:
            return f"{obj.contact.first_name} {obj.contact.last_name}"
        return None
    
    def get_pastry_name(self, obj):
        if obj.pastry:
            return obj.pastry.name
        return None