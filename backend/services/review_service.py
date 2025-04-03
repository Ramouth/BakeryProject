from dal.review_dal import ReviewDAL
from models import BakeryReview, PastryReview

class ReviewService:
    """Service class for review-related business logic"""

    def __init__(self):
        self.review_dal = ReviewDAL()

    def get_all_reviews(self, model):
        """Get all reviews for a given model"""
        return self.review_dal.get_all_reviews(model)

    def get_review_by_id(self, model, review_id):
        """Get a specific review by ID for a given model"""
        return self.review_dal.get_review_by_id(model, review_id)

    def get_reviews_by_entity(self, model, entity_id_field, entity_id):
        """Get all reviews for a specific entity (e.g., bakery or pastry)"""
        return self.review_dal.get_reviews_by_entity(model, entity_id_field, entity_id)

    def create_review(self, model, review_data):
        """Create a new review for a given model"""
        # Add validation logic here if needed
        return self.review_dal.create_review(model, review_data)

    def update_review(self, model, review_id, review_data):
        """Update an existing review for a given model"""
        # Add validation logic here if needed
        return self.review_dal.update_review(model, review_id, review_data)

    def delete_review(self, model, review_id):
        """Delete a review for a given model"""
        return self.review_dal.delete_review(model, review_id)