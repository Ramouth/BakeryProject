from dal.bakery_dal import BakeryDAL
from models import BakeryReview
from sqlalchemy.exc import SQLAlchemyError

class BakeryService:
    """Service class for bakery-related business logic"""

    def __init__(self):
        self.bakery_dal = BakeryDAL()

    def get_all_bakeries(self):
        """Get all bakeries ordered by name"""
        return self.bakery_dal.get_all()

    def get_bakery_by_id(self, bakery_id):
        """Get a specific bakery by ID"""
        return self.bakery_dal.get_by_id(bakery_id)

    def get_bakeries_by_zip(self, zip_code):
        """Get bakeries by zip code"""
        return self.bakery_dal.get_by_zip(zip_code)

    def search_bakeries(self, search_term):
        """Search bakeries by name using case-insensitive partial matching"""
        return self.bakery_dal.search_by_name(search_term)

    def create_bakery(self, name, zip_code):
        """Create a new bakery"""
        return self.bakery_dal.create(name, zip_code)

    def update_bakery(self, bakery_id, name, zip_code):
        """Update an existing bakery"""
        return self.bakery_dal.update(bakery_id, name, zip_code)

    def delete_bakery(self, bakery_id):
        """Delete a bakery"""
        return self.bakery_dal.delete(bakery_id)

    def get_bakery_stats(self, bakery_id):
        """Get statistics for a bakery including review averages"""
        bakery = self.get_bakery_by_id(bakery_id)
        if not bakery:
            raise Exception("Bakery not found")

        reviews = BakeryReview.query.filter_by(bakery_id=bakery_id).all()
        if not reviews:
            return {
                "id": bakery.id,
                "name": bakery.name,
                "zipCode": bakery.zip_code,
                "review_count": 0,
                "average_rating": 0,
                "ratings": {
                    "overall": 0,
                    "service": 0,
                    "price": 0,
                    "atmosphere": 0,
                    "location": 0
                }
            }

        review_count = len(reviews)
        avg_overall = sum(r.overall_rating for r in reviews) / review_count
        avg_service = sum(r.service_rating for r in reviews) / review_count
        avg_price = sum(r.price_rating for r in reviews) / review_count
        avg_atmosphere = sum(r.atmosphere_rating for r in reviews) / review_count
        avg_location = sum(r.location_rating for r in reviews) / review_count

        return {
            "id": bakery.id,
            "name": bakery.name,
            "zipCode": bakery.zip_code,
            "review_count": review_count,
            "average_rating": round(avg_overall, 1),
            "ratings": {
                "overall": round(avg_overall, 1),
                "service": round(avg_service, 1),
                "price": round(avg_price, 1),
                "atmosphere": round(avg_atmosphere, 1),
                "location": round(avg_location, 1)
            }
        }

    def get_top_rated_bakeries(self, limit=5):
        """Get top-rated bakeries based on average overall rating"""
        return self.bakery_dal.get_top_rated(limit)