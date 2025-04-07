import unittest
from unittest.mock import patch, MagicMock
from flask import Flask
from ..blueprints.user_bp import user_bp
from marshmallow import ValidationError


class TestUserBlueprint(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(user_bp, url_prefix='/users')
        self.client = self.app.test_client()

    @patch('..services.user_service.UserService.get_all_users')
    def test_get_users(self, mock_get_all_users):
        """Test the get_users route"""
        mock_get_all_users.return_value = [
            {"id": 1, "firstName": "Lars", "lastName": "Løkke", "email": "Lars@example.com"},
            {"id": 2, "firstName": "Sólrun", "lastName": "Løkke", "email": "Sólrun@example.com"}
        ]
        response = self.client.get('/users/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json['users']), 2)

    @patch('..services.user_service.UserService.get_user_by_id')
    def test_get_user(self, mock_get_user_by_id):
        """Test the get_user route"""
        mock_get_user_by_id.return_value = {"id": 1, "firstName": "Lars", "lastName": "Løkke", "email": "Lars@example.com"}
        response = self.client.get('/users/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['firstName'], "Lars")

        mock_get_user_by_id.return_value = None
        response = self.client.get('/users/999')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json['message'], "User not found")

    @patch('..services.user_service.UserService.create_user')
    @patch('..utils.validators.validate_user_data')
    def test_create_user(self, mock_validate_user_data, mock_create_user):
        """Test the create_user route"""
        mock_create_user.return_value = {"id": 1, "firstName": "Lars", "lastName": "Løkke", "email": "Lars@example.com"}
        response = self.client.post('/users/create', json={
            "firstName": "Lars", "lastName": "Løkke", "email": "Lars@example.com"
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json['message'], "User created!")

        mock_validate_user_data.side_effect = ValidationError("Invalid data")
        response = self.client.post('/users/create', json={})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json['message'], "Validation error")

    @patch('..services.user_service.UserService.update_user')
    @patch('..services.user_service.UserService.get_user_by_id')
    def test_update_user(self, mock_get_user_by_id, mock_update_user):
        """Test the update_user route"""
        mock_get_user_by_id.return_value = MagicMock(
            id=1, first_name="Lars", last_name="Løkke", email="Lars@example.com"
        )
        mock_update_user.return_value = {"id": 1, "firstName": "Mette", "lastName": "Frederiksen", "email": "Mink@404.com"}
        response = self.client.patch('/users/update/1', json={
            "firstName": "Mette", "lastName": "Frederiksen", "email": "Mink@404.com"
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['message'], "User updated!")

        mock_get_user_by_id.return_value = None
        response = self.client.patch('/users/update/999', json={
           "firstName": "Mette", "lastName": "Frederiksen", "email": "Mink@404.com"
        })
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json['message'], "User not found")

    @patch('..services.user_service.UserService.delete_user')
    @patch('..services.user_service.UserService.get_user_by_id')
    def test_delete_user(self, mock_get_user_by_id, mock_delete_user):
        """Test the delete_user route"""
        mock_get_user_by_id.return_value = MagicMock(id=1)
        mock_delete_user.return_value = True
        response = self.client.delete('/users/delete/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['message'], "User deleted!")

        mock_get_user_by_id.return_value = None
        response = self.client.delete('/users/delete/999')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json['message'], "User not found")


if __name__ == '__main__':
    unittest.main()
