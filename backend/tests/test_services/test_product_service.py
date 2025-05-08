import pytest
from services.product_service import ProductService
from models import Product, ProductReview, db
from app import create_app  # Add this import
from config import TestingConfig  # Add this import

def test_get_product_by_id(app, sample_product):
    """Test retrieving a product by ID."""
    # Use the app fixture's context
    with app.app_context():
        service = ProductService()
        product = service.get_by_id(sample_product.id)
        
        assert product is not None
        assert product.name == 'Test Product'
        assert float(product.price) == 50.00

def test_get_products_by_bakery(app, sample_bakery, sample_product):
    """Test retrieving products for a specific bakery."""
    with app.app_context():
        service = ProductService()
        products = service.get_by_bakery(sample_bakery.id)
        
        assert len(products) == 1
        assert products[0].name == 'Test Product'
        assert products[0].bakery_id == sample_bakery.id

def test_get_products_by_category(app, sample_category, sample_product):
    """Test retrieving products by category."""
    with app.app_context():
        service = ProductService()
        products = service.get_by_category(sample_category.id)
        
        assert len(products) == 1
        assert products[0].name == 'Test Product'
        assert products[0].category_id == sample_category.id

def test_get_products_by_subcategory(app, sample_subcategory, sample_product):
    """Test retrieving products by subcategory."""
    with app.app_context():
        service = ProductService()
        products = service.get_by_subcategory(sample_subcategory.id)
        
        assert len(products) == 1
        assert products[0].name == 'Test Product'
        assert products[0].subcategory_id == sample_subcategory.id

def test_search_products(app, sample_product):
    """Test searching for products."""
    with app.app_context():
        service = ProductService()
        
        # Search by name
        results = service.search('Test')
        assert len(results) == 1
        assert results[0].name == 'Test Product'
        
        # Search by description
        results = service.search('test product')
        assert len(results) == 1
        assert results[0].description == 'A test product'
        
        # Search with no results
        results = service.search('NonexistentProduct')
        assert len(results) == 0

def test_get_product_stats(app, sample_product, regular_user):
    """Test getting product statistics."""
    with app.app_context():
        # Create some reviews for the product
        reviews = [
            ProductReview(
                review="Review 1",
                overall_rating=9,
                user_id=regular_user.id,
                product_id=sample_product.id,
                taste_rating=10,
                price_rating=8,
                presentation_rating=9
            ),
            ProductReview(
                review="Review 2",
                overall_rating=7,
                user_id=regular_user.id,
                product_id=sample_product.id,
                taste_rating=8,
                price_rating=6,
                presentation_rating=7
            )
        ]
        
        for review in reviews:
            db.session.add(review)
        db.session.commit()
        
        service = ProductService()
        stats = service.get_stats(sample_product.id)
        
        assert stats is not None
        assert stats['average_rating'] == 8.0  # Average of 9 and 7
        assert stats['review_count'] == 2
        assert 'ratings' in stats
        assert stats['ratings']['overall'] == 8.0
        assert stats['ratings']['taste'] == 9.0  # Average of 10 and 8
        assert stats['ratings']['price'] == 7.0  # Average of 8 and 6
        assert stats['ratings']['presentation'] == 8.0  # Average of 9 and 7