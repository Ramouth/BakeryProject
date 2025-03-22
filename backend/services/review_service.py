from models import db, BakeryReview, PastryReview
from sqlalchemy.exc import SQLAlchemyError

class ReviewService:
    """Service class for review-related business logic"""
    
    # === Bakery Review Methods ===
    
    def get_all_bakery_reviews(self):
        """Get all bakery reviews ordered by creation date (newest first)"""
        return BakeryReview.query.order_by(BakeryReview.created_at.desc()).all()
    
    def get_bakery_review_by_id(self, review_id):
        """Get a specific bakery review by ID"""
        return BakeryReview.query.get(review_id)
    
    def get_bakery_reviews_by_bakery(self, bakery_id):
        """Get all reviews for a specific bakery"""
        return BakeryReview.query.filter_by(bakery_id=bakery_id).order_by(BakeryReview.created_at.desc()).all()
    
    def get_bakery_reviews_by_contact(self, contact_id):
        """Get all bakery reviews by a specific contact"""
        return BakeryReview.query.filter_by(contact_id=contact_id).order_by(BakeryReview.created_at.desc()).all()
    
    def create_bakery_review(self, review, overall_rating, service_rating, price_rating, 
                         atmosphere_rating, location_rating, contact_id, bakery_id):
        """Create a new bakery review"""
        try:
            new_review = BakeryReview(
                review=review,
                overall_rating=overall_rating,
                service_rating=service_rating,
                price_rating=price_rating,
                atmosphere_rating=atmosphere_rating,
                location_rating=location_rating,
                contact_id=contact_id,
                bakery_id=bakery_id
            )
            db.session.add(new_review)
            db.session.commit()
            return new_review
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def update_bakery_review(self, review_id, review, overall_rating, service_rating, price_rating, 
                         atmosphere_rating, location_rating, contact_id, bakery_id):
        """Update an existing bakery review"""
        try:
            bakery_review = self.get_bakery_review_by_id(review_id)
            if not bakery_review:
                raise Exception("Bakery review not found")
                
            bakery_review.review = review
            bakery_review.overall_rating = overall_rating
            bakery_review.service_rating = service_rating
            bakery_review.price_rating = price_rating
            bakery_review.atmosphere_rating = atmosphere_rating
            bakery_review.location_rating = location_rating
            bakery_review.contact_id = contact_id
            bakery_review.bakery_id = bakery_id
            
            db.session.commit()
            return bakery_review
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def delete_bakery_review(self, review_id):
        """Delete a bakery review"""
        try:
            bakery_review = self.get_bakery_review_by_id(review_id)
            if not bakery_review:
                raise Exception("Bakery review not found")
                
            db.session.delete(bakery_review)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    # === Pastry Review Methods ===
    
    def get_all_pastry_reviews(self):
        """Get all pastry reviews ordered by creation date (newest first)"""
        return PastryReview.query.order_by(PastryReview.created_at.desc()).all()
    
    def get_pastry_review_by_id(self, review_id):
        """Get a specific pastry review by ID"""
        return PastryReview.query.get(review_id)
    
    def get_pastry_reviews_by_pastry(self, pastry_id):
        """Get all reviews for a specific pastry"""
        return PastryReview.query.filter_by(pastry_id=pastry_id).order_by(PastryReview.created_at.desc()).all()
    
    def get_pastry_reviews_by_contact(self, contact_id):
        """Get all pastry reviews by a specific contact"""
        return PastryReview.query.filter_by(contact_id=contact_id).order_by(PastryReview.created_at.desc()).all()
    
    def create_pastry_review(self, review, overall_rating, taste_rating, price_rating, 
                         presentation_rating, contact_id, pastry_id):
        """Create a new pastry review"""
        try:
            new_review = PastryReview(
                review=review,
                overall_rating=overall_rating,
                taste_rating=taste_rating,
                price_rating=price_rating,
                presentation_rating=presentation_rating,
                contact_id=contact_id,
                pastry_id=pastry_id
            )
            db.session.add(new_review)
            db.session.commit()
            return new_review
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def update_pastry_review(self, review_id, review, overall_rating, taste_rating, price_rating, 
                         presentation_rating, contact_id, pastry_id):
        """Update an existing pastry review"""
        try:
            pastry_review = self.get_pastry_review_by_id(review_id)
            if not pastry_review:
                raise Exception("Pastry review not found")
                
            pastry_review.review = review
            pastry_review.overall_rating = overall_rating
            pastry_review.taste_rating = taste_rating
            pastry_review.price_rating = price_rating
            pastry_review.presentation_rating = presentation_rating
            pastry_review.contact_id = contact_id
            pastry_review.pastry_id = pastry_id
            
            db.session.commit()
            return pastry_review
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def delete_pastry_review(self, review_id):
        """Delete a pastry review"""
        try:
            pastry_review = self.get_pastry_review_by_id(review_id)
            if not pastry_review:
                raise Exception("Pastry review not found")
                
            db.session.delete(pastry_review)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")