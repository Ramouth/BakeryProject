from models import db, product
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func

class productDAL:
    """
    Data Access Layer for product model
    Handles all database operations for product entities
    """
    
    @staticmethod
    def get_all():
        """Get all pastries ordered by name"""
        return product.query.order_by(product.name).all()
    
    @staticmethod
    def get_by_id(product_id):
        """Get product by ID"""
        return product.query.get(product_id)
    
    @staticmethod
    def get_by_bakery(bakery_id):
        """Get all pastries for a specific bakery"""
        return product.query.filter_by(bakery_id=bakery_id).order_by(product.name).all()
    
    @staticmethod
    def search_by_name(search_term):
        """Search pastries by name with partial matching"""
        return product.query.filter(product.name.ilike(f'%{search_term}%')).order_by(product.name).all()
    
    @staticmethod
    def create(name, bakery_id):
        """Create a new product"""
        product = product(name=name, bakery_id=bakery_id)
        db.session.add(product)
        db.session.commit()
        return product
    
    @staticmethod
    def update(product_id, name, bakery_id):
        """Update an existing product"""
        product = productDAL.get_by_id(product_id)
        if not product:
            return None
            
        product.name = name
        product.bakery_id = bakery_id
        db.session.commit()
        return product
    
    @staticmethod
    def delete(product_id):
        """Delete a product by ID"""
        product = productDAL.get_by_id(product_id)
        if not product:
            return False
            
        db.session.delete(product)
        db.session.commit()
        return True
    
    @staticmethod
    def get_top_rated(limit=5):
        """Get top rated pastries based on review score"""
        from models import productReview
        
        # Use SQLAlchemy aggregation to get average ratings
        result = db.session.query(
            product,
            func.avg(productReview.overall_rating).label('avg_rating'),
            func.count(productReview.id).label('review_count')
        ).join(
            productReview, product.id == productReview.product_id
        ).group_by(
            product.id
        ).order_by(
            func.avg(productReview.overall_rating).desc()
        ).having(
            func.count(productReview.id) > 0
        ).limit(limit).all()
        
        return result