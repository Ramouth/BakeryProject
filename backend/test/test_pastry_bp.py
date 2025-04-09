import pytest
from flask import Flask
from backend.blueprints.product_bp import product_bp
from unittest.mock import patch

@pytest.fixture
def app():
    """Fixture to create a Flask app for testing."""
    app = Flask(__name__)
    app.register_blueprint(product_bp, url_prefix='/products')
    return app

@pytest.fixture
def client(app):
    """Fixture to create a test client."""
    return app.test_client()

@patch('backend.blueprints.product_bp.product_service.get_all_products')
def test_get_products(mock_get_all_products, client):
    """Test GET /products/ endpoint."""
    mock_get_all_products.return_value = [
        {"id": 1, "name": "Croissant", "bakery_id": 1},
        {"id": 2, "name": "Fastalavnsbolle", "bakery_id": 2}
    ]
    response = client.get('/products/')
    assert response.status_code == 200
    assert response.json == {
        "products": [
            {"id": 1, "name": "Croissant", "bakery_id": 1},
            {"id": 2, "name": "Fastalavnsbolle", "bakery_id": 2}
        ]
    }

@patch('backend.blueprints.product_bp.product_service.get_product_by_id')
def test_get_product(mock_get_product_by_id, client):
    """Test GET /products/<int:product_id> endpoint."""
    mock_get_product_by_id.return_value = {"id": 1, "name": "Croissant", "bakery_id": 1}
    response = client.get('/products/1')
    assert response.status_code == 200
    assert response.json == {"id": 1, "name": "Croissant", "bakery_id": 1}

    mock_get_product_by_id.return_value = None
    response = client.get('/products/999')
    assert response.status_code == 404
    assert response.json == {"message": "Product not found"}

@patch('backend.blueprints.product_bp.product_service.get_products_by_bakery')
def test_get_products_by_bakery(mock_get_products_by_bakery, client):
    """Test GET /products/bakery/<int:bakery_id> endpoint."""
    mock_get_products_by_bakery.return_value = [
        {"id": 1, "name": "Croissant", "bakery_id": 1}
    ]
    response = client.get('/products/bakery/1')
    assert response.status_code == 200
    assert response.json == {
        "products": [{"id": 1, "name": "Croissant", "bakery_id": 1}]
    }

@patch('backend.blueprints.product_bp.product_service.create_product')
@patch('backend.blueprints.product_bp.Bakery.query.get')
def test_create_product(mock_bakery_query_get, mock_create_product, client):
    """Test POST /products/create endpoint."""
    mock_bakery_query_get.return_value = True
    mock_create_product.return_value = {"id": 1, "name": "Croissant", "bakery_id": 1}

    response = client.post('/products/create', json={"name": "Croissant", "bakeryId": 1})
    assert response.status_code == 201
    assert response.json == {
        "message": "Product created!",
        "product": {"id": 1, "name": "Croissant", "bakery_id": 1}
    }

    response = client.post('/products/create', json={"name": ""})
    assert response.status_code == 400
    assert response.json == {"message": "Name and bakeryId are required"}

@patch('backend.blueprints.product_bp.product_service.update_product')
@patch('backend.blueprints.product_bp.product_service.get_product_by_id')
@patch('backend.blueprints.product_bp.Bakery.query.get')
def test_update_product(mock_bakery_query_get, mock_get_product_by_id, mock_update_product, client):
    """Test PATCH /products/update/<int:product_id> endpoint."""
    mock_get_product_by_id.return_value = {"id": 1, "name": "Croissant", "bakery_id": 1}
    mock_bakery_query_get.return_value = True
    mock_update_product.return_value = {"id": 1, "name": "Updated Croissant", "bakery_id": 1}

    response = client.patch('/products/update/1', json={"name": "Updated Croissant"})
    assert response.status_code == 200
    assert response.json == {
        "message": "Product updated.",
        "product": {"id": 1, "name": "Updated Croissant", "bakery_id": 1}
    }

    mock_get_product_by_id.return_value = None
    response = client.patch('/products/update/999', json={"name": "Updated Croissant"})
    assert response.status_code == 404
    assert response.json == {"message": "Product not found"}

@patch('backend.blueprints.product_bp.product_service.delete_product')
@patch('backend.blueprints.product_bp.product_service.get_product_by_id')
def test_delete_product(mock_get_product_by_id, mock_delete_product, client):
    """Test DELETE /products/delete/<int:product_id> endpoint."""
    mock_get_product_by_id.return_value = {"id": 1, "name": "Croissant", "bakery_id": 1}

    response = client.delete('/products/delete/1')
    assert response.status_code == 200
    assert response.json == {"message": "Product deleted!"}

    mock_get_product_by_id.return_value = None
    response = client.delete('/products/delete/999')
    assert response.status_code == 404
    assert response.json == {"message": "Product not found"}