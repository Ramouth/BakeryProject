from models import db, User
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.security import generate_password_hash, check_password_hash

class UserService:
    """Service class for user-related business logic"""
    
    def get_all_users(self):
        """Get all users ordered by username"""
        return User.query.order_by(User.username).all()
    
    def get_user_by_id(self, user_id):
        """Get a specific user by ID"""
        return User.query.get(user_id)
    
    def get_user_by_email(self, email):
        """Get a user by email address"""
        return User.query.filter_by(email=email).first()
    
    def get_user_by_username(self, username):
        """Get a user by username"""
        return User.query.filter_by(username=username).first()
    
    def search_users(self, search_term):
        """Search users by username or email"""
        return User.query.filter(
            (User.username.ilike(f'%{search_term}%')) |
            (User.email.ilike(f'%{search_term}%'))
        ).order_by(User.username).all()
    
    def create_user(self, username, email, password, profile_picture=1, is_admin=False):
        """Create a new user"""
        try:
            # Check if email already exists
            existing_email = self.get_user_by_email(email)
            if existing_email:
                raise Exception("Email already in use")
            
            # Check if username already exists
            existing_username = self.get_user_by_username(username)
            if existing_username:
                raise Exception("Username already in use")
                
            # Create user with hashed password
            user = User(
                username=username,
                email=email,
                profile_picture=profile_picture,
                is_admin=is_admin
            )
            user.set_password(password)
            
            db.session.add(user)
            db.session.commit()
            return user
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def update_user(self, user_id, username=None, email=None, profile_picture=None, is_admin=None):
        """Update an existing user (password update handled separately)"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                raise Exception("User not found")
            
            # Check if username is being updated and already exists
            if username and username != user.username:
                existing_username = self.get_user_by_username(username)
                if existing_username:
                    raise Exception("Username already in use")
                user.username = username
            
            # Check if email is being updated and already exists
            if email and email != user.email:
                existing_email = self.get_user_by_email(email)
                if existing_email:
                    raise Exception("Email already in use")
                user.email = email
            
            # Update profile picture if provided
            if profile_picture is not None:
                user.profile_picture = profile_picture
                
            # Update admin status if provided
            if is_admin is not None:
                user.is_admin = is_admin
                
            db.session.commit()
            return user
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def update_password(self, user_id, current_password, new_password):
        """Update a user's password"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                raise Exception("User not found")
                
            # Verify current password
            if not user.check_password(current_password):
                raise Exception("Current password is incorrect")
                
            # Update password
            user.set_password(new_password)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def delete_user(self, user_id):
        """Delete a user"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                raise Exception("User not found")
                
            db.session.delete(user)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def authenticate_user(self, username, password):
        """Authenticate a user by username and password"""
        user = self.get_user_by_username(username)
        if not user or not user.check_password(password):
            return None
        return user