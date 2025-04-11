from dal.bakery_dal import BakeryDAL
from models import db, Bakery, BakeryReview
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func

class BakeryService:
    """Service class for bakery-related business logic"""

    def __init__(self):
        self.bakery_dal = BakeryDAL()

    def get_all_bakeries(self):
        """Get all bakeries ordered by name"""
        bakeries = self.bakery_dal.get_all()
        
        # Enhance bakeries with rating information
        for bakery in bakeries:
            # Add rating information to each bakery
            stats = self.get_bakery_stats(bakery.id)
            bakery.average_rating = stats.get('average_rating', 0)
            bakery.review_count = stats.get('review_count', 0)
            bakery.ratings = stats.get('ratings', {})
        
        return bakeries

    def get_bakery_by_id(self, bakery_id):
        """Get a specific bakery by ID"""
        bakery = self.bakery_dal.get_by_id(bakery_id)
        if bakery:
            # Add rating information
            stats = self.get_bakery_stats(bakery_id)
            bakery.average_rating = stats.get('average_rating', 0)
            bakery.review_count = stats.get('review_count', 0)
            bakery.ratings = stats.get('ratings', {})
        return bakery

    def get_bakeries_by_zip(self, zip_code):
        """Get bakeries by zip code"""
        return self.bakery_dal.get_by_zip(zip_code)

    def search_bakeries(self, search_term):
        """Search bakeries by name using case-insensitive partial matching"""
        return Bakery.query.filter(Bakery.name.ilike(f'%{search_term}%')).order_by(Bakery.name).all()
    
    def create_bakery(self, name, zip_code, street_name=None, street_number=None, image_url=None, website_url=None):
        """Create a new bakery with transaction support"""
        try:
            bakery = Bakery(
                name=name, 
                zip_code=zip_code, 
                street_name=street_name, 
                street_number=street_number, 
                image_url=image_url, 
                website_url=website_url
            )
            db.session.add(bakery)
            db.session.commit()
            return bakery
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def update_bakery(self, bakery_id, name, zip_code, street_name=None, street_number=None, image_url=None, website_url=None):
        """Update an existing bakery with transaction support"""
        try:
            bakery = self.get_bakery_by_id(bakery_id)
            if not bakery:
                raise Exception("Bakery not found")
                
            bakery.name = name
            bakery.zip_code = zip_code
            bakery.street_name = street_name
            bakery.street_number = street_number
            bakery.image_url = image_url
            bakery.website_url = website_url
            
            db.session.commit()
            return bakery
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def delete_bakery(self, bakery_id):
        """Delete a bakery"""
        return self.bakery_dal.delete(bakery_id)

    def get_bakery_stats(self, bakery_id):
        """Get statistics for a bakery including review averages"""
        bakery = self.bakery_dal.get_by_id(bakery_id)
        if not bakery:
            raise Exception("Bakery not found")

        reviews = BakeryReview.query.filter_by(bakery_id=bakery_id).all()
        
        # Default stats with zero values
        stats = {
            "id": bakery.id,
            "name": bakery.name,
            "zipCode": bakery.zip_code,
            "streetName": bakery.street_name,
            "streetNumber": bakery.street_number,
            "imageUrl": bakery.image_url,
            "websiteUrl": bakery.website_url,
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
        
        # If no reviews, return default stats
        if not reviews:
            return stats

        # Calculate stats based on reviews
        valid_reviews = [r for r in reviews if isinstance(r.overall_rating, (int, float))]
        review_count = len(valid_reviews)
        
        if review_count > 0:
            # Calculate averages using valid reviews only
            def safe_avg(attr):
                valid_values = [getattr(r, attr) for r in valid_reviews 
                               if isinstance(getattr(r, attr), (int, float))]
                return sum(valid_values) / len(valid_values) if valid_values else 0
            
            avg_overall = safe_avg('overall_rating')
            avg_service = safe_avg('service_rating')
            avg_price = safe_avg('price_rating')
            avg_atmosphere = safe_avg('atmosphere_rating')
            avg_location = safe_avg('location_rating')
            
            stats.update({
                "review_count": review_count,
                "average_rating": avg_overall,
                "ratings": {
                    "overall": avg_overall,
                    "service": avg_service,
                    "price": avg_price,
                    "atmosphere": avg_atmosphere,
                    "location": avg_location
                }
            })
        
        return stats

    def get_top_rated_bakeries(self, limit=5):
        """Get top-rated bakeries based on average overall rating"""
        # Get all bakeries and add their stats
        all_bakeries = self.get_all_bakeries()
        
        # Sort by average rating in descending order
        top_bakeries = sorted(
            all_bakeries, 
            key=lambda b: b.average_rating if hasattr(b, 'average_rating') else 0, 
            reverse=True
        )
        
        # Return the top-rated bakeries up to the limit
        return top_bakeries[:limit]