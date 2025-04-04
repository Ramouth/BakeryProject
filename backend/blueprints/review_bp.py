from flask import Blueprint, request, jsonify
from models import db, BakeryReview, ProductReview, Bakery, Product, User
from schemas import BakeryReviewSchema, ProductReviewSchema
from services.review_service import ReviewService
from utils.caching import cache
from sqlalchemy.orm import joinedload

# Create blueprints
bakery_review_bp = Blueprint('bakeryreview', __name__)
product_review_bp = Blueprint('productreview', __name__)

# Initialize schemas
bakery_review_schema = BakeryReviewSchema()
bakery_reviews_schema = BakeryReviewSchema(many=True)
product_review_schema = ProductReviewSchema()
product_reviews_schema = ProductReviewSchema(many=True)

# Initialize service
review_service = ReviewService()

# === Bakery Review Routes ===

@bakery_review_bp.route('/', methods=['GET'])
def get_bakery_reviews():
    """Get all bakery reviews with related user and bakery information"""
    try:
        # Use joined load to efficiently fetch related data
        reviews = BakeryReview.query.options(
            joinedload(BakeryReview.user),
            joinedload(BakeryReview.bakery)
        ).order_by(BakeryReview.created_at.desc()).all()
        
        # Serialize reviews with related information
        result = bakery_reviews_schema.dump(reviews)
        
        return jsonify({
            "bakeryReviews": result,
            "total_count": len(result)
        }), 200
    except Exception as e:
        return jsonify({
            "message": f"Error fetching bakery reviews: {str(e)}",
            "bakeryReviews": []
        }), 500

