from models import db, Bakery, BakeryReview
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError

class BakeryService:
    """Service class for bakery-related business logic"""
    
    def get_all_bakeries(self):
        """Get all bakeries ordered by name"""
        return Bakery.query.order_by(Bakery.name).all()
    
    def get_bakery_by_id(self, bakery_id):
        """Get a specific bakery by ID"""
        return Bakery.query.get(bakery_id)
    
    def get_bakeries_by_zip(self, zip_code):
        """Get bakeries by zip code"""
        return Bakery.query.filter_by(zip_code=zip_code).order_by(Bakery.name).all()
    
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
        """Delete a bakery with transaction support and cascade delete"""
        try:
            bakery = self.get_bakery_by_id(bakery_id)
            if not bakery:
                raise Exception("Bakery not found")
                
            db.session.delete(bakery)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def get_bakery_stats(self, bakery_id):
        """Get statistics for a bakery including review averages"""
        bakery = self.get_bakery_by_id(bakery_id)
        if not bakery:
            raise Exception("Bakery not found")
            
        # Get all reviews for this bakery
        reviews = BakeryReview.query.filter_by(bakery_id=bakery_id).all()
        
        if not reviews:
            return {
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
        
        # Calculate averages
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
            "streetName": bakery.street_name,
            "streetNumber": bakery.street_number,
            "imageUrl": bakery.image_url,
            "websiteUrl": bakery.website_url,
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
        result = db.session.query(
            Bakery,
            func.avg(BakeryReview.overall_rating).label('avg_rating'),
            func.count(BakeryReview.id).label('review_count')
        ).join(BakeryReview).group_by(Bakery.id).order_by(
            func.avg(BakeryReview.overall_rating).desc()
        ).having(func.count(BakeryReview.id) > 0).limit(limit).all()
        
        top_bakeries = []
        for bakery, avg_rating, review_count in result:
            bakery_data = bakery.to_json()
            bakery_data['average_rating'] = round(avg_rating, 1)
            bakery_data['review_count'] = review_count
            top_bakeries.append(bakery_data)
            
        return top_bakeries