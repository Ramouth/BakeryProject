from models import db, Bakery
from sqlalchemy import func

class BakeryDAL:
    """
    Data Access Layer for Bakery model
    Handles all database operations for Bakery entities
    """
    
    @staticmethod
    def get_all():
        """Get all bakeries ordered by name"""
        return Bakery.query.order_by(Bakery.name).all()
    
    @staticmethod
    def get_by_id(bakery_id):
        """Get bakery by ID"""
        return Bakery.query.get(bakery_id)
    
    @staticmethod
    def get_by_zip(zip_code):
        """Get bakeries by zip code"""
        return Bakery.query.filter_by(zip_code=zip_code).order_by(Bakery.name).all()
    
    @staticmethod
    def search_by_name(search_term):
        """Search bakeries by name with partial matching"""
        return Bakery.query.filter(Bakery.name.ilike(f'%{search_term}%')).order_by(Bakery.name).all()
    
    @staticmethod
    def create(name, zip_code):
        """Create a new bakery"""
        bakery = Bakery(name=name, zip_code=zip_code)
        db.session.add(bakery)
        db.session.commit()
        return bakery
    
    @staticmethod
    def update(bakery_id, name, zip_code):
        """Update an existing bakery"""
        bakery = BakeryDAL.get_by_id(bakery_id)
        if not bakery:
            return None
            
        bakery.name = name
        bakery.zip_code = zip_code
        db.session.commit()
        return bakery
    
    @staticmethod
    def delete(bakery_id):
        """Delete a bakery by ID"""
        bakery = BakeryDAL.get_by_id(bakery_id)
        if not bakery:
            return False
            
        db.session.delete(bakery)
        db.session.commit()
        return True
    
    @staticmethod
    def get_top_rated(limit=5):
        """Get top rated bakeries based on review score"""
        from models import BakeryReview
        
        # Use SQLAlchemy aggregation to get average ratings
        result = db.session.query(
            Bakery,
            func.avg(BakeryReview.overall_rating).label('avg_rating'),
            func.count(BakeryReview.id).label('review_count')
        ).join(
            BakeryReview, Bakery.id == BakeryReview.bakery_id
        ).group_by(
            Bakery.id
        ).order_by(
            func.avg(BakeryReview.overall_rating).desc()
        ).having(
            func.count(BakeryReview.id) > 0
        ).limit(limit).all()
        
        return result