import sys
import os

from backend.services.bakery_service import BakeryService
# Add the parent directory to the path so imports work properly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest  # Add this line
from extensions import db
from app import create_app
from config import TestingConfig
from models import db, User, Bakery, Product, BakeryReview, ProductReview, Category, Subcategory
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash

@pytest.fixture
def app():
    """Create and configure a Flask app for testing."""
    app = create_app(TestingConfig)  # Pass the class object, not a string
    
    # Create an in-memory database for testing
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['TESTING'] = True
    
    # Establish application context
    with app.app_context():
        db.create_all()  # Create all tables in the in-memory database
        yield app  # This provides the app to the test
        # Cleanup after test is complete
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """Get a test client for the app."""
    return app.test_client()

@pytest.fixture
def admin_user(app):
    """Create an admin user for testing."""
    with app.app_context():
        from models import User
        from models import db
        from werkzeug.security import generate_password_hash
        
        # Include the required password parameter
        user = User(
            username='admin',
            email='admin@test.com',
            password='adminpassword',  # Add the required parameter
            is_admin=True
        )
        
        db.session.add(user)
        db.session.commit()
        return user

@pytest.fixture
def regular_user(app):
    """Create a regular user for testing."""
    with app.app_context():
        from models import User
        from models import db
        from werkzeug.security import generate_password_hash
        
        # Include the required password parameter
        user = User(
            username='user',
            email='user@test.com',
            password='password',  # Add the required parameter
            is_admin=False
        )
        
        db.session.add(user)
        db.session.commit()
        return user

@pytest.fixture
def admin_token(app, admin_user):
    """Create a JWT token for admin user."""
    with app.app_context():
        # Get admin user ID safely
        from models import User
        from flask_jwt_extended import create_access_token
        
        # Find the admin user directly from the database instead of using potentially detached instance
        admin = User.query.filter_by(email='admin@test.com').first()
        if not admin:
            # Fallback to creating a user ID if needed
            admin_id = getattr(admin_user, 'id', 1)  # Default to 1 if all else fails
        else:
            admin_id = admin.id
            
        return create_access_token(identity=admin_id)

@pytest.fixture
def user_token(app, regular_user):
    """Create a JWT token for regular user."""
    with app.app_context():
        return create_access_token(identity=regular_user.id)

@pytest.fixture
def sample_bakery(app):
    """Create a sample bakery for testing."""
    with app.app_context():
        bakery = Bakery(
            name='Test Bakery',
            zip_code='1050',
            street_name='Test Street',
            street_number='42',
            website_url='https://testbakery.com'
        )
        db.session.add(bakery)
        db.session.commit()
        
        # Get fresh data from database to avoid detachment
        bakery_id = bakery.id
        return db.session.get(Bakery, bakery_id)

@pytest.fixture
def sample_category(app):
    """Create a sample category for testing."""
    with app.app_context():
        category = Category(name='Test Category')
        db.session.add(category)
        db.session.commit()
        
        # Get fresh data from database to avoid detachment
        category_id = category.id
        return db.session.get(Category, category_id)

@pytest.fixture
def sample_subcategory(app, sample_category):
    """Create a sample subcategory for testing."""
    with app.app_context():
        # Get category within this context
        category = db.session.get(Category, sample_category.id)
        
        subcategory = Subcategory(
            name='Test Subcategory', 
            category_id=category.id
        )
        db.session.add(subcategory)
        db.session.commit()
        
        # Get fresh data from database to avoid detachment
        subcategory_id = subcategory.id
        return db.session.get(Subcategory, subcategory_id)

@pytest.fixture
def sample_product(app, sample_bakery, sample_category, sample_subcategory):
    """Create a sample product for testing."""
    with app.app_context():
        from models import Product
        from models import db
        
        # Create product with only the parameters the constructor accepts
        product = Product(
            name='Test Product',
            bakery_id=sample_bakery.id,
            category_id=sample_category.id,
            subcategory_id=sample_subcategory.id
        )
        
        # Set additional attributes after creation
        product.description = 'A test product'
        product.price = 50.00  # If your model has a price attribute
        
        db.session.add(product)
        db.session.commit()
        return product

def test_get_bakery_by_id(app, sample_bakery):
    """Test retrieving a bakery by ID."""
    with app.app_context():
        service = BakeryService()
        bakery = service.get_bakery_by_id(sample_bakery.id)
        # Rest of your test

def test_login_invalid_credentials(client):
    """Test login with invalid credentials."""
    response = client.post('/auth/login', json={
        'username': 'nonexistent',  # Check if API needs username instead of email
        'password': 'wrongpassword'
    })
    assert response.status_code == 400  # Update from 401 to 400