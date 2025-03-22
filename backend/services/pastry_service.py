from models import db, Pastry
from sqlalchemy.exc import SQLAlchemyError

class PastryService:
    """Service class for pastry-related business logic"""
    
    def get_all_pastries(self):
        """Get all pastries ordered by name"""
        return Pastry.query.order_by(Pastry.name).all()
    
    def get_pastry_by_id(self, pastry_id):
        """Get a specific pastry by ID"""
        return Pastry.query.get(pastry_id)
    
    def get_pastries_by_bakery(self, bakery_id):
        """Get pastries for a specific bakery"""
        return Pastry.query.filter_by(bakery_id=bakery_id).order_by(Pastry.name).all()
    
    def search_pastries(self, search_term):
        """Search pastries by name"""
        return Pastry.query.filter(Pastry.name.ilike(f'%{search_term}%')).order_by(Pastry.name).all()
    
    def create_pastry(self, name, bakery_id):
        """Create a new pastry"""
        try:
            pastry = Pastry(name=name, bakery_id=bakery_id)
            db.session.add(pastry)
            db.session.commit()
            return pastry
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def update_pastry(self, pastry_id, name, bakery_id):
        """Update an existing pastry"""
        try:
            pastry = self.get_pastry_by_id(pastry_id)
            if not pastry:
                raise Exception("Pastry not found")
                
            pastry.name = name
            pastry.bakery_id = bakery_id
            db.session.commit()
            return pastry
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def delete_pastry(self, pastry_id):
        """Delete a pastry"""
        try:
            pastry = self.get_pastry_by_id(pastry_id)
            if not pastry:
                raise Exception("Pastry not found")
                
            db.session.delete(pastry)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def get_pastry_stats(self, pastry_id):
        """Get statistics for a pastry including review averages"""
        from models import PastryReview
        
        pastry = self.get_pastry_by_id(pastry_id)
        if not pastry:
            raise Exception("Pastry not found")
            
        # Get all reviews for this pastry
        reviews = PastryReview.query.filter_by(pastry_id=pastry_id).all()
        
        if not reviews:
            return {
                "id": pastry.id,
                "name": pastry.name,
                "bakery_id": pastry.bakery_id,
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
            "bakery_id": pastry.bakery_id,
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