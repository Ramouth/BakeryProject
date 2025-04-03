from dal.pastry_dal import PastryDAL
from models import PastryReview
from sqlalchemy.exc import SQLAlchemyError

class PastryService:
    """Service class for pastry-related business logic"""

    def __init__(self):
        self.pastry_dal = PastryDAL()

    def get_all_pastries(self):
        """Get all pastries ordered by name"""
        return self.pastry_dal.get_all()

    def get_pastry_by_id(self, pastry_id):
        """Get a specific pastry by ID"""
        return self.pastry_dal.get_by_id(pastry_id)

    def get_pastries_by_bakery(self, bakery_id):
        """Get pastries for a specific bakery"""
        return self.pastry_dal.get_by_bakery(bakery_id)

    def search_pastries(self, search_term):
        """Search pastries by name"""
        return self.pastry_dal.search_by_name(search_term)

    def create_pastry(self, name, bakery_id):
        """Create a new pastry"""
        return self.pastry_dal.create(name, bakery_id)

    def update_pastry(self, pastry_id, name, bakery_id):
        """Update an existing pastry"""
        return self.pastry_dal.update(pastry_id, name, bakery_id)

    def delete_pastry(self, pastry_id):
        """Delete a pastry"""
        return self.pastry_dal.delete(pastry_id)

    def get_pastry_stats(self, pastry_id):
        """Get statistics for a pastry including review averages"""
        pastry = self.get_pastry_by_id(pastry_id)
        if not pastry:
            raise Exception("Pastry not found")

        # Get all reviews for this pastry
        reviews = PastryReview.query.filter_by(pastry_id=pastry_id).all()

        if not reviews:
            return {
                "id": pastry.id,
                "name": pastry.name,
                "bakeryId": pastry.bakery_id,
                "bakery_name": pastry.bakery.name if pastry.bakery else None,
                "review_count": 0,
                "average_rating": 0,
                "ratings": {
                    "overall": 0,
                    "taste": 0,
                    "price": 0,
                    "presentation": 0
                }
            }

        # Calculate averages
        review_count = len(reviews)
        avg_overall = sum(r.overall_rating for r in reviews) / review_count
        avg_taste = sum(r.taste_rating for r in reviews) / review_count
        avg_price = sum(r.price_rating for r in reviews) / review_count
        avg_presentation = sum(r.presentation_rating for r in reviews) / review_count

        return {
            "id": pastry.id,
            "name": pastry.name,
            "bakeryId": pastry.bakery_id,
            "bakery_name": pastry.bakery.name if pastry.bakery else None,
            "review_count": review_count,
            "average_rating": round(avg_overall, 1),
            "ratings": {
                "overall": round(avg_overall, 1),
                "taste": round(avg_taste, 1),
                "price": round(avg_price, 1),
                "presentation": round(avg_presentation, 1)
            }
        }

    def get_top_rated_pastries(self, limit=5):
        """Get top-rated pastries based on average overall rating"""
        return self.pastry_dal.get_top_rated(limit)