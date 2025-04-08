from flask import Blueprint, request, jsonify
from models import db, User
from schemas import UserSchema
from services.user_service import UserService
from utils.caching import cache
from marshmallow import ValidationError

# Create blueprint
user_bp = Blueprint('user', __name__)

# Initialize schemas
user_schema = UserSchema()
users_schema = UserSchema(many=True)

# Initialize service
user_service = UserService()

@user_bp.route('/', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_users():
    """Get all users"""
    users = user_service.get_all_users()
    return jsonify({"users": users_schema.dump(users)})

@user_bp.route('/<int:user_id>', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_user(user_id):
    """Get a specific user by ID"""
    user = user_service.get_user_by_id(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(user_schema.dump(user))

@user_bp.route('/search', methods=['GET'])
def search_users():
    """Search users by username or email"""
    search_term = request.args.get('q')
    if not search_term:
        return jsonify({"message": "Search term is required"}), 400
        
    users = user_service.search_users(search_term)
    return jsonify({"users": users_schema.dump(users)})

@user_bp.route('/create', methods=['POST'])
def create_user():
    """Create a new user"""
    try:
        data = request.json
        print("Received user creation data:", data)  # Debug log
        
        # Check required fields
        if not data.get('username') or not data.get('email') or not data.get('password'):
            missing_fields = []
            if not data.get('username'): missing_fields.append("username")
            if not data.get('email'): missing_fields.append("email")
            if not data.get('password'): missing_fields.append("password")
            return jsonify({"message": f"Missing required fields: {', '.join(missing_fields)}"}), 400
        
        # Create user through service
        user = user_service.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            profile_picture=data.get('profilePicture', 1),
            is_admin=data.get('isAdmin', False)
        )
        
        # Invalidate cache
        cache.delete('view/get_users')
        
        return jsonify({"message": "User created!", "user": user_schema.dump(user)}), 201
    except Exception as e:
        print(f"Error creating user: {str(e)}")  # Debug log
        return jsonify({"message": str(e)}), 400

@user_bp.route('/update/<int:user_id>', methods=['PATCH'])
def update_user(user_id):
    """Update a user"""
    try:
        user = user_service.get_user_by_id(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        data = request.json
        print(f"Updating user {user_id} with data:", data)  # Debug log
        
        # Default password handling - if password is provided, use it
        password = data.get('password')
        
        # Update user through service
        updated_user = user_service.update_user(
            user_id=user_id,
            username=data.get('username'),
            email=data.get('email'),
            profile_picture=data.get('profilePicture'),
            is_admin=data.get('isAdmin'),
            password=password  # Pass password to service if provided
        )
        
        # Invalidate cache
        cache.delete('view/get_users')
        cache.delete(f'view/get_user_{user_id}')
        
        return jsonify({"message": "User updated.", "user": user_schema.dump(updated_user)}), 200
    except Exception as e:
        print(f"Error updating user: {str(e)}")  # Debug log
        return jsonify({"message": str(e)}), 400

@user_bp.route('/delete/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete a user"""
    try:
        user = user_service.get_user_by_id(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        # Delete user
        user_service.delete_user(user_id)
        
        # Invalidate cache
        cache.delete('view/get_users')
        cache.delete(f'view/get_user_{user_id}')
        
        return jsonify({"message": "User deleted!"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@user_bp.route('/change-password/<int:user_id>', methods=['POST'])
def change_password(user_id):
    """Change a user's password"""
    try:
        user = user_service.get_user_by_id(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404
            
        data = request.json
        
        # Check required fields
        if not data.get('currentPassword') or not data.get('newPassword'):
            return jsonify({"message": "Current password and new password are required"}), 400
            
        # Update password through service
        success = user_service.update_password(
            user_id=user_id,
            current_password=data['currentPassword'],
            new_password=data['newPassword']
        )
        
        return jsonify({"message": "Password changed successfully"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400