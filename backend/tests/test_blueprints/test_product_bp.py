import json
import pytest

def test_get_products(client, sample_product):
    """Test fetching all products."""
    response = client.get('/products')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'products' in data
    assert len(data['products']) == 1
    assert data['products'][0]['name'] == 'Test Product'

def test_get_product(client, sample_product):
    """Test fetching a specific product."""
    response = client.get(f'/products/{sample_product.id}')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['name'] == 'Test Product'
    assert data['bakeryId'] == sample_product.bakery_id

def test_get_product_not_found(client):
    """Test fetching a non-existent product."""
    response = client.get('/products/999')
    assert response.status_code == 404

def test_create_product(client, admin_token, sample_bakery, sample_category):
    """Test creating a new product."""
    response = client.post(
        '/products/create',
        headers={'Authorization': f'Bearer {admin_token}'},
        json={
            'name': 'New Product',
            'price': 45.00,
            'description': 'A new test product',
            'bakeryId': sample_bakery.id,
            'categoryId': sample_category.id
        }
    )
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['name'] == 'New Product'
    assert float(data['price']) == 45.00

def test_update_product(client, admin_token, sample_product):
    """Test updating an existing product."""
    response = client.patch(
        f'/products/update/{sample_product.id}',
        headers={'Authorization': f'Bearer {admin_token}'},
        json={
            'name': 'Updated Product',
            'price': 55.00
        }
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['name'] == 'Updated Product'
    assert float(data['price']) == 55.00

def test_delete_product(client, admin_token, sample_product):
    """Test deleting a product."""
    response = client.delete(
        f'/products/delete/{sample_product.id}',
        headers={'Authorization': f'Bearer {admin_token}'}
    )
    assert response.status_code == 200
    
    # Verify product is deleted
    response = client.get(f'/products/{sample_product.id}')
    assert response.status_code == 404

def test_get_products_by_bakery(client, sample_product, sample_bakery):
    """Test getting products for a specific bakery."""
    response = client.get(f'/products/bakery/{sample_bakery.id}')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'products' in data
    assert len(data['products']) == 1
    assert data['products'][0]['name'] == 'Test Product'

def test_get_product_stats(client, sample_product):
    """Test getting product statistics."""
    response = client.get(f'/products/{sample_product.id}/stats')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'average_rating' in data
    assert 'review_count' in data