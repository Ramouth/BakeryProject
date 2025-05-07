from backend.extensions import db 
from sqlalchemy.exc import SQLAlchemyError
from backend.models import BakeryReview, ProductReview 
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
    
    def get_bakery_reviews_by_user(self, user_id):
        """Get all bakery reviews by a specific user"""
        return BakeryReview.query.filter_by(user_id=user_id).order_by(BakeryReview.created_at.desc()).all()
    
    def create_bakery_review(self, review, overall_rating, service_rating, price_rating, 
                         atmosphere_rating, location_rating, user_id=None, bakery_id=None):
        """Create a new bakery review - user_id now optional"""
        try:
            new_review = BakeryReview(
                review=review,
                overall_rating=overall_rating,
                service_rating=service_rating,
                price_rating=price_rating,
                atmosphere_rating=atmosphere_rating,
                location_rating=location_rating,
                user_id=user_id,  # Can be None for anonymous reviews
                bakery_id=bakery_id
            )
            db.session.add(new_review)
            db.session.commit()
            return new_review
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def update_bakery_review(self, review_id, review, overall_rating, service_rating, price_rating, 
                         atmosphere_rating, location_rating, user_id=None, bakery_id=None):
        """Update an existing bakery review - user_id now optional"""
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
            bakery_review.user_id = user_id  # Can be None for anonymous reviews
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
    
    # === Product Review Methods ===
    
    def get_all_product_reviews(self):
        """Get all product reviews ordered by creation date (newest first)"""
        return ProductReview.query.order_by(ProductReview.created_at.desc()).all()
    
    def get_product_review_by_id(self, review_id):
        """Get a specific product review by ID"""
        return ProductReview.query.get(review_id)
    
    def get_product_reviews_by_product(self, product_id):
        """Get all reviews for a specific product"""
        return ProductReview.query.filter_by(product_id=product_id).order_by(ProductReview.created_at.desc()).all()
    
    def get_product_reviews_by_user(self, user_id):
        """Get all product reviews by a specific user"""
        return ProductReview.query.filter_by(user_id=user_id).order_by(ProductReview.created_at.desc()).all()
    
    def create_product_review(self, review, overall_rating, taste_rating, price_rating, 
                         presentation_rating, user_id=None, product_id=None):
        """Create a new product review - user_id now optional"""
        try:
            new_review = ProductReview(
                review=review,
                overall_rating=overall_rating,
                taste_rating=taste_rating,
                price_rating=price_rating,
                presentation_rating=presentation_rating,
                user_id=user_id,  # Can be None for anonymous reviews
                product_id=product_id
            )
            db.session.add(new_review)
            db.session.commit()
            return new_review
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def update_product_review(self, review_id, review, overall_rating, taste_rating, price_rating, 
                         presentation_rating, user_id=None, product_id=None):
        """Update an existing product review - user_id now optional"""
        try:
            product_review = self.get_product_review_by_id(review_id)
            if not product_review:
                raise Exception("Product review not found")
                
            product_review.review = review
            product_review.overall_rating = overall_rating
            product_review.taste_rating = taste_rating
            product_review.price_rating = price_rating
            product_review.presentation_rating = presentation_rating
            product_review.user_id = user_id  # Can be None for anonymous reviews
            product_review.product_id = product_id
            
            db.session.commit()
            return product_review
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def delete_product_review(self, review_id):
        """Delete a product review"""
        try:
            product_review = self.get_product_review_by_id(review_id)
            if not product_review:
                raise Exception("Product review not found")
                
            db.session.delete(product_review)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")