from flask_bcrypt import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import SQLAlchemyError
from backend.extensions import db
from backend.models.user_models import User

# Custom exceptions
class UserAlreadyExists(Exception):
    """Raised when username or email is already in use."""
    pass

class AuthenticationError(Exception):
    """Raised when login credentials are invalid."""
    pass

class UserNotFound(Exception):
    """Raised when a user cannot be found by ID or username."""
    pass

class PasswordMismatch(Exception):
    """Raised when the current password provided does not match."""
    pass


class UserService:
    """Service class for user-related business logic"""

    def get_all_users(self):
        """Return all users ordered by username."""
        return User.query.order_by(User.username).all()

    def get_user_by_id(self, user_id):
        """Return a user by their primary key."""
        user = User.query.get(user_id)
        if not user:
            raise UserNotFound(f"User with id {user_id} not found")
        return user

    def get_user_by_email(self, email):
        """Return a user by email."""
        return User.query.filter_by(email=email).first()

    def get_user_by_username(self, username):
        """Return a user by username."""
        return User.query.filter_by(username=username).first()

    def search_users(self, search_term):
        """Search users by username or email substring."""
        pattern = f"%{search_term}%"
        return (
            User.query.filter(
                (User.username.ilike(pattern)) |
                (User.email.ilike(pattern))
            )
            .order_by(User.username)
            .all()
        )

    def create_user(self, username, email, password, profile_picture=1, is_admin=False):
        """Create and persist a new user."""
        # Duplicate checks
        if self.get_user_by_email(email):
            raise UserAlreadyExists("Email already in use")
        if self.get_user_by_username(username):
            raise UserAlreadyExists("Username already in use")

        try:
            # Let the User model handle password hashing
            user = User(
                username=username,
                email=email,
                password=password,  # Pass the raw password to User.__init__
                profile_picture=profile_picture,
                is_admin=is_admin
            )
            db.session.add(user)
            db.session.commit()
            return user

        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error creating user: {e}")

    def update_user(self, user_id, username=None, email=None,
                    profile_picture=None, is_admin=None, password=None):
        """Update user fields; only update password if explicitly provided."""
        user = self.get_user_by_id(user_id)

        # Check duplicates if changing
        if username and username != user.username:
            if self.get_user_by_username(username):
                raise UserAlreadyExists("Username already in use")
            user.username = username

        if email and email != user.email:
            if self.get_user_by_email(email):
                raise UserAlreadyExists("Email already in use")
            user.email = email

        if profile_picture is not None:
            user.profile_picture = profile_picture

        if is_admin is not None:
            user.is_admin = is_admin

        # Only update password if explicitly provided
        if password and password.strip():
            user.password_hash = generate_password_hash(password).decode('utf-8')

        try:
            db.session.commit()
            return user
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error updating user: {e}")

    def update_password(self, user_id, current_password, new_password):
        """Verify current password then set a new one."""
        user = self.get_user_by_id(user_id)
        if not check_password_hash(user.password_hash, current_password):
            raise PasswordMismatch("Current password is incorrect")

        try:
            user.password_hash = generate_password_hash(new_password).decode('utf-8')
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error updating password: {e}")

    def delete_user(self, user_id):
        """Permanently delete a user."""
        user = self.get_user_by_id(user_id)
        try:
            db.session.delete(user)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error deleting user: {e}")

    def authenticate_user(self, username, password):
        """Verify username and password; return user if valid."""
        user = self.get_user_by_username(username)
        if not user or not check_password_hash(user.password_hash, password):
            raise AuthenticationError("Invalid username or password")
        return user

    def create_user_token(self, user):
        """
        Create a JWT access token for the given user.
        Ensures the identity is a string to satisfy JWT requirements.
        """
        user_id_str = str(user.id)
        return create_access_token(identity=user_id_str)