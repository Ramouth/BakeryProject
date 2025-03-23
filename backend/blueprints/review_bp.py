from flask import Blueprint, request, jsonify
from models import db, BakeryReview, PastryReview, Bakery, Pastry, Contact
from schemas import BakeryReviewSchema, PastryReviewSchema
from services.review_service import ReviewService
from utils.caching import cache

# Create blueprints
bakery_review_bp = Blueprint('bakeryreview', __name__)
pastry_review_bp = Blueprint('pastryreview', __name__)

# Initialize schemas
bakery_review_schema = BakeryReviewSchema()
bakery_reviews_schema = BakeryReviewSchema(many=True)
pastry_review_schema = PastryReviewSchema()
pastry_reviews_schema = PastryReviewSchema(many=True)

# Initialize service
review_service = ReviewService()

# === Bakery Review Routes ===

@bakery_review_bp.route('/', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_bakery_reviews():
    """Get all bakery reviews"""
    reviews = review_service.get_all_bakery_reviews()
    return jsonify({"bakeryreviews": bakery_reviews_schema.dump(reviews)})

@bakery_review_bp.route('/bakery/<int:bakery_id>', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_bakery_reviews_by_bakery(bakery_id):
    """Get all reviews for a specific bakery"""
    bakery = Bakery.query.get(bakery_id)
    if not bakery:
        return jsonify({"message": "Bakery not found"}), 404
    
    reviews = review_service.get_bakery_reviews_by_bakery(bakery_id)
    return jsonify({"bakeryreviews": bakery_reviews_schema.dump(reviews)})

@bakery_review_bp.route('/create', methods=['POST'])
def create_bakery_review():
    """Create a new bakery review"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['review', 'overallRating', 'serviceRating', 'priceRating', 
                          'atmosphereRating', 'locationRating', 'contactId', 'bakeryId']
        
        for field in required_fields:
            if field not in data:
                return jsonify({"message": f"Missing required field: {field}"}), 400
        
        # Validate bakery exists
        bakery = Bakery.query.get(data['bakeryId'])
        if not bakery:
            return jsonify({"message": "Bakery not found"}), 404
            
        # Validate contact exists
        contact = Contact.query.get(data['contactId'])
        if not contact:
            return jsonify({"message": "Contact not found"}), 404
        
        # Validate rating values
        rating_fields = ['overallRating', 'serviceRating', 'priceRating', 
                         'atmosphereRating', 'locationRating']
        
        for field in rating_fields:
            try:
                rating = int(data[field])
                if rating < 1 or rating > 5:
                    return jsonify({"message": f"{field} must be between 1 and 5"}), 400
            except (ValueError, TypeError):
                return jsonify({"message": f"{field} must be a number between 1 and 5"}), 400
        
        # Create review through service
        review = review_service.create_bakery_review(
            data['review'],
            int(data['overallRating']),
            int(data['serviceRating']),
            int(data['priceRating']),
            int(data['atmosphereRating']),
            int(data['locationRating']),
            int(data['contactId']),
            int(data['bakeryId'])
        )
        
        # Invalidate cache
        cache.delete('view/get_bakery_reviews')
        cache.delete(f'view/get_bakery_reviews_by_bakery_{data["bakeryId"]}')
        
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
        contact_id = data.get('contactId', review.contact_id)
        bakery_id = data.get('bakeryId', review.bakery_id)
        
        # Validate bakery exists if being updated
        if bakery_id != review.bakery_id:
            bakery = Bakery.query.get(bakery_id)
            if not bakery:
                return jsonify({"message": "Bakery not found"}), 404
        
        # Validate contact exists if being updated
        if contact_id != review.contact_id:
            contact = Contact.query.get(contact_id)
            if not contact:
                return jsonify({"message": "Contact not found"}), 404
        
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
                if rating < 1 or rating > 5:
                    return jsonify({"message": f"{field} must be between 1 and 5"}), 400
            except (ValueError, TypeError):
                return jsonify({"message": f"{field} must be a number between 1 and 5"}), 400
        
        # Update review through service
        updated_review = review_service.update_bakery_review(
            review_id,
            review_text,
            int(overall_rating),
            int(service_rating),
            int(price_rating),
            int(atmosphere_rating),
            int(location_rating),
            int(contact_id),
            int(bakery_id)
        )
        
        # Invalidate cache
        cache.delete('view/get_bakery_reviews')
        cache.delete(f'view/get_bakery_reviews_by_bakery_{review.bakery_id}')
        if bakery_id != review.bakery_id:
            cache.delete(f'view/get_bakery_reviews_by_bakery_{bakery_id}')
        
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
        review_service.delete_bakery_review(review_id)
        
        # Invalidate cache
        cache.delete('view/get_bakery_reviews')
        cache.delete(f'view/get_bakery_reviews_by_bakery_{bakery_id}')
        
        return jsonify({"message": "Bakery review deleted!"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

# === Pastry Review Routes ===

@pastry_review_bp.route('/', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_pastry_reviews():
    """Get all pastry reviews"""
    reviews = review_service.get_all_pastry_reviews()
    return jsonify({"pastryreviews": pastry_reviews_schema.dump(reviews)})

@pastry_review_bp.route('/pastry/<int:pastry_id>', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_pastry_reviews_by_pastry(pastry_id):
    """Get all reviews for a specific pastry"""
    pastry = Pastry.query.get(pastry_id)
    if not pastry:
        return jsonify({"message": "Pastry not found"}), 404
    
    reviews = review_service.get_pastry_reviews_by_pastry(pastry_id)
    return jsonify({"pastryreviews": pastry_reviews_schema.dump(reviews)})

@pastry_review_bp.route('/create', methods=['POST'])
def create_pastry_review():
    """Create a new pastry review"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['review', 'overallRating', 'tasteRating', 'priceRating', 
                          'presentationRating', 'contactId', 'pastryId']
        
        for field in required_fields:
            if field not in data:
                return jsonify({"message": f"Missing required field: {field}"}), 400
        
        # Validate pastry exists
        pastry = Pastry.query.get(data['pastryId'])
        if not pastry:
            return jsonify({"message": "Pastry not found"}), 404
            
        # Validate contact exists
        contact = Contact.query.get(data['contactId'])
        if not contact:
            return jsonify({"message": "Contact not found"}), 404
        
        # Validate rating values
        rating_fields = ['overallRating', 'tasteRating', 'priceRating', 'presentationRating']
        
        for field in rating_fields:
            try:
                rating = int(data[field])
                if rating < 1 or rating > 5:
                    return jsonify({"message": f"{field} must be between 1 and 5"}), 400
            except (ValueError, TypeError):
                return jsonify({"message": f"{field} must be a number between 1 and 5"}), 400
        
        # Create review through service
        review = review_service.create_pastry_review(
            data['review'],
            int(data['overallRating']),
            int(data['tasteRating']),
            int(data['priceRating']),
            int(data['presentationRating']),
            int(data['contactId']),
            int(data['pastryId'])
        )
        
        # Invalidate cache
        cache.delete('view/get_pastry_reviews')
        cache.delete(f'view/get_pastry_reviews_by_pastry_{data["pastryId"]}')
        
        return jsonify({"message": "Pastry review created!", "review": pastry_review_schema.dump(review)}), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@pastry_review_bp.route('/update/<int:review_id>', methods=['PATCH'])
def update_pastry_review(review_id):
    """Update a pastry review"""
    try:
        review = PastryReview.query.get(review_id)
        if not review:
            return jsonify({"message": "Pastry review not found"}), 404
        
        data = request.json
        
        # Process update data
        review_text = data.get('review', review.review)
        overall_rating = data.get('overallRating', review.overall_rating)
        taste_rating = data.get('tasteRating', review.taste_rating)
        price_rating = data.get('priceRating', review.price_rating)
        presentation_rating = data.get('presentationRating', review.presentation_rating)
        contact_id = data.get('contactId', review.contact_id)
        pastry_id = data.get('pastryId', review.pastry_id)
        
        # Validate pastry exists if being updated
        if pastry_id != review.pastry_id:
            pastry = Pastry.query.get(pastry_id)
            if not pastry:
                return jsonify({"message": "Pastry not found"}), 404
        
        # Validate contact exists if being updated
        if contact_id != review.contact_id:
            contact = Contact.query.get(contact_id)
            if not contact:
                return jsonify({"message": "Contact not found"}), 404
        
        # Validate rating values
        rating_fields = {
            'overallRating': overall_rating,
            'tasteRating': taste_rating,
            'priceRating': price_rating,
            'presentationRating': presentation_rating
        }
        
        for field, value in rating_fields.items():
            try:
                rating = int(value)
                if rating < 1 or rating > 5:
                    return jsonify({"message": f"{field} must be between 1 and 5"}), 400
            except (ValueError, TypeError):
                return jsonify({"message": f"{field} must be a number between 1 and 5"}), 400
        
        # Update review through service
        updated_review = review_service.update_pastry_review(
            review_id,
            review_text,
            int(overall_rating),
            int(taste_rating),
            int(price_rating),
            int(presentation_rating),
            int(contact_id),
            int(pastry_id)
        )
        
        # Invalidate cache
        cache.delete('view/get_pastry_reviews')
        cache.delete(f'view/get_pastry_reviews_by_pastry_{review.pastry_id}')
        if pastry_id != review.pastry_id:
            cache.delete(f'view/get_pastry_reviews_by_pastry_{pastry_id}')
        
        return jsonify({"message": "Pastry review updated.", "review": pastry_review_schema.dump(updated_review)}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@pastry_review_bp.route('/delete/<int:review_id>', methods=['DELETE'])
def delete_pastry_review(review_id):
    """Delete a pastry review"""
    try:
        review = PastryReview.query.get(review_id)
        if not review:
            return jsonify({"message": "Pastry review not found"}), 404
        
        pastry_id = review.pastry_id
        review_service.delete_pastry_review(review_id)
        
        # Invalidate cache
        cache.delete('view/get_pastry_reviews')
        cache.delete(f'view/get_pastry_reviews_by_pastry_{pastry_id}')
        
        return jsonify({"message": "Pastry review deleted!"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400