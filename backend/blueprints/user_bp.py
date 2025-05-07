from flask import Blueprint, request, jsonify
from backend.schemas import UserSchema
from backend.services.user_service import UserService

# Create blueprint
user_bp = Blueprint('user', __name__)

# Initialize schemas
user_schema = UserSchema()
users_schema = UserSchema(many=True)

# Initialize service
user_service = UserService()

@user_bp.route('/', methods=['GET'])
def get_users():
    """Get all users"""
    users = user_service.get_all_users()
    return jsonify({"users": users_schema.dump(users)})

@user_bp.route('/<int:user_id>', methods=['GET'])
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