from flask import Blueprint, request, jsonify
from backend.extensions import db
from backend.models import BakeryReview, ProductReview, Bakery, Product, User  # Adjusted model import path
from backend.schemas import BakeryReviewSchema, ProductReviewSchema  # Adjusted schema import path
from backend.services.review_service import ReviewService  # Adjusted service import path
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
        reviews = BakeryReview.query.all()

        for review in reviews:
            if review.user_id == '':
                review.user_id = None

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
def get_bakery_reviews_by_bakery(bakery_id):
    """Get all reviews for a specific bakery"""
    bakery = Bakery.query.get(bakery_id)
    if not bakery:
        return jsonify({"message": "Bakery not found"}), 404
    
    reviews = review_service.get_bakery_reviews_by_bakery(bakery_id)
    return jsonify({"bakeryReviews": bakery_reviews_schema.dump(reviews)})

@bakery_review_bp.route('/user/<int:user_id>', methods=['GET'])
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
        
        # Validate required fields only (userId is optional for anonymous reviews)
        required_fields = ['review', 'overallRating', 'bakeryId']
        
        for field in required_fields:
            if field not in data:
                return jsonify({"message": f"Missing required field: {field}"}), 400
        
        # Validate bakery exists
        bakery = Bakery.query.get(data['bakeryId'])
        if not bakery:
            return jsonify({"message": "Bakery not found"}), 404
            
        # Validate user exists only if userId is provided (support anonymous reviews)
        if data.get('userId'):
            user = User.query.get(data['userId'])
            if not user:
                return jsonify({"message": "User not found"}), 404
        
        # Validate required overall rating
        try:
            overall_rating = int(data['overallRating'])
            if overall_rating < 1 or overall_rating > 10:
                return jsonify({"message": "overallRating must be between 1 and 10"}), 400
        except (ValueError, TypeError):
            return jsonify({"message": "overallRating must be a number between 1 and 10"}), 400
        
        # Process optional rating fields - initialize as None
        service_rating = None
        price_rating = None
        atmosphere_rating = None
        location_rating = None
        
        # Only validate optional ratings if they're provided and not null
        if 'serviceRating' in data and data['serviceRating'] is not None:
            try:
                service_rating = int(data['serviceRating'])
                if service_rating < 1 or service_rating > 10:
                    return jsonify({"message": "serviceRating must be between 1 and 10"}), 400
            except (ValueError, TypeError):
                return jsonify({"message": "serviceRating must be a number between 1 and 10"}), 400
        
        if 'priceRating' in data and data['priceRating'] is not None:
            try:
                price_rating = int(data['priceRating'])
                if price_rating < 1 or price_rating > 10:
                    return jsonify({"message": "priceRating must be between 1 and 10"}), 400
            except (ValueError, TypeError):
                return jsonify({"message": "priceRating must be a number between 1 and 10"}), 400
        
        if 'atmosphereRating' in data and data['atmosphereRating'] is not None:
            try:
                atmosphere_rating = int(data['atmosphereRating'])
                if atmosphere_rating < 1 or atmosphere_rating > 10:
                    return jsonify({"message": "atmosphereRating must be between 1 and 10"}), 400
            except (ValueError, TypeError):
                return jsonify({"message": "atmosphereRating must be a number between 1 and 10"}), 400
        
        if 'locationRating' in data and data['locationRating'] is not None:
            try:
                location_rating = int(data['locationRating'])
                if location_rating < 1 or location_rating > 10:
                    return jsonify({"message": "locationRating must be between 1 and 10"}), 400
            except (ValueError, TypeError):
                return jsonify({"message": "locationRating must be a number between 1 and 10"}), 400
        
        # Create review with properly handled optional fields
        review = review_service.create_bakery_review(
            review=data['review'],
            overall_rating=overall_rating,
            service_rating=service_rating,
            price_rating=price_rating,
            atmosphere_rating=atmosphere_rating,
            location_rating=location_rating,
            user_id=int(data['userId']) if data.get('userId') else None,
            bakery_id=int(data['bakeryId'])
        )
        
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
            if value is not None:
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
            overall_rating=int(overall_rating) if overall_rating is not None else None,
            service_rating=int(service_rating) if service_rating is not None else None,
            price_rating=int(price_rating) if price_rating is not None else None,
            atmosphere_rating=int(atmosphere_rating) if atmosphere_rating is not None else None,
            location_rating=int(location_rating) if location_rating is not None else None,
            user_id=int(user_id) if user_id else None,
            bakery_id=int(bakery_id)
        )
        
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
        
        # Delete review
        review_service.delete_bakery_review(review_id)
        
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
def get_product_reviews_by_product(product_id):
    """Get all reviews for a specific product"""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"message": "Product not found"}), 404
    
    reviews = review_service.get_product_reviews_by_product(product_id)
    return jsonify({"productReviews": product_reviews_schema.dump(reviews)})

