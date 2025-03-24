from models import db, BakeryReview, PastryReview
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func

class ReviewDAL:
    """
    Data Access Layer for Review models
    Handles all database operations for BakeryReview and PastryReview entities
    """
    
    # Bakery Review methods
    @staticmethod
    def get_all_bakery_reviews():
        """Get all bakery reviews ordered by creation date (newest first)"""
        return BakeryReview.query.order_by(BakeryReview.created_at.desc()).all()
    
    @staticmethod
    def get_bakery_review_by_id(review_id):
        """Get bakery review by ID"""
        return BakeryReview.query.get(review_id)
    
    @staticmethod
    def get_bakery_reviews_by_bakery(bakery_id):
        """Get all reviews for a specific bakery"""
        return BakeryReview.query.filter_by(bakery_id=bakery_id).order_by(BakeryReview.created_at.desc()).all()
    
    @staticmethod
    def get_bakery_reviews_by_contact(contact_id):
        """Get all bakery reviews by a specific user"""
        return BakeryReview.query.filter_by(contact_id=contact_id).order_by(BakeryReview.created_at.desc()).all()
    
    @staticmethod
    def create_bakery_review(review_data):
        """Create a new bakery review"""
        review = BakeryReview(
            review=review_data['review'],
            overall_rating=review_data['overall_rating'],
            service_rating=review_data['service_rating'],
            price_rating=review_data['price_rating'],
            atmosphere_rating=review_data['atmosphere_rating'],
            location_rating=review_data['location_rating'],
            contact_id=review_data['contact_id'],
            bakery_id=review_data['bakery_id']
        )
        db.session.add(review)
        db.session.commit()
        return review
    
    @staticmethod
    def update_bakery_review(review_id, review_data):
        """Update an existing bakery review"""
        review = ReviewDAL.get_bakery_review_by_id(review_id)
        if not review:
            return None
            
        review.review = review_data['review']
        review.overall_rating = review_data['overall_rating']
        review.service_rating = review_data['service_rating']
        review.price_rating = review_data['price_rating']
        review.atmosphere_rating = review_data['atmosphere_rating']
        review.location_rating = review_data['location_rating']
        review.contact_id = review_data['contact_id']
        review.bakery_id = review_data['bakery_id']
        
        db.session.commit()
        return review
    
    @staticmethod
    def delete_bakery_review(review_id):
        """Delete a bakery review"""
        review = ReviewDAL.get_bakery_review_by_id(review_id)
        if not review:
            return False
            
        db.session.delete(review)
        db.session.commit()
        return True
    
    # Pastry Review methods
    @staticmethod
    def get_all_pastry_reviews():
        """Get all pastry reviews ordered by creation date (newest first)"""
        return PastryReview.query.order_by(PastryReview.created_at.desc()).all()
    
    @staticmethod
    def get_pastry_review_by_id(review_id):
        """Get pastry review by ID"""
        return PastryReview.query.get(review_id)
    
    @staticmethod
    def get_pastry_reviews_by_pastry(pastry_id):
        """Get all reviews for a specific pastry"""
        return PastryReview.query.filter_by(pastry_id=pastry_id).order_by(PastryReview.created_at.desc()).all()
    
    @staticmethod
    def get_pastry_reviews_by_contact(contact_id):
        """Get all pastry reviews by a specific user"""
        return PastryReview.query.filter_by(contact_id=contact_id).order_by(PastryReview.created_at.desc()).all()
    
    @staticmethod
    def create_pastry_review(review_data):
        """Create a new pastry review"""
        review = PastryReview(
            review=review_data['review'],
            overall_rating=review_data['overall_rating'],
            taste_rating=review_data['taste_rating'],
            price_rating=review_data['price_rating'],
            presentation_rating=review_data['presentation_rating'],
            contact_id=review_data['contact_id'],
            pastry_id=review_data['pastry_id']
        )
        db.session.add(review)
        db.session.commit()
        return review
    
    @staticmethod
    def update_pastry_review(review_id, review_data):
        """Update an existing pastry review"""
        review = ReviewDAL.get_pastry_review_by_id(review_id)
        if not review:
            return None
            
        review.review = review_data['review']
        review.overall_rating = review_data['overall_rating']
        review.taste_rating = review_data['taste_rating']
        review.price_rating = review_data['price_rating']
        review.presentation_rating = review_data['presentation_rating']
        review.contact_id = review_data['contact_id']
        review.pastry_id = review_data['pastry_id']
        
        db.session.commit()
        return review
    
    @staticmethod
    def delete_pastry_review(review_id):
        """Delete a pastry review"""
        review = ReviewDAL.get_pastry_review_by_id(review_id)
        if not review:
            return False
            
        db.session.delete(review)
        db.session.commit()
        return True
        
    # Analytics methods
    @staticmethod
    def get_rating_distribution(model, rating_field, entity_id_field=None, entity_id=None):
        """Get distribution of ratings for a specific field"""
        query = db.session.query(
            getattr(model, rating_field),
            func.count().label('count')
        )
        
        # Filter by entity if specified
        if entity_id_field and entity_id:
            query = query.filter(getattr(model, entity_id_field) == entity_id)
            
        result = query.group_by(getattr(model, rating_field)).all()
        
        # Convert to dictionary for easier consumption
        distribution = {i: 0 for i in range(1, 11)}  # Initialize with zeros for ratings 1-10
        for rating, count in result:
            distribution[rating] = count
            
        return distribution