import pytest
from flask import Flask
from backend.blueprints.pastry_bp import pastry_bp
from unittest.mock import patch

@pytest.fixture
def app():
    """Fixture to create a Flask app for testing."""
    app = Flask(__name__)
    app.register_blueprint(pastry_bp, url_prefix='/pastries')
    return app

@pytest.fixture
def client(app):
    """Fixture to create a test client."""
    return app.test_client()

@patch('backend.blueprints.pastry_bp.pastry_service.get_all_pastries')
def test_get_pastries(mock_get_all_pastries, client):
    """Test GET /pastries/ endpoint."""
    mock_get_all_pastries.return_value = [
        {"id": 1, "name": "Croissant", "bakery_id": 1},
        {"id": 2, "name": "Fastalavnsbolle", "bakery_id": 2}
    ]
    response = client.get('/pastries/')
    assert response.status_code == 200
    assert response.json == {
        "pastries": [
            {"id": 1, "name": "Croissant", "bakery_id": 1},
            {"id": 2, "name": "Fastalavnsbolle", "bakery_id": 2}
        ]
    }

@patch('backend.blueprints.pastry_bp.pastry_service.get_pastry_by_id')
def test_get_pastry(mock_get_pastry_by_id, client):
    """Test GET /pastries/<int:pastry_id> endpoint."""
    mock_get_pastry_by_id.return_value = {"id": 1, "name": "Croissant", "bakery_id": 1}
    response = client.get('/pastries/1')
    assert response.status_code == 200
    assert response.json == {"id": 1, "name": "Croissant", "bakery_id": 1}

    mock_get_pastry_by_id.return_value = None
    response = client.get('/pastries/999')
    assert response.status_code == 404
    assert response.json == {"message": "Pastry not found"}

@patch('backend.blueprints.pastry_bp.pastry_service.get_pastries_by_bakery')
def test_get_pastries_by_bakery(mock_get_pastries_by_bakery, client):
    """Test GET /pastries/bakery/<int:bakery_id> endpoint."""
    mock_get_pastries_by_bakery.return_value = [
        {"id": 1, "name": "Croissant", "bakery_id": 1}
    ]
    response = client.get('/pastries/bakery/1')
    assert response.status_code == 200
    assert response.json == {
        "pastries": [{"id": 1, "name": "Croissant", "bakery_id": 1}]
    }

@patch('backend.blueprints.pastry_bp.pastry_service.create_pastry')
@patch('backend.blueprints.pastry_bp.Bakery.query.get')
def test_create_pastry(mock_bakery_query_get, mock_create_pastry, client):
    """Test POST /pastries/create endpoint."""
    mock_bakery_query_get.return_value = True
    mock_create_pastry.return_value = {"id": 1, "name": "Croissant", "bakery_id": 1}

    response = client.post('/pastries/create', json={"name": "Croissant", "bakeryId": 1})
    assert response.status_code == 201
    assert response.json == {
        "message": "Pastry created!",
        "pastry": {"id": 1, "name": "Croissant", "bakery_id": 1}
    }

    response = client.post('/pastries/create', json={"name": ""})
    assert response.status_code == 400
    assert response.json == {"message": "Name and bakeryId are required"}

@patch('backend.blueprints.pastry_bp.pastry_service.update_pastry')
@patch('backend.blueprints.pastry_bp.pastry_service.get_pastry_by_id')
@patch('backend.blueprints.pastry_bp.Bakery.query.get')
def test_update_pastry(mock_bakery_query_get, mock_get_pastry_by_id, mock_update_pastry, client):
    """Test PATCH /pastries/update/<int:pastry_id> endpoint."""
    mock_get_pastry_by_id.return_value = {"id": 1, "name": "Croissant", "bakery_id": 1}
    mock_bakery_query_get.return_value = True
    mock_update_pastry.return_value = {"id": 1, "name": "Updated Croissant", "bakery_id": 1}

    response = client.patch('/pastries/update/1', json={"name": "Updated Croissant"})
    assert response.status_code == 200
    assert response.json == {
        "message": "Pastry updated.",
        "pastry": {"id": 1, "name": "Updated Croissant", "bakery_id": 1}
    }

    mock_get_pastry_by_id.return_value = None
    response = client.patch('/pastries/update/999', json={"name": "Updated Croissant"})
    assert response.status_code == 404
    assert response.json == {"message": "Pastry not found"}

@patch('backend.blueprints.pastry_bp.pastry_service.delete_pastry')
@patch('backend.blueprints.pastry_bp.pastry_service.get_pastry_by_id')
def test_delete_pastry(mock_get_pastry_by_id, mock_delete_pastry, client):
    """Test DELETE /pastries/delete/<int:pastry_id> endpoint."""
    mock_get_pastry_by_id.return_value = {"id": 1, "name": "Croissant", "bakery_id": 1}

    response = client.delete('/pastries/delete/1')
    assert response.status_code == 200
    assert response.json == {"message": "Pastry deleted!"}

    mock_get_pastry_by_id.return_value = None
    response = client.delete('/pastries/delete/999')
    assert response.status_code == 404
    assert response.json == {"message": "Pastry not found"}