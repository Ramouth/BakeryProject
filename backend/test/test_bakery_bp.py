import pytest
from unittest.mock import patch
from flask import Flask
from backend.blueprints.bakery_bp import bakery_bp

@pytest.fixture
def app():
    """Fixture to create a Flask app for testing"""
    app = Flask(__name__)
    app.register_blueprint(bakery_bp, url_prefix='/bakeries')
    return app

@pytest.fixture
def client(app):
    """Fixture to create a test client"""
    return app.test_client()

def test_get_bakeries(client, mocker):
    """Test the get_bakeries route"""
    mock_bakeries = [
        {"id": 1, "name": "Juno", "zip_code": "2200"},
        {"id": 2, "name": "Hart", "zip_code": "2000"}
    ]
    mocker.patch("backend.services.bakery_service.BakeryService.get_all_bakeries", return_value=mock_bakeries)

    response = client.get('/bakeries/')
    assert response.status_code == 200
    assert response.json == {"bakeries": mock_bakeries}

def test_get_bakery(client, mocker):
    """Test the get_bakery route"""
    mock_bakery = {"id": 1, "name": "Juno", "zip_code": "2200"}
    mocker.patch("backend.services.bakery_service.BakeryService.get_bakery_by_id", return_value=mock_bakery)

    response = client.get('/bakeries/1')
    assert response.status_code == 200
    assert response.json == mock_bakery

def test_get_bakery_not_found(client, mocker):
    """Test the get_bakery route when bakery is not found"""
    mocker.patch("backend.services.bakery_service.BakeryService.get_bakery_by_id", return_value=None)

    response = client.get('/bakeries/999')
    assert response.status_code == 404
    assert response.json == {"message": "Bakery not found"}

def test_create_bakery(client, mocker):
    """Test the create_bakery route"""
    mock_data = {"name": "Juno", "zipCode": "2200"}
    mock_bakery = {"id": 1, "name": "Juno", "zip_code": "2200"}
    mocker.patch("backend.services.bakery_service.BakeryService.create_bakery", return_value=mock_bakery)
    mocker.patch("backend.utils.caching.cache.delete_memoized")

    response = client.post('/bakeries/create', json=mock_data)
    assert response.status_code == 201
    assert response.json == {"message": "Bakery created successfully!", "bakery": mock_bakery}

def test_create_bakery_missing_field(client):
    """Test the create_bakery route with missing fields"""
    mock_data = {"name": "Juno"}

    response = client.post('/bakeries/create', json=mock_data)
    assert response.status_code == 400
    assert response.json == {"message": "Name and zip code are required"}

def test_update_bakery(client, mocker):
    """Test the update_bakery route"""
    mock_data = {"name": "Updated Juno", "zipCode": "2201"}
    mock_bakery = {"id": 1, "name": "Updated Juno", "zip_code": "2201"}
    mocker.patch("backend.services.bakery_service.BakeryService.get_bakery_by_id", return_value=True)
    mocker.patch("backend.services.bakery_service.BakeryService.update_bakery", return_value=mock_bakery)
    mocker.patch("backend.utils.caching.cache.delete_memoized")

    response = client.patch('/bakeries/update/1', json=mock_data)
    assert response.status_code == 200
    assert response.json == {"message": "Bakery updated successfully", "bakery": mock_bakery}

def test_delete_bakery(client, mocker):
    """Test the delete_bakery route"""
    mocker.patch("backend.services.bakery_service.BakeryService.get_bakery_by_id", return_value=True)
    mocker.patch("backend.services.bakery_service.BakeryService.delete_bakery")
    mocker.patch("backend.utils.caching.cache.delete_memoized")

    response = client.delete('/bakeries/delete/1')
    assert response.status_code == 200
    assert response.json == {"message": "Bakery deleted successfully"}

def test_search_bakeries(client, mocker):
    """Test the search_bakeries route"""
    mock_bakeries = [{"id": 1, "name": "Juno", "zip_code": "2200"}]
    mocker.patch("backend.services.bakery_service.BakeryService.search_bakeries", return_value=mock_bakeries)

    response = client.get('/bakeries/search?q=Juno')
    assert response.status_code == 200
    assert response.json == {"bakeries": mock_bakeries}

def test_get_bakery_stats(client, mocker):
    """Test the get_bakery_stats route"""
    mock_stats = {"average_rating": 4.5, "total_reviews": 10}
    mocker.patch("backend.services.bakery_service.BakeryService.get_bakery_stats", return_value=mock_stats)

    response = client.get('/bakeries/1/stats')
    assert response.status_code == 200
    assert response.json == mock_stats

def test_get_bakery_products(client, mocker):
    """Test the get_bakery_products route"""
    mock_products = [{"id": 1, "name": "Croissant"}, {"id": 2, "name": "Danish"}]
    mocker.patch("backend.services.bakery_service.BakeryService.get_bakery_by_id", return_value=True)
    mocker.patch("backend.services.product_service.ProductService.get_products_by_bakery", return_value=mock_products)

    response = client.get('/bakeries/1/products')
    assert response.status_code == 200
    assert response.json == {"products": mock_products}