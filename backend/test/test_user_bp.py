import unittest
from unittest.mock import patch, MagicMock
from flask import Flask
from ..blueprints.user_bp import user_bp
from marshmallow import ValidationError


class TestUserBlueprint(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(user_bp, url_prefix='/contacts')
        self.client = self.app.test_client()

    @patch('..services.user_service.UserService.get_all_contacts')
    def test_get_contacts(self, mock_get_all_contacts):
        """Test the get_contacts route"""
        mock_get_all_contacts.return_value = [
            {"id": 1, "firstName": "Lars", "lastName": "Løkke", "email": "Lars@example.com"},
            {"id": 2, "firstName": "Sólrun", "lastName": "Løkke", "email": "Sólrun@example.com"}
        ]
        response = self.client.get('/contacts/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json['contacts']), 2)

    @patch('..services.user_service.UserService.get_contact_by_id')
    def test_get_contact(self, mock_get_contact_by_id):
        """Test the get_contact route"""
        mock_get_contact_by_id.return_value = {"id": 1, "firstName": "Lars", "lastName": "Løkke", "email": "Lars@example.com"}
        response = self.client.get('/contacts/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['firstName'], "Lars")

        mock_get_contact_by_id.return_value = None
        response = self.client.get('/contacts/999')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json['message'], "Contact not found")

    @patch('..services.user_service.UserService.create_contact')
    @patch('..utils.validators.validate_contact_data')
    def test_create_contact(self, mock_validate_contact_data, mock_create_contact):
        """Test the create_contact route"""
        mock_create_contact.return_value = {"id": 1, "firstName": "Lars", "lastName": "Løkke", "email": "Lars@example.com"}
        response = self.client.post('/contacts/create', json={
            "firstName": "Lars", "lastName": "Løkke", "email": "Lars@example.com"
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json['message'], "Contact created!")

        mock_validate_contact_data.side_effect = ValidationError("Invalid data")
        response = self.client.post('/contacts/create', json={})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json['message'], "Validation error")

    @patch('..services.user_service.UserService.update_contact')
    @patch('..services.user_service.UserService.get_contact_by_id')
    def test_update_contact(self, mock_get_contact_by_id, mock_update_contact):
        """Test the update_contact route"""
        mock_get_contact_by_id.return_value = MagicMock(
            id=1, first_name="Lars", last_name="Løkke", email="Lars@example.com"
        )
        mock_update_contact.return_value = {"id": 1, "firstName": "Mette", "lastName": "Frederiksen", "email": "Mink@404.com"}
        response = self.client.patch('/contacts/update/1', json={
            "firstName": "Mette", "lastName": "Frederiksen", "email": "Mink@404.com"
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['message'], "Contact updated!")

        mock_get_contact_by_id.return_value = None
        response = self.client.patch('/contacts/update/999', json={
           "firstName": "Mette", "lastName": "Frederiksen", "email": "Mink@404.com"
        })
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json['message'], "Contact not found")

    @patch('..services.user_service.UserService.delete_contact')
    @patch('..services.user_service.UserService.get_contact_by_id')
    def test_delete_contact(self, mock_get_contact_by_id, mock_delete_contact):
        """Test the delete_contact route"""
        mock_get_contact_by_id.return_value = MagicMock(id=1)
        mock_delete_contact.return_value = True
        response = self.client.delete('/contacts/delete/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['message'], "Contact deleted!")

        mock_get_contact_by_id.return_value = None
        response = self.client.delete('/contacts/delete/999')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json['message'], "Contact not found")


if __name__ == '__main__':
    unittest.main()
