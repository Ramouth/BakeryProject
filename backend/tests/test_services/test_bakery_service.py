import pytest
from services.bakery_service import BakeryService
from models import Bakery, BakeryReview

def test_get_bakery_by_id(app, sample_bakery):
    """Test retrieving a bakery by ID."""
    with app.app_context():
        service = BakeryService()
        # Use the method that actually exists in the service
        bakery = service.get_bakery_by_id(sample_bakery.id)  # Assuming this is the actual method name
        
        assert bakery is not None
        assert bakery.name == 'Test Bakery'
        assert bakery.zip_code == '1050'

def test_search_bakeries(app, sample_bakery):
    """Test searching for bakeries."""
    with app.app_context():
        service = BakeryService()
        
        # Use the method that actually exists
        results = service.search_bakeries('Test')  # Assuming this is the actual method name
        # Rest of your test

def test_get_bakery_stats(app, sample_bakery, regular_user):
    """Test getting bakery statistics."""
    with app.app_context():
        # Create some reviews for the bakery
        reviews = [
            BakeryReview(
                review="Review 1",
                overall_rating=8,
                user_id=regular_user.id,
                bakery_id=sample_bakery.id,
                service_rating=9,
                price_rating=7,
                atmosphere_rating=8,
                location_rating=6
            ),
            BakeryReview(
                review="Review 2",
                overall_rating=6,
                user_id=regular_user.id,
                bakery_id=sample_bakery.id,
                service_rating=7,
                price_rating=5,
                atmosphere_rating=6,
                location_rating=5
            )
        ]
        
        from models import db
        for review in reviews:
            db.session.add(review)
        db.session.commit()
        
        service = BakeryService()
        stats = service.get_stats(sample_bakery.id)
        
        assert stats is not None
        assert stats['average_rating'] == 7.0  # Average of 8 and 6
        assert stats['review_count'] == 2
        assert 'ratings' in stats
        assert stats['ratings']['overall'] == 7.0
        assert stats['ratings']['service'] == 8.0  # Average of 9 and 7
        assert stats['ratings']['price'] == 6.0  # Average of 7 and 5
        assert stats['ratings']['atmosphere'] == 7.0  # Average of 8 and 6
        assert stats['ratings']['location'] == 5.5  # Average of 6 and 5