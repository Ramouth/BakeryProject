from flask import Blueprint, request, jsonify
from backend.models import db, Contact
from backend.schemas import ContactSchema
from backend.services.user_service import UserService
from backend.utils.caching import cache

CAN_EDIT = False  # Set this to False to enable editing and deleting

# Create blueprint
user_bp = Blueprint('contact', __name__)

# Initialize schemas
contact_schema = ContactSchema()
contacts_schema = ContactSchema(many=True)

# Initialize service
user_service = UserService()

@user_bp.route('/', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_contacts():
    """Get all contacts"""
    contacts = user_service.get_all_contacts()
    return jsonify({"contacts": contacts_schema.dump(contacts)})

@user_bp.route('/<int:contact_id>', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_contact(contact_id):
    """Get a specific contact by ID"""
    contact = user_service.get_contact_by_id(contact_id)
    if not contact:
        return jsonify({"message": "Contact not found"}), 404
    return jsonify(contact_schema.dump(contact))

@user_bp.route('/create', methods=['POST'])
def create_contact():
    """Create a new contact"""
    try:
        first_name = request.json.get('firstName')
        last_name = request.json.get('lastName')
        email = request.json.get('email')
        
        if not first_name or not last_name or not email:
            return jsonify({"message": "First name, last name, and email are required"}), 400
        
        # Check if email already exists
        existing_contact = Contact.query.filter_by(email=email).first()
        if existing_contact:
            return jsonify({"message": "Email already in use"}), 400
        
        # Validate input data against schema
        errors = contact_schema.validate(request.json)
        if errors:
            return jsonify({"message": "Validation error", "errors": errors}), 400
        
        new_contact = user_service.create_contact(first_name, last_name, email)
        
        # Invalidate cache
        cache.delete('view/get_contacts')
        
        return jsonify({"message": "Contact created!", "contact": contact_schema.dump(new_contact)}), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@user_bp.route('/update/<int:contact_id>', methods=['PATCH'])
def update_contact(contact_id):
    """Update a contact"""
    if not CAN_EDIT:
        return jsonify({"message": "Editing and deleting are disabled"}), 403
    try:
        contact = user_service.get_contact_by_id(contact_id)
        if not contact:
            return jsonify({"message": "Contact not found"}), 404
        
        data = request.json
        first_name = data.get('firstName', contact.first_name)
        last_name = data.get('lastName', contact.last_name)
        email = data.get('email', contact.email)
        
        # Validate input data
        if not first_name or not last_name or not email:
            return jsonify({"message": "First name, last name, and email cannot be empty"}), 400
        
        # Check if email already exists and belongs to a different contact
        if email != contact.email:
            existing_contact = Contact.query.filter_by(email=email).first()
            if existing_contact and existing_contact.id != contact_id:
                return jsonify({"message": "Email already in use"}), 400
        
        updated_contact = user_service.update_contact(contact_id, first_name, last_name, email)
        
        # Invalidate cache
        cache.delete('view/get_contacts')
        cache.delete(f'view/get_contact_{contact_id}')
        
        return jsonify({"message": "Contact updated.", "contact": contact_schema.dump(updated_contact)}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@user_bp.route('/delete/<int:contact_id>', methods=['DELETE'])
def delete_contact(contact_id):
    """Delete a contact"""
    if not CAN_EDIT:
        return jsonify({"message": "Editing and deleting are disabled"}), 403
    try:
        contact = user_service.get_contact_by_id(contact_id)
        if not contact:
            return jsonify({"message": "Contact not found"}), 404
        
        user_service.delete_contact(contact_id)
        
        # Invalidate cache
        cache.delete('view/get_contacts')
        cache.delete(f'view/get_contact_{contact_id}')
        
        return jsonify({"message": "Contact deleted!"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400