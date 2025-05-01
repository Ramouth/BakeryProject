from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from schemas import UserSchema
from services.user_service import UserService
from models import User

# Create blueprint
auth_bp = Blueprint('auth', __name__)

# Initialize schema
user_schema = UserSchema()

# Initialize service
user_service = UserService()

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data or not data.get(field):
                return jsonify({"message": f"Missing required field: {field}"}), 400
        
        # Create new user
        user = user_service.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            profile_picture=data.get('profilePicture', 1),
            is_admin=data.get('isAdmin', False)
        )
        
        # Generate access token
        access_token = create_access_token(identity={
            "id": user.id,
            "username": user.username,
            "role": "admin" if user.is_admin else "user"
        })
        
        return jsonify({
            "message": "Registration successful",
            "user": user_schema.dump(user),
            "access_token": access_token
        }), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    """Log in a user and return a JWT token"""
    try:
        username = request.json.get('username')
        password = request.json.get('password')
        
        if not username or not password:
            return jsonify({"message": "Username and password are required"}), 400
        
        # Authenticate user
        user = user_service.authenticate_user(username, password)
        if not user:
            return jsonify({"message": "Invalid username or password"}), 401
        
        # Generate token
        access_token = create_access_token(identity={
            "id": user.id,
            "username": user.username,
            "role": "admin" if user.is_admin else "user"
        })
        
        return jsonify({
            "message": "Login successful",
            "user": user_schema.dump(user),
            "access_token": access_token
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get user profile (requires authentication)"""
    try:
        # Get user identity from JWT token
        current_user_data = get_jwt_identity()
        user_id = current_user_data.get("id")
        
        user = user_service.get_user_by_id(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        return jsonify(user_schema.dump(user)), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@auth_bp.route('/update-profile', methods=['PATCH'])
@jwt_required()
def update_profile():
    """Update user profile (requires authentication)"""
    try:
        # Get user identity from JWT token
        current_user_data = get_jwt_identity()
        user_id = current_user_data.get("id")
        
        data = request.json
        
        # Update user
        user = user_service.update_user(
            user_id=user_id,
            username=data.get('username'),
            email=data.get('email'),
            profile_picture=data.get('profilePicture')
        )
        
        return jsonify({
            "message": "Profile updated successfully",
            "user": user_schema.dump(user)
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password (requires authentication)"""
    try:
        # Get user identity from JWT token
        current_user_data = get_jwt_identity()
        user_id = current_user_data.get("id")
        
        data = request.json
        
        # Validate required fields
        required_fields = ['currentPassword', 'newPassword']
        for field in required_fields:
            if field not in data or not data.get(field):
                return jsonify({"message": f"Missing required field: {field}"}), 400
        
        # Update password
        success = user_service.update_password(
            user_id=user_id,
            current_password=data['currentPassword'],
            new_password=data['newPassword']
        )
        
        return jsonify({"message": "Password updated successfully"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

# Additional route for admin check
@auth_bp.route('/check-admin', methods=['GET'])
@jwt_required()
def check_admin():
    """Check if the current user is an admin"""
    current_user_data = get_jwt_identity()
    if current_user_data.get('role') != 'admin':
        return jsonify({"isAdmin": False}), 403
    return jsonify({"isAdmin": True}), 200