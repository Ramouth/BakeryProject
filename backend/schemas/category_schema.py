from . import ma
from models.category_models import Category, Subcategory
from marshmallow import fields, validate, post_dump

class CategorySchema(ma.SQLAlchemyAutoSchema):
    """Schema for serializing and deserializing Category objects"""
    
    class Meta:
        model = Category
        load_instance = True
        include_relationships = True
    
    id = fields.Integer(dump_only=True)
    name = fields.String(required=True, validate=validate.Length(min=1, max=50))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    
    # Nested fields
    subcategories = fields.List(fields.Nested('SubcategorySchema', exclude=('category',)), dump_only=True)
    
    @post_dump
    def process_output(self, data, **kwargs):
        """Process output before returning to client"""
        if 'subcategories' in data and data['subcategories'] is None:
            data['subcategories'] = []
        return data

class SubcategorySchema(ma.SQLAlchemyAutoSchema):
    """Schema for serializing and deserializing Subcategory objects"""
    
    class Meta:
        model = Subcategory
        load_instance = True
        include_fk = True
        include_relationships = True
        exclude = ("category_id",)
    
    id = fields.Integer(dump_only=True)
    name = fields.String(required=True, validate=validate.Length(min=1, max=50))
    categoryId = fields.Integer(required=True, attribute='category_id')
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    
    # Nested fields
    category = fields.Nested('CategorySchema', only=('id', 'name'), dump_only=True)