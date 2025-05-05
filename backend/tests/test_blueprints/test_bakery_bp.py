import json
import pytest

def test_get_bakeries(client, sample_bakery):
    """Test fetching all bakeries."""
    response = client.get('/bakeries')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'bakeries' in data
    assert len(data['bakeries']) == 1
    assert data['bakeries'][0]['name'] == 'Test Bakery'

def test_get_bakery(client, sample_bakery):
    """Test fetching a specific bakery."""
    response = client.get(f'/bakeries/{sample_bakery.id}')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['name'] == 'Test Bakery'
    assert data['zipCode'] == '1050'

def test_get_bakery_not_found(client):
    """Test fetching a non-existent bakery."""
    response = client.get('/bakeries/999')
    assert response.status_code == 404

def test_create_bakery(client, admin_token):
    """Test creating a new bakery."""
    response = client.post(
        '/bakeries/create',
        headers={'Authorization': f'Bearer {admin_token}'},
        json={
            'name': 'New Bakery',
            'zipCode': '2000',
            'streetName': 'New Street',
            'streetNumber': '10',
            'websiteUrl': 'https://newbakery.com'
        }
    )
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['name'] == 'New Bakery'
    assert data['zipCode'] == '2000'

def test_update_bakery(client, admin_token, sample_bakery):
    """Test updating an existing bakery."""
    response = client.patch(
        f'/bakeries/update/{sample_bakery.id}',
        headers={'Authorization': f'Bearer {admin_token}'},
        json={
            'name': 'Updated Bakery',
            'zipCode': '2100'
        }
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['name'] == 'Updated Bakery'
    assert data['zipCode'] == '2100'

def test_delete_bakery(client, admin_token, sample_bakery):
    """Test deleting a bakery."""
    response = client.delete(
        f'/bakeries/delete/{sample_bakery.id}',
        headers={'Authorization': f'Bearer {admin_token}'}
    )
    assert response.status_code == 200
    
    # Verify bakery is deleted
    response = client.get(f'/bakeries/{sample_bakery.id}')
    assert response.status_code == 404

def test_get_top_bakeries(client, sample_bakery):
    """Test getting top rated bakeries."""
    response = client.get('/bakeries/top?limit=5')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'bakeries' in data