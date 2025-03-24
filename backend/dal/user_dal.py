from models import db, Contact
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func

class UserDAL:
    """
    Data Access Layer for Contact model
    Handles all database operations for Contact entities
    """
    
    @staticmethod
    def get_all():
        """Get all contacts ordered by name"""
        return Contact.query.order_by(Contact.last_name, Contact.first_name).all()
    
    @staticmethod
    def get_by_id(contact_id):
        """Get contact by ID"""
        return Contact.query.get(contact_id)
    
    @staticmethod
    def get_by_email(email):
        """Get contact by email address"""
        return Contact.query.filter_by(email=email).first()
    
    @staticmethod
    def search(search_term):
        """Search contacts by name or email"""
        return Contact.query.filter(
            (Contact.first_name.ilike(f'%{search_term}%')) |
            (Contact.last_name.ilike(f'%{search_term}%')) |
            (Contact.email.ilike(f'%{search_term}%'))
        ).order_by(Contact.last_name, Contact.first_name).all()
    
    @staticmethod
    def create(first_name, last_name, email, is_admin=False):
        """Create a new contact"""
        contact = Contact(
            first_name=first_name,
            last_name=last_name,
            email=email,
            is_admin=is_admin
        )
        db.session.add(contact)
        db.session.commit()
        return contact
    
    @staticmethod
    def update(contact_id, first_name, last_name, email, is_admin=None):
        """Update an existing contact"""
        contact = UserDAL.get_by_id(contact_id)
        if not contact:
            return None
            
        contact.first_name = first_name
        contact.last_name = last_name
        contact.email = email
        
        if is_admin is not None:
            contact.is_admin = is_admin
            
        db.session.commit()
        return contact
    
    @staticmethod
    def delete(contact_id):
        """Delete a contact by ID"""
        contact = UserDAL.get_by_id(contact_id)
        if not contact:
            return False
            
        db.session.delete(contact)
        db.session.commit()
        return True
    
    @staticmethod
    def get_most_active_reviewers(limit=5):
        """Get most active reviewers by number of reviews"""
        from models import BakeryReview, PastryReview
        
        # Count reviews per user across both review types
        result = db.session.query(
            Contact,
            (func.count(BakeryReview.id) + func.count(PastryReview.id)).label('review_count')
        ).outerjoin(
            BakeryReview, Contact.id == BakeryReview.contact_id
        ).outerjoin(
            PastryReview, Contact.id == PastryReview.contact_id
        ).group_by(
            Contact.id
        ).order_by(
            func.count(BakeryReview.id) + func.count(PastryReview.id).desc()
        ).limit(limit).all()
        
        return result