from models import db, Product, ProductReview
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError

class ProductService:
    """Service class for product-related business logic"""
    
    def get_all_products(self):
        """Get all products ordered by name"""
        return Product.query.order_by(Product.name).all()
    
    def get_product_by_id(self, product_id):
        """Get a specific product by ID"""
        return Product.query.get(product_id)
    
    def get_products_by_bakery(self, bakery_id):
        """Get products for a specific bakery"""
        return Product.query.filter_by(bakery_id=bakery_id).order_by(Product.name).all()
    
    def get_products_by_category(self, category):
        """Get products by category"""
        return Product.query.filter_by(category=category).order_by(Product.name).all()
    
    def search_products(self, search_term):
        """Search products by name"""
        return Product.query.filter(Product.name.ilike(f'%{search_term}%')).order_by(Product.name).all()
    
    def create_product(self, name, bakery_id, category=None, image_url=None):
        """Create a new product"""
        try:
            product = Product(
                name=name, 
                bakery_id=bakery_id, 
                category=category,
                image_url=image_url
            )
            db.session.add(product)
            db.session.commit()
            return product
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def update_product(self, product_id, name, bakery_id, category=None, image_url=None):
        """Update an existing product"""
        try:
            product = self.get_product_by_id(product_id)
            if not product:
                raise Exception("Product not found")
                
            product.name = name
            product.bakery_id = bakery_id
            product.category = category
            product.image_url = image_url
            
            db.session.commit()
            return product
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def delete_product(self, product_id):
        """Delete a product"""
        try:
            product = self.get_product_by_id(product_id)
            if not product:
                raise Exception("Product not found")
                
            db.session.delete(product)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def get_product_stats(self, product_id):
        """Get statistics for a product including review averages"""
        product = self.get_product_by_id(product_id)
        if not product:
            raise Exception("Product not found")
            
        # Get all reviews for this product
        reviews = ProductReview.query.filter_by(product_id=product_id).all()
        
        if not reviews:
            return {
                "id": product.id,
                "name": product.name,
                "bakeryId": product.bakery_id,
                "category": product.category,
                "imageUrl": product.image_url,
                "bakery_name": product.bakery.name if product.bakery else None,
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
            "id": product.id,
            "name": product.name,
            "bakeryId": product.bakery_id,
            "category": product.category,
            "imageUrl": product.image_url,
            "bakery_name": product.bakery.name if product.bakery else None,
            "review_count": review_count,
            "average_rating": round(avg_overall, 1),
            "ratings": {
                "overall": round(avg_overall, 1),
                "taste": round(avg_taste, 1),
                "price": round(avg_price, 1),
                "presentation": round(avg_presentation, 1)
            }
        }
        
    def get_top_rated_products(self, limit=5):
        """Get top-rated products based on average overall rating"""
        result = db.session.query(
            Product,
            func.avg(ProductReview.overall_rating).label('avg_rating'),
            func.count(ProductReview.id).label('review_count')
        ).join(ProductReview).group_by(Product.id).order_by(
            func.avg(ProductReview.overall_rating).desc()
        ).having(func.count(ProductReview.id) > 0).limit(limit).all()
        
        top_products = []
        for product, avg_rating, review_count in result:
            product_data = {
                'id': product.id,
                'name': product.name,
                'bakeryId': product.bakery_id,
                'category': product.category,
                'imageUrl': product.image_url,
                'bakery_name': product.bakery.name if product.bakery else None,
                'average_rating': round(avg_rating, 1),
                'review_count': review_count
            }
            top_products.append(product_data)
            
        return top_products