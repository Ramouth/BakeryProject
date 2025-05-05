import pytest
from schemas import BakeryReviewSchema, ProductReviewSchema
from models import BakeryReview, ProductReview

def test_bakery_review_serialization(app, sample_bakery, regular_user):
    """Test serializing a BakeryReview object."""
    with app.app_context():
        # Create a bakery review object
        review = BakeryReview(
            review="This is a great bakery!",
            overall_rating=8,
            user_id=regular_user.id,
            bakery_id=sample_bakery.id,
            service_rating=9,
            price_rating=7,
            atmosphere_rating=8,
            location_rating=6
        )
        
        # Set user and bakery attributes for computed fields
        review.user = regular_user
        review.bakery = sample_bakery
        
        # Serialize with schema
        schema = BakeryReviewSchema()
        result = schema.dump(review)
        
        # Check serialized data
        assert result['review'] == "This is a great bakery!"
        assert result['overallRating'] == 8  # Test camelCase conversion
        assert result['userId'] == regular_user.id
        assert result['bakeryId'] == sample_bakery.id
        assert result['serviceRating'] == 9
        assert result['priceRating'] == 7
        assert result['atmosphereRating'] == 8
        assert result['locationRating'] == 6
        assert result['username'] == 'user'
        assert result['bakery_name'] == 'Test Bakery'

def test_product_review_serialization(app, sample_product, regular_user):
    """Test serializing a ProductReview object."""
    with app.app_context():
        # Create a product review object
        review = ProductReview(
            review="This product is delicious!",
            overall_rating=9,
            user_id=regular_user.id,
            product_id=sample_product.id,
            taste_rating=10,
            price_rating=7,
            presentation_rating=8
        )
        
        # Set user and product attributes for computed fields
        review.user = regular_user
        review.product = sample_product
        
        # Serialize with schema
        schema = ProductReviewSchema()
        result = schema.dump(review)
        
        # Check serialized data
        assert result['review'] == "This product is delicious!"
        assert result['overallRating'] == 9  # Test camelCase conversion
        assert result['userId'] == regular_user.id
        assert result['productId'] == sample_product.id
        assert result['tasteRating'] == 10
        assert result['priceRating'] == 7
        assert result['presentationRating'] == 8
        assert result['username'] == 'user'
        assert result['product_name'] == 'Test Product'

def test_bakery_review_deserialization(app, sample_bakery, regular_user):
    """Test deserializing to a BakeryReview object."""
    with app.app_context():
        # Create review data with camelCase fields
        review_data = {
            'review': 'A lovely bakery!',
            'overallRating': 7,
            'userId': regular_user.id,
            'bakeryId': sample_bakery.id,
            'serviceRating': 8,
            'priceRating': 6,
            'atmosphereRating': 7,
            'locationRating': 5
        }
        
        # Deserialize with schema
        schema = BakeryReviewSchema()
        review = schema.load(review_data)
        
        # Check deserialized object
        assert review.review == 'A lovely bakery!'
        assert review.overall_rating == 7  # Test snake_case conversion
        assert review.user_id == regular_user.id
        assert review.bakery_id == sample_bakery.id
        assert review.service_rating == 8
        assert review.price_rating == 6
        assert review.atmosphere_rating == 7
        assert review.location_rating == 5

def test_product_review_deserialization(app, sample_product, regular_user):
    """Test deserializing to a ProductReview object."""
    with app.app_context():
        # Create review data with camelCase fields
        review_data = {
            'review': 'A tasty product!',
            'overallRating': 8,
            'userId': regular_user.id,
            'productId': sample_product.id,
            'tasteRating': 9,
            'priceRating': 6,
            'presentationRating': 7
        }
        
        # Deserialize with schema
        schema = ProductReviewSchema()
        review = schema.load(review_data)
        
        # Check deserialized object
        assert review.review == 'A tasty product!'
        assert review.overall_rating == 8  # Test snake_case conversion
        assert review.user_id == regular_user.id
        assert review.product_id == sample_product.id
        assert review.taste_rating == 9
        assert review.price_rating == 6
        assert review.presentation_rating == 7

def test_review_validation(app):
    """Test validation in Review schemas."""
    with app.app_context():
        # Create invalid bakery review data (rating outside valid range)
        invalid_bakery_review = {
            'review': 'Invalid rating',
            'overallRating': 12,  # Outside valid range of 1-10
            'bakeryId': 1,
            'serviceRating': 5,
            'priceRating': 5,
            'atmosphereRating': 5,
            'locationRating': 5
        }
        
        # Try to deserialize with schema
        bakery_schema = BakeryReviewSchema()
        with pytest.raises(Exception):  # Should raise a validation error
            bakery_schema.load(invalid_bakery_review)
        
        # Create invalid product review data (missing required field)
        invalid_product_review = {
            'review': 'Missing ratings',
            'overallRating': 5,
            'productId': 1
            # Missing required tasteRating, priceRating, presentationRating
        }
        
        # Try to deserialize with schema
        product_schema = ProductReviewSchema()
        with pytest.raises(Exception):  # Should raise a validation error
            product_schema.load(invalid_product_review)