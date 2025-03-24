from . import ma
from models.review import BakeryReview, PastryReview
from marshmallow import fields, validate, post_dump, post_load

class BaseReviewSchema:
    """Base class for review schemas with common attributes"""
    id = fields.Integer(dump_only=True)
    review = fields.String(required=True)
    # Define fields without attribute mapping
    overallRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=5)
    )
    # ContactId is now optional
    contactId = fields.Integer(required=False)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class BakeryReviewSchema(ma.SQLAlchemyAutoSchema):
    """Schema for serializing and deserializing BakeryReview objects"""
    
    class Meta:
        model = BakeryReview
        load_instance = True
        include_fk = True
        include_relationships = True
        # Exclude fields that will cause collisions
        exclude = (
            "overall_rating", "contact_id", "bakery_id", 
            "service_rating", "price_rating", 
            "atmosphere_rating", "location_rating"
        )
    
    # Common fields
    id = fields.Integer(dump_only=True)
    review = fields.String(required=True)
    overallRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=5)
    )
    # ContactId is now optional
    contactId = fields.Integer(required=False)
    
    # Field customizations for specific bakery review fields
    bakeryId = fields.Integer(required=True)
    serviceRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=5)
    )
    priceRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=5)
    )
    atmosphereRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=5)
    )
    locationRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=5)
    )
    
    # Nested fields for related objects
    contact = fields.Nested('ContactSchema', only=('id', 'firstName', 'lastName'))
    bakery = fields.Nested('BakerySchema', only=('id', 'name'))
    
    # Virtual fields for easier frontend access
    contact_name = fields.String(dump_only=True)
    bakery_name = fields.String(dump_only=True)
    
    @post_dump
    def add_computed_fields(self, data, **kwargs):
        """Add computed fields after serialization"""
        obj = kwargs.get('obj')
        if obj:
            # Map model attributes to schema fields
            data['overallRating'] = obj.overall_rating
            data['bakeryId'] = obj.bakery_id
            data['serviceRating'] = obj.service_rating
            data['priceRating'] = obj.price_rating
            data['atmosphereRating'] = obj.atmosphere_rating
            data['locationRating'] = obj.location_rating
            
            # Only add contactId if it exists
            if obj.contact_id is not None:
                data['contactId'] = obj.contact_id
            
            # Add computed fields
            if obj.contact:
                data['contact_name'] = f"{obj.contact.first_name} {obj.contact.last_name}"
            if obj.bakery:
                data['bakery_name'] = obj.bakery.name
        return data
    
    @post_load
    def map_fields(self, data, **kwargs):
        """Map schema fields to model attributes"""
        # Create a dictionary for model initialization
        model_data = {
            'review': data.get('review'),
            'overall_rating': data.get('overallRating'),
            'bakery_id': data.get('bakeryId'),
            'service_rating': data.get('serviceRating'),
            'price_rating': data.get('priceRating'),
            'atmosphere_rating': data.get('atmosphereRating'),
            'location_rating': data.get('locationRating')
        }
        
        # Only include contact_id if provided
        if 'contactId' in data:
            model_data['contact_id'] = data.get('contactId')
            
        # For updates, pass the existing instance
        if 'id' in data:
            model_data['id'] = data['id']
            
        return model_data

class PastryReviewSchema(ma.SQLAlchemyAutoSchema):
    """Schema for serializing and deserializing PastryReview objects"""
    
    class Meta:
        model = PastryReview
        load_instance = True
        include_fk = True
        include_relationships = True
        # Exclude fields that will cause collisions
        exclude = (
            "overall_rating", "contact_id", "pastry_id", 
            "taste_rating", "price_rating", "presentation_rating"
        )
    
    # Common fields
    id = fields.Integer(dump_only=True)
    review = fields.String(required=True)
    overallRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=5)
    )
    # ContactId is now optional
    contactId = fields.Integer(required=False)
    
    # Field customizations for specific pastry review fields
    pastryId = fields.Integer(required=True)
    tasteRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=5)
    )
    priceRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=5)
    )
    presentationRating = fields.Integer(
        required=True, 
        validate=validate.Range(min=1, max=5)
    )
    
    # Nested fields for related objects
    contact = fields.Nested('ContactSchema', only=('id', 'firstName', 'lastName'))
    pastry = fields.Nested('PastrySchema', only=('id', 'name'))
    
    # Virtual fields for easier frontend access
    contact_name = fields.String(dump_only=True)
    pastry_name = fields.String(dump_only=True)
    
    @post_dump
    def add_computed_fields(self, data, **kwargs):
        """Add computed fields after serialization"""
        obj = kwargs.get('obj')
        if obj:
            # Map model attributes to schema fields
            data['overallRating'] = obj.overall_rating
            data['pastryId'] = obj.pastry_id
            data['tasteRating'] = obj.taste_rating
            data['priceRating'] = obj.price_rating
            data['presentationRating'] = obj.presentation_rating
            
            # Only add contactId if it exists
            if obj.contact_id is not None:
                data['contactId'] = obj.contact_id
            
            # Add computed fields
            if obj.contact:
                data['contact_name'] = f"{obj.contact.first_name} {obj.contact.last_name}"
            if obj.pastry:
                data['pastry_name'] = obj.pastry.name
        return data
    
    @post_load
    def map_fields(self, data, **kwargs):
        """Map schema fields to model attributes"""
        # Create a dictionary for model initialization
        model_data = {
            'review': data.get('review'),
            'overall_rating': data.get('overallRating'),
            'pastry_id': data.get('pastryId'),
            'taste_rating': data.get('tasteRating'),
            'price_rating': data.get('priceRating'),
            'presentation_rating': data.get('presentationRating')
        }
        
        # Only include contact_id if provided
        if 'contactId' in data:
            model_data['contact_id'] = data.get('contactId')
            
        # For updates, pass the existing instance
        if 'id' in data:
            model_data['id'] = data['id']
            
        return model_data