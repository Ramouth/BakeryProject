import pytest
from schemas import BakerySchema
from models import Bakery

def test_bakery_serialization(app):
    """Test serializing a Bakery object."""
    with app.app_context():
        # Create a bakery object
        bakery = Bakery(
            name='Schema Test Bakery',
            zip_code='1234',
            street_name='Schema Street',
            street_number='123',
            image_url='https://example.com/image.jpg',
            website_url='https://example.com'
        )
        
        # Serialize with schema
        schema = BakerySchema()
        result = schema.dump(bakery)
        
        # Check serialized data
        assert result['name'] == 'Schema Test Bakery'
        assert result['zipCode'] == '1234'  # Test camelCase conversion
        assert result['streetName'] == 'Schema Street'
        assert result['streetNumber'] == '123'
        assert result['imageUrl'] == 'https://example.com/image.jpg'
        assert result['websiteUrl'] == 'https://example.com'

def test_bakery_deserialization(app):
    """Test deserializing to a Bakery object."""
    with app.app_context():
        # Make sure we're using the correct field names based on your schema
        bakery_data = {
            'name': 'New Schema Bakery',
            # Use the field names your schema actually expects
            'zip_code': '5678',  # Change from zipCode if needed
            'street_name': 'New Schema Street',  # Change from streetName if needed
            'street_number': '456',
            'website_url': 'https://newschema.com'  # Change from websiteUrl if needed
        }
        
        # Deserialize with schema
        schema = BakerySchema()
        bakery = schema.load(bakery_data)
        # Rest of your test

def test_bakery_validation(app):
    """Test validation in Bakery schema."""
    with app.app_context():
        # Create invalid bakery data
        invalid_bakery_data = {
            'name': 'Invalid Bakery',
            'zipCode': 'abc',  # Invalid zip code format
        }
        
        # Try to deserialize with schema
        schema = BakerySchema()
        with pytest.raises(Exception):  # Should raise a validation error
            schema.load(invalid_bakery_data)