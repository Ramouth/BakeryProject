from backend.models import db, Contact, BakeryReview, PastryReview
from sqlalchemy.exc import SQLAlchemyError


class UserService:
    """Service class for user-related business logic"""

    def get_all_contacts(self):
        """Get all contacts ordered by name"""
        return Contact.query.order_by(Contact.last_name, Contact.first_name).all()

    def get_contact_by_id(self, contact_id):
        """Get a specific contact by ID"""
        return Contact.query.get(contact_id)

    def get_contact_by_email(self, email):
        """Get a contact by email address"""
        return Contact.query.filter_by(email=email).first()

    def search_contacts(self, search_term):
        """Search contacts by name or email"""
        return Contact.query.filter(
            (Contact.first_name.ilike(f'%{search_term}%')) |
            (Contact.last_name.ilike(f'%{search_term}%')) |
            (Contact.email.ilike(f'%{search_term}%'))
        ).order_by(Contact.last_name, Contact.first_name).all()

    def create_contact(self, first_name, last_name, email, is_admin=False):
        """Create a new contact"""
        try:
            existing_contact = self.get_contact_by_email(email)
            if existing_contact:
                raise Exception("Email already in use")

            contact = Contact(
                first_name=first_name,
                last_name=last_name,
                email=email,
                is_admin=is_admin
            )
            db.session.add(contact)
            db.session.commit()
            return contact
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")

    def update_contact(self, contact_id, first_name, last_name, email, is_admin=None):
        """Update an existing contact"""
        try:
            contact = self.get_contact_by_id(contact_id)
            if not contact:
                raise Exception("Contact not found")

            if email != contact.email:
                existing_contact = self.get_contact_by_email(email)
                if existing_contact and existing_contact.id != contact_id:
                    raise Exception("Email already in use")

            contact.first_name = first_name
            contact.last_name = last_name
            contact.email = email

            if is_admin is not None:
                contact.is_admin = is_admin

            db.session.commit()
            return contact
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")

    def delete_contact(self, contact_id):
        """Delete a contact"""
        try:
            contact = self.get_contact_by_id(contact_id)
            if not contact:
                raise Exception("Contact not found")

            db.session.delete(contact)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")

    def get_contact_stats(self, contact_id):
        """Get statistics for a contact including review counts"""
        contact = self.get_contact_by_id(contact_id)
        if not contact:
            raise Exception("Contact not found")

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
