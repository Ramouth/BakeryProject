import json
import pytest

def test_register_success(client):
    """Test successful user registration."""
    response = client.post('/auth/register', json={
        'username': 'newuser',
        'email': 'newuser@test.com',
        'password': 'password123',
        'profilePicture': 1
    })
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'access_token' in data
    assert 'user' in data
    assert data['user']['username'] == 'newuser'

def test_register_duplicate_email(client, regular_user):
    """Test registration with duplicate email."""
    response = client.post('/auth/register', json={
        'username': 'anotheruser',
        'email': 'user@test.com',  # Same as regular_user
        'password': 'password123',
        'profilePicture': 1
    })
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data

def test_login_success(client, regular_user):
    """Test successful login."""
    response = client.post('/auth/login', json={
        'email': 'user@test.com',
        'password': 'password'
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'access_token' in data
    assert 'user' in data
    assert data['user']['email'] == 'user@test.com'

def test_login_invalid_credentials(client):
    """Test login with invalid credentials."""
    response = client.post('/auth/login', json={
        'email': 'nonexistent@test.com',
        'password': 'wrongpassword'
    })
    assert response.status_code == 401
    data = json.loads(response.data)
    assert 'error' in data

def test_get_profile(client, user_token):
    """Test getting user profile with valid token."""
    response = client.get(
        '/auth/profile',
        headers={'Authorization': f'Bearer {user_token}'}
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'username' in data
    assert data['email'] == 'user@test.com'

def test_get_profile_no_token(client):
    """Test getting user profile without token."""
    response = client.get('/auth/profile')
    assert response.status_code == 401