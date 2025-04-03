from dal.user_dal import UserDAL
from sqlalchemy.exc import SQLAlchemyError

class UserService:
    """Service class for user-related business logic"""
    
    def __init__(self):
        self.user_dal = UserDAL()

    def get_all_contacts(self):
        """Get all contacts ordered by name"""
        return self.user_dal.get_all()
    
    def get_contact_by_id(self, contact_id):
        """Get a specific contact by ID"""
        return self.user_dal.get_by_id(contact_id)
    
    def get_contact_by_email(self, email):
        """Get a contact by email address"""
        return self.user_dal.get_by_email(email)
    
    def search_contacts(self, search_term):
        """Search contacts by name or email"""
        return self.user_dal.search(search_term)
    
    def create_contact(self, contact_data):
        """Create a new contact"""
        # Check if email already exists
        existing_contact = self.get_contact_by_email(contact_data['email'])
        if existing_contact:
            raise Exception("Email already in use")
        
        return self.user_dal.create(contact_data)
    
    def update_contact(self, contact_id, contact_data):
        """Update an existing contact"""
        contact = self.get_contact_by_id(contact_id)
        if not contact:
            raise Exception("Contact not found")
        
        # Check if email already exists and belongs to a different contact
        if 'email' in contact_data and contact_data['email'] != contact.email:
            existing_contact = self.get_contact_by_email(contact_data['email'])
            if existing_contact and existing_contact.id != contact_id:
                raise Exception("Email already in use")
        
        return self.user_dal.update(contact_id, contact_data)
    
    def delete_contact(self, contact_id):
        """Delete a contact"""
        contact = self.get_contact_by_id(contact_id)
        if not contact:
            raise Exception("Contact not found")
        
        return self.user_dal.delete(contact_id)
    
    def get_contact_stats(self, contact_id):
        """Get statistics for a contact including review counts"""
        from models import BakeryReview, PastryReview
        
        contact = self.get_contact_by_id(contact_id)
        if not contact:
            raise Exception("Contact not found")
        
        # Get review counts
        bakery_review_count = BakeryReview.query.filter_by(contact_id=contact_id).count()
        pastry_review_count = PastryReview.query.filter_by(contact_id=contact_id).count()
        
        return {
            "id": contact.id,
            "name": f"{contact.first_name} {contact.last_name}",
            "email": contact.email,
            "is_admin": contact.is_admin,
            "review_counts": {
                "bakery_reviews": bakery_review_count,
                "pastry_reviews": pastry_review_count,
                "total_reviews": bakery_review_count + pastry_review_count
            }
        }