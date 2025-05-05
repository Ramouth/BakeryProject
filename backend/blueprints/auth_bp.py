from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from marshmallow import ValidationError
from werkzeug.security import check_password_hash

from schemas import UserSchema
from services.user_service import UserService, UserNotFound, AuthenticationError

auth_bp = Blueprint('auth', __name__)
user_schema = UserSchema()
user_service = UserService()


# === Custom Exceptions ===
class UserAlreadyExists(Exception):
    """Raised when attempting to register with a duplicate username/email."""
    pass


# === ROUTES ===

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user, returning an access token on success."""
    try:
        payload = request.get_json()
        data = user_schema.load(payload)  # validates and deserializes

        # Check if username already exists
        existing_user = user_service.get_user_by_username(data['username'])
        if existing_user:
            raise UserAlreadyExists("Username already exists")
            
        # Check if email already exists
        try:
            existing_email = user_service.get_user_by_email(data['email'])
            if existing_email:
                raise UserAlreadyExists("Email already exists")
        except UserNotFound:
            # Email doesn't exist, which is what we want
            pass

        user = user_service.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            profile_picture=data.get('profile_picture', 1),
            is_admin=data.get('is_admin', False)
        )

        # Create token with string identity
        token = create_access_token(identity=str(user.id))
        
        return jsonify({
            "message": "Registration successful",
            "user":    user_schema.dump(user),
            "access_token": token
        }), 201

    except ValidationError as ve:
        return jsonify({"errors": ve.messages}), 422

    except UserAlreadyExists as e:
        return jsonify({"message": str(e)}), 409

    except Exception as e:
        current_app.logger.error(f"[REGISTER] unexpected error: {e}")
        return jsonify({"message": "Registration failed"}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate a user and return a JWT access token."""
    try:
        payload = request.get_json()
        
        # Get identifier (username or email) from payload
        identifier = payload.get('username', '')
        password = payload.get('password', '')

        if not identifier or not password:
            return jsonify({"message": "Username/email and password are required"}), 400

        # Check if the identifier contains '@' to determine if it's an email
        is_email = '@' in identifier
        
        current_app.logger.debug(f"[LOGIN] Login attempt with identifier: {identifier}, is_email: {is_email}")
        
        try:
            user = None
            
            if is_email:
                # Try to get user by email
                try:
                    user = user_service.get_user_by_email(identifier)
                    
                    # Verify password
                    if not user.check_password(password):
                        current_app.logger.debug(f"[LOGIN] Password verification failed for email: {identifier}")
                        raise AuthenticationError("Invalid email or password")
                        
                    current_app.logger.debug(f"[LOGIN] Email authentication successful for: {identifier}")
                except UserNotFound:
                    current_app.logger.debug(f"[LOGIN] Email not found: {identifier}")
                    raise AuthenticationError("Invalid email or password")
            else:
                # Use the authenticate_user method for username
                user = user_service.authenticate_user(identifier, password)
            
            if not user:
                raise AuthenticationError("Invalid credentials")
                
            # Create token with string identity
            token = create_access_token(identity=str(user.id))

            return jsonify({
                "message": "Login successful",
                "user": user_schema.dump(user),
                "access_token": token
            }), 200
            
        except (UserNotFound, AuthenticationError) as e:
            # Log the specific error for debugging
            current_app.logger.warning(f"[LOGIN] Authentication failed for identifier: {identifier}, error: {str(e)}")
            return jsonify({"message": "Invalid credentials"}), 401

    except Exception as e:
        current_app.logger.error(f"[LOGIN] unexpected error: {e}")
        return jsonify({"message": "Login failed"}), 500


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Return the current user's profile (protected)."""
    # Debug log to confirm header and identity
    current_app.logger.debug(f"[PROFILE] headers: {dict(request.headers)}")
    try:
        # The identity is now a string, so we need to convert it back to int for the database
        user_id_str = get_jwt_identity()
        current_app.logger.debug(f"[PROFILE] JWT identity (string): {user_id_str}")
        
        # Convert string ID back to integer for database lookup
        user_id = int(user_id_str)
        current_app.logger.debug(f"[PROFILE] User ID (int): {user_id}")

        user = user_service.get_user_by_id(user_id)
        if not user:
            raise UserNotFound()

        return jsonify(user_schema.dump(user)), 200

    except UserNotFound:
        return jsonify({"message": "User not found"}), 404
    
    except ValueError:
        # This would happen if the identity string can't be converted to int
        current_app.logger.error(f"[PROFILE] Invalid user ID format: {get_jwt_identity()}")
        return jsonify({"message": "Invalid user ID format"}), 400

    except Exception as e:
        current_app.logger.error(f"[PROFILE] error: {e}")
        return jsonify({"message": "Failed to fetch profile"}), 500