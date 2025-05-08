import pytest
from schemas import ProductSchema
from models import Product

def test_product_serialization(app, sample_bakery, sample_category, sample_subcategory):
    """Test serializing a Product object."""
    with app.app_context():
        # Create a product object
        product = Product(
            name='Schema Test Product',
            price=75.00,
            description='A product for schema testing',
            bakery_id=sample_bakery.id,
            category_id=sample_category.id,
            subcategory_id=sample_subcategory.id,
            image_url='https://example.com/product.jpg'
        )
        
        # Serialize with schema
        schema = ProductSchema()
        result = schema.dump(product)
        
        # Check serialized data
        assert result['name'] == 'Schema Test Product'
        assert float(result['price']) == 75.00
        assert result['description'] == 'A product for schema testing'
        assert result['bakeryId'] == sample_bakery.id  # Test camelCase conversion
        assert result['categoryId'] == sample_category.id
        assert result['subcategoryId'] == sample_subcategory.id
        assert result['imageUrl'] == 'https://example.com/product.jpg'

def test_product_deserialization(app, sample_bakery, sample_category, sample_subcategory):
    """Test deserializing to a Product object."""
    with app.app_context():
        # Create product data with camelCase fields
        product_data = {
            'name': 'New Schema Product',
            'price': 85.00,
            'description': 'A new product for schema testing',
            'bakeryId': sample_bakery.id,
            'categoryId': sample_category.id,
            'subcategoryId': sample_subcategory.id,
            'imageUrl': 'https://example.com/newproduct.jpg'
        }
        
        # Deserialize with schema
        schema = ProductSchema()
        product = schema.load(product_data)
        
        # Check deserialized object
        assert product.name == 'New Schema Product'
        assert float(product.price) == 85.00
        assert product.description == 'A new product for schema testing'
        assert product.bakery_id == sample_bakery.id  # Test snake_case conversion
        assert product.category_id == sample_category.id
        assert product.subcategory_id == sample_subcategory.id
        assert product.image_url == 'https://example.com/newproduct.jpg'

def test_product_validation(app):
    """Test validation in Product schema."""
    with app.app_context():
        # Create invalid product data (missing required bakeryId)
        invalid_product_data = {
            'name': 'Invalid Product',
            'price': 100.00
            # Missing bakeryId which is required
        }
        
        # Try to deserialize with schema
        schema = ProductSchema()
        with pytest.raises(Exception):  # Should raise a validation error
            schema.load(invalid_product_data)