@bakery_review_bp.route('/bakery/<int:bakery_id>', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_bakery_reviews_by_bakery(bakery_id):
    """Get all reviews for a specific bakery"""
    bakery = Bakery.query.get(bakery_id)
    if not bakery:
        return jsonify({"message": "Bakery not found"}), 404
    
    reviews = review_service.get_bakery_reviews_by_bakery(bakery_id)
    return jsonify({"bakeryReviews": bakery_reviews_schema.dump(reviews)})

@bakery_review_bp.route('/user/<int:user_id>', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_bakery_reviews_by_user(user_id):
    """Get all bakery reviews by a specific user"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    reviews = review_service.get_bakery_reviews_by_user(user_id)
    return jsonify({"bakeryReviews": bakery_reviews_schema.dump(reviews)})

@bakery_review_bp.route('/create', methods=['POST'])
def create_bakery_review():
    """Create a new bakery review"""
    try:
        data = request.json
        
        # Validate required fields (userId is optional for anonymous reviews)
        required_fields = ['review', 'overallRating', 'serviceRating', 'priceRating', 
                          'atmosphereRating', 'locationRating', 'bakeryId']
        
        for field in required_fields:
            if field not in data:
                return jsonify({"message": f"Missing required field: {field}"}), 400
        
        # Validate bakery exists
        bakery = Bakery.query.get(data['bakeryId'])
        if not bakery:
            return jsonify({"message": "Bakery not found"}), 404
            
        # Validate user exists only if userId is provided (support anonymous reviews)
        user = None
        if data.get('userId'):
            user = User.query.get(data['userId'])
            if not user:
                return jsonify({"message": "User not found"}), 404
        
        # Validate rating values
        rating_fields = ['overallRating', 'serviceRating', 'priceRating', 
                         'atmosphereRating', 'locationRating']
        
        for field in rating_fields:
            try:
                rating = int(data[field])
                if rating < 1 or rating > 10:
                    return jsonify({"message": f"{field} must be between 1 and 10"}), 400
            except (ValueError, TypeError):
                return jsonify({"message": f"{field} must be a number between 1 and 10"}), 400
        
        # Create review through service
        review = review_service.create_bakery_review(
            review=data['review'],
            overall_rating=int(data['overallRating']),
            service_rating=int(data['serviceRating']),
            price_rating=int(data['priceRating']),
            atmosphere_rating=int(data['atmosphereRating']),
            location_rating=int(data['locationRating']),
            user_id=int(data['userId']) if data.get('userId') else None,  # Only pass userId if it exists
            bakery_id=int(data['bakeryId'])
        )
        
        # Invalidate cache
        cache.delete('view/get_bakery_reviews')
        cache.delete(f'view/get_bakery_reviews_by_bakery_{data["bakeryId"]}')
        if data.get('userId'):
            cache.delete(f'view/get_bakery_reviews_by_user_{data["userId"]}')
        
        return jsonify({"message": "Bakery review created!", "review": bakery_review_schema.dump(review)}), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 400


@bakery_review_bp.route('/update/<int:review_id>', methods=['PATCH'])
def update_bakery_review(review_id):
    """Update a bakery review"""
    try:
        review = BakeryReview.query.get(review_id)
        if not review:
            return jsonify({"message": "Bakery review not found"}), 404
        
        data = request.json
        
        # Process update data
        review_text = data.get('review', review.review)
        overall_rating = data.get('overallRating', review.overall_rating)
        service_rating = data.get('serviceRating', review.service_rating)
        price_rating = data.get('priceRating', review.price_rating)
        atmosphere_rating = data.get('atmosphereRating', review.atmosphere_rating)
        location_rating = data.get('locationRating', review.location_rating)
        user_id = data.get('userId', review.user_id)
        bakery_id = data.get('bakeryId', review.bakery_id)
        
        # Validate bakery exists if being updated
        if bakery_id != review.bakery_id:
            bakery = Bakery.query.get(bakery_id)
            if not bakery:
                return jsonify({"message": "Bakery not found"}), 404
        
        # Validate user exists if being updated and not null
        if user_id != review.user_id and user_id is not None:
            user = User.query.get(user_id)
            if not user:
                return jsonify({"message": "User not found"}), 404
        
        # Validate rating values
        rating_fields = {
            'overallRating': overall_rating,
            'serviceRating': service_rating,
            'priceRating': price_rating,
            'atmosphereRating': atmosphere_rating,
            'locationRating': location_rating
        }
        
        for field, value in rating_fields.items():
            try:
                rating = int(value)
                if rating < 1 or rating > 10:
                    return jsonify({"message": f"{field} must be between 1 and 10"}), 400
            except (ValueError, TypeError):
                return jsonify({"message": f"{field} must be a number between 1 and 10"}), 400
        
        # Update review through service
        updated_review = review_service.update_bakery_review(
            review_id=review_id,
            review=review_text,
            overall_rating=int(overall_rating),
            service_rating=int(service_rating),
            price_rating=int(price_rating),
            atmosphere_rating=int(atmosphere_rating),
            location_rating=int(location_rating),
            user_id=int(user_id) if user_id else None,
            bakery_id=int(bakery_id)
        )
        
        # Invalidate cache
        cache.delete('view/get_bakery_reviews')
        cache.delete(f'view/get_bakery_reviews_by_bakery_{review.bakery_id}')
        if bakery_id != review.bakery_id:
            cache.delete(f'view/get_bakery_reviews_by_bakery_{bakery_id}')
        if review.user_id:
            cache.delete(f'view/get_bakery_reviews_by_user_{review.user_id}')
        if user_id and user_id != review.user_id:
            cache.delete(f'view/get_bakery_reviews_by_user_{user_id}')
        
        return jsonify({"message": "Bakery review updated.", "review": bakery_review_schema.dump(updated_review)}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@bakery_review_bp.route('/delete/<int:review_id>', methods=['DELETE'])
def delete_bakery_review(review_id):
    """Delete a bakery review"""
    try:
        review = BakeryReview.query.get(review_id)
        if not review:
            return jsonify({"message": "Bakery review not found"}), 404
        
        bakery_id = review.bakery_id
        user_id = review.user_id
        
        # Delete review
        review_service.delete_bakery_review(review_id)
        
        # Invalidate cache
        cache.delete('view/get_bakery_reviews')
        cache.delete(f'view/get_bakery_reviews_by_bakery_{bakery_id}')
        if user_id:
            cache.delete(f'view/get_bakery_reviews_by_user_{user_id}')
        
        return jsonify({"message": "Bakery review deleted!"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

# === Product Review Routes ===

@product_review_bp.route('/', methods=['GET'])
def get_product_reviews():
    """Get all product reviews with related user and product information"""
    try:
        # Use joined load to efficiently fetch related data
        reviews = ProductReview.query.options(
            joinedload(ProductReview.user),
            joinedload(ProductReview.product)
        ).order_by(ProductReview.created_at.desc()).all()
        
        # Serialize reviews with related information
        result = product_reviews_schema.dump(reviews)
        
        return jsonify({
            "productReviews": result,
            "total_count": len(result)
        }), 200
    except Exception as e:
        return jsonify({
            "message": f"Error fetching product reviews: {str(e)}",
            "productReviews": []
        }), 500

@product_review_bp.route('/product/<int:product_id>', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_product_reviews_by_product(product_id):
    """Get all reviews for a specific product"""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"message": "Product not found"}), 404
    
    reviews = review_service.get_product_reviews_by_product(product_id)
    return jsonify({"productReviews": product_reviews_schema.dump(reviews)})

@product_review_bp.route('/user/<int:user_id>', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_product_reviews_by_user(user_id):
    """Get all product reviews by a specific user"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    reviews = review_service.get_product_reviews_by_user(user_id)
    return jsonify({"productReviews": product_reviews_schema.dump(reviews)})

@product_review_bp.route('/create', methods=['POST'])
def create_product_review():
    """Create a new product review"""
    try:
        data = request.json
        
        # Validate required fields (userId is optional for anonymous reviews)
        required_fields = ['review', 'overallRating', 'tasteRating', 'priceRating', 
                          'presentationRating', 'productId']
        
        for field in required_fields:
            if field not in data:
                return jsonify({"message": f"Missing required field: {field}"}), 400
        
        # Validate product exists
        product = Product.query.get(data['productId'])
        if not product:
            return jsonify({"message": "Product not found"}), 404
            
        # Validate user exists only if userId is provided (support anonymous reviews)
        user = None
        if data.get('userId'):
            user = User.query.get(data['userId'])
            if not user:
                return jsonify({"message": "User not found"}), 404
        
        # Validate rating values
        rating_fields = ['overallRating', 'tasteRating', 'priceRating', 'presentationRating']
        
        for field in rating_fields:
            try:
                rating = int(data[field])
                if rating < 1 or rating > 10:
                    return jsonify({"message": f"{field} must be between 1 and 10"}), 400
            except (ValueError, TypeError):
                return jsonify({"message": f"{field} must be a number between 1 and 10"}), 400
        
        # Create review through service
        review = review_service.create_product_review(
            review=data['review'],
            overall_rating=int(data['overallRating']),
            taste_rating=int(data['tasteRating']),
            price_rating=int(data['priceRating']),
            presentation_rating=int(data['presentationRating']),
            user_id=int(data['userId']) if data.get('userId') else None,  # Only pass userId if it exists
            product_id=int(data['productId'])
        )
        
        # Invalidate cache
        cache.delete('view/get_product_reviews')
        cache.delete(f'view/get_product_reviews_by_product_{data["productId"]}')
        if data.get('userId'):
            cache.delete(f'view/get_product_reviews_by_user_{data["userId"]}')
        
        return jsonify({"message": "Product review created!", "review": product_review_schema.dump(review)}), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 400


@product_review_bp.route('/update/<int:review_id>', methods=['PATCH', 'OPTIONS'])
def update_product_review(review_id):
    # Handle OPTIONS preflight request
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        review = ProductReview.query.get(review_id)
        if not review:
            return jsonify({"message": "Product review not found"}), 404
        
        data = request.get_json()
        
        # Update review fields
        review.review = data.get('review', review.review)
        review.overall_rating = data.get('overallRating', review.overall_rating)
        review.taste_rating = data.get('tasteRating', review.taste_rating)
        review.price_rating = data.get('priceRating', review.price_rating)
        review.presentation_rating = data.get('presentationRating', review.presentation_rating)
        
        db.session.commit()
        
        return jsonify({
            "message": "Product review updated successfully",
            "review": product_review_schema.dump(review)
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error updating review: {str(e)}"}), 400
    
@product_review_bp.route('/delete/<int:review_id>', methods=['DELETE'])
def delete_product_review(review_id):
    """Delete a product review"""
    try:
        review = ProductReview.query.get(review_id)
        if not review:
            return jsonify({"message": "Product review not found"}), 404
        
        product_id = review.product_id
        user_id = review.user_id
        
        # Delete review
        review_service.delete_product_review(review_id)
        
        # Invalidate cache
        cache.delete('view/get_product_reviews')
        cache.delete(f'view/get_product_reviews_by_product_{product_id}')
        if user_id:
            cache.delete(f'view/get_product_reviews_by_user_{user_id}')
        
        return jsonify({"message": "Product review deleted!"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400