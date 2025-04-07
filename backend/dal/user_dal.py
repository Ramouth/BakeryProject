from models import db, User
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func

class UserDAL:
    """
    Data Access Layer for User model
    Handles all database operations for User entities
    """
    
    @staticmethod
    def get_all():
        """Get all users ordered by name"""
        return User.query.order_by(User.last_name, User.first_name).all()
    
    @staticmethod
    def get_by_id(user_id):
        """Get user by ID"""
        return User.query.get(user_id)
    
    @staticmethod
    def get_by_email(email):
        """Get user by email address"""
        return User.query.filter_by(email=email).first()
    
    @staticmethod
    def search(search_term):
        """Search users by name or email"""
        return User.query.filter(
            (User.first_name.ilike(f'%{search_term}%')) |
            (User.last_name.ilike(f'%{search_term}%')) |
            (User.email.ilike(f'%{search_term}%'))
        ).order_by(User.last_name, User.first_name).all()
    
    @staticmethod
    def create(first_name, last_name, email, is_admin=False):
        """Create a new user"""
        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            is_admin=is_admin
        )
        db.session.add(user)
        db.session.commit()
        return user
    
    @staticmethod
    def update(user_id, first_name, last_name, email, is_admin=None):
        """Update an existing user"""
        user = UserDAL.get_by_id(user_id)
        if not user:
            return None
            
        user.first_name = first_name
        user.last_name = last_name
        user.email = email
        
        if is_admin is not None:
            user.is_admin = is_admin
            
        db.session.commit()
        return user
    
    @staticmethod
    def delete(user_id):
        """Delete a user by ID"""
        user = UserDAL.get_by_id(user_id)
        if not user:
            return False
            
        db.session.delete(user)
        db.session.commit()
        return True
    
    @staticmethod
    def get_most_active_reviewers(limit=5):
        """Get most active reviewers by number of reviews"""
        from models import BakeryReview, productReview
        
        # Count reviews per user across both review types
        result = db.session.query(
            User,
            (func.count(BakeryReview.id) + func.count(productReview.id)).label('review_count')
        ).outerjoin(
            BakeryReview, User.id == BakeryReview.user_id
        ).outerjoin(
            productReview, User.id == productReview.user_id
        ).group_by(
            User.id
        ).order_by(
            func.count(BakeryReview.id) + func.count(productReview.id).desc()
        ).limit(limit).all()
        
        return result