@product_review_bp.route('/user/<int:user_id>', methods=['GET'])
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
        required_fields = ['review', 'overallRating', 'productId']
        
        for field in required_fields:
            if field not in data:
                return jsonify({"message": f"Missing required field: {field}"}), 400
        
        # Validate product exists
        product = Product.query.get(data['productId'])
        if not product:
            return jsonify({"message": "Product not found"}), 404
            
        # Validate user exists only if userId is provided (support anonymous reviews)
        if data.get('userId'):
            user = User.query.get(data['userId'])
            if not user:
                return jsonify({"message": "User not found"}), 404
        
        # Validate required overall rating
        try:
            overall_rating = int(data['overallRating'])
            if overall_rating < 1 or overall_rating > 10:
                return jsonify({"message": "overallRating must be between 1 and 10"}), 400
        except (ValueError, TypeError):
            return jsonify({"message": "overallRating must be a number between 1 and 10"}), 400
        
        # Process optional rating fields - initialize as None
        taste_rating = None
        price_rating = None
        presentation_rating = None
        
        # Only validate optional ratings if they're provided and not null
        if 'tasteRating' in data and data['tasteRating'] is not None:
            try:
                taste_rating = int(data['tasteRating'])
                if taste_rating < 1 or taste_rating > 10:
                    return jsonify({"message": "tasteRating must be between 1 and 10"}), 400
            except (ValueError, TypeError):
                return jsonify({"message": "tasteRating must be a number between 1 and 10"}), 400
        
        if 'priceRating' in data and data['priceRating'] is not None:
            try:
                price_rating = int(data['priceRating'])
                if price_rating < 1 or price_rating > 10:
                    return jsonify({"message": "priceRating must be between 1 and 10"}), 400
            except (ValueError, TypeError):
                return jsonify({"message": "priceRating must be a number between 1 and 10"}), 400
        
        if 'presentationRating' in data and data['presentationRating'] is not None:
            try:
                presentation_rating = int(data['presentationRating'])
                if presentation_rating < 1 or presentation_rating > 10:
                    return jsonify({"message": "presentationRating must be between 1 and 10"}), 400
            except (ValueError, TypeError):
                return jsonify({"message": "presentationRating must be a number between 1 and 10"}), 400
        
        # Create review with properly handled optional fields
        review = review_service.create_product_review(
            review=data['review'],
            overall_rating=overall_rating,
            taste_rating=taste_rating,
            price_rating=price_rating,
            presentation_rating=presentation_rating,
            user_id=int(data['userId']) if data.get('userId') else None,
            product_id=int(data['productId'])
        )
        
        return jsonify({"message": "Product review created!", "review": product_review_schema.dump(review)}), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 400


@product_review_bp.route('/update/<int:review_id>', methods=['PATCH'])
def update_product_review(review_id):
    """Update a product review"""
    try:
        review = ProductReview.query.get(review_id)
        if not review:
            return jsonify({"message": "Product review not found"}), 404
        
        data = request.json
        
        # Update review fields
        review_text = data.get('review', review.review)
        overall_rating = data.get('overallRating', review.overall_rating)
        taste_rating = data.get('tasteRating', review.taste_rating)
        price_rating = data.get('priceRating', review.price_rating)
        presentation_rating = data.get('presentationRating', review.presentation_rating)
        user_id = data.get('userId', review.user_id)
        product_id = data.get('productId', review.product_id)
        
        # Validate product exists if being updated
        if product_id != review.product_id:
            product = Product.query.get(product_id)
            if not product:
                return jsonify({"message": "Product not found"}), 404
        
        # Validate user exists if being updated and not null
        if user_id != review.user_id and user_id is not None:
            user = User.query.get(user_id)
            if not user:
                return jsonify({"message": "User not found"}), 404
        
        # Validate rating values
        rating_fields = {
            'overallRating': overall_rating,
            'tasteRating': taste_rating,
            'priceRating': price_rating,
            'presentationRating': presentation_rating
        }
        
        for field, value in rating_fields.items():
            if value is not None:
                try:
                    rating = int(value)
                    if rating < 1 or rating > 10:
                        return jsonify({"message": f"{field} must be between 1 and 10"}), 400
                except (ValueError, TypeError):
                    return jsonify({"message": f"{field} must be a number between 1 and 10"}), 400
        
        # Update review through service
        updated_review = review_service.update_product_review(
            review_id=review_id,
            review=review_text,
            overall_rating=int(overall_rating) if overall_rating is not None else None,
            taste_rating=int(taste_rating) if taste_rating is not None else None,
            price_rating=int(price_rating) if price_rating is not None else None,
            presentation_rating=int(presentation_rating) if presentation_rating is not None else None,
            user_id=int(user_id) if user_id else None,
            product_id=int(product_id)
        )
        
        return jsonify({
            "message": "Product review updated successfully",
            "review": product_review_schema.dump(updated_review)
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
        
        # Delete review
        review_service.delete_product_review(review_id)
        
        return jsonify({"message": "Product review deleted!"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400