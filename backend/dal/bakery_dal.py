from models import db, Bakery
from sqlalchemy.exc import SQLAlchemyError
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

# backend/dal/pastry_dal.py
# Data Access Layer for pastry-related database operations

from models import db, Pastry
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func

class PastryDAL:
    """
    Data Access Layer for Pastry model
    Handles all database operations for Pastry entities
    """
    
    @staticmethod
    def get_all():
        """Get all pastries ordered by name"""
        return Pastry.query.order_by(Pastry.name).all()
    
    @staticmethod
    def get_by_id(pastry_id):
        """Get pastry by ID"""
        return Pastry.query.get(pastry_id)
    
    @staticmethod
    def get_by_bakery(bakery_id):
        """Get all pastries for a specific bakery"""
        return Pastry.query.filter_by(bakery_id=bakery_id).order_by(Pastry.name).all()
    
    @staticmethod
    def search_by_name(search_term):
        """Search pastries by name with partial matching"""
        return Pastry.query.filter(Pastry.name.ilike(f'%{search_term}%')).order_by(Pastry.name).all()
    
    @staticmethod
    def create(name, bakery_id):
        """Create a new pastry"""
        pastry = Pastry(name=name, bakery_id=bakery_id)
        db.session.add(pastry)
        db.session.commit()
        return pastry
    
    @staticmethod
    def update(pastry_id, name, bakery_id):
        """Update an existing pastry"""
        pastry = PastryDAL.get_by_id(pastry_id)
        if not pastry:
            return None
            
        pastry.name = name
        pastry.bakery_id = bakery_id
        db.session.commit()
        return pastry
    
    @staticmethod
    def delete(pastry_id):
        """Delete a pastry by ID"""
        pastry = PastryDAL.get_by_id(pastry_id)
        if not pastry:
            return False
            
        db.session.delete(pastry)
        db.session.commit()
        return True
    
    @staticmethod
    def get_top_rated(limit=5):
        """Get top rated pastries based on review score"""
        from models import PastryReview
        
        # Use SQLAlchemy aggregation to get average ratings
        result = db.session.query(
            Pastry,
            func.avg(PastryReview.overall_rating).label('avg_rating'),
            func.count(PastryReview.id).label('review_count')
        ).join(
            PastryReview, Pastry.id == PastryReview.pastry_id
        ).group_by(
            Pastry.id
        ).order_by(
            func.avg(PastryReview.overall_rating).desc()
        ).having(
            func.count(PastryReview.id) > 0
        ).limit(limit).all()
        
        return result