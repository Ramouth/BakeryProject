from flask import Blueprint, request, jsonify
from schemas import UserSchema
from services.user_service import UserService

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
        
        return jsonify({
            "message": "Registration successful",
            "user": user_schema.dump(user)
        }), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    """Log in a user"""
    try:
        username = request.json.get('username')
        password = request.json.get('password')
        
        if not username or not password:
            return jsonify({"message": "Username and password are required"}), 400
        
        # Authenticate user
        user = user_service.authenticate_user(username, password)
        if not user:
            return jsonify({"message": "Invalid username or password"}), 401
        
        # In a production app, you would create a session token or JWT here
        # For now, we'll just return the user data
        return jsonify({
            "message": "Login successful",
            "user": user_schema.dump(user)
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    """Get user profile (would normally require authentication)"""
    try:
        # In a real app, you would get the user ID from the session or token
        # For now, we'll take it from a query parameter for testing
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify({"message": "User ID is required"}), 400
        
        user = user_service.get_user_by_id(int(user_id))
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        return jsonify(user_schema.dump(user)), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@auth_bp.route('/update-profile', methods=['PATCH'])
def update_profile():
    """Update user profile (would normally require authentication)"""
    try:
        # In a real app, you would get the user ID from the session or token
        user_id = request.json.get('id')
        if not user_id:
            return jsonify({"message": "User ID is required"}), 400
        
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
def change_password():
    """Change user password (would normally require authentication)"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['userId', 'currentPassword', 'newPassword']
        for field in required_fields:
            if field not in data or not data.get(field):
                return jsonify({"message": f"Missing required field: {field}"}), 400
        
        # Update password
        success = user_service.update_password(
            user_id=data['userId'],
            current_password=data['currentPassword'],
            new_password=data['newPassword']
        )
        
        return jsonify({"message": "Password updated successfully"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400