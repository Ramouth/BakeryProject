from flask import Blueprint, request, jsonify
from models import db, Bakery
from schemas import BakerySchema
from services.bakery_service import BakeryService
from utils.caching import cache

# Create blueprint
bakery_bp = Blueprint('bakery', __name__)

# Initialize schemas
bakery_schema = BakerySchema()
bakeries_schema = BakerySchema(many=True)

# Initialize service
bakery_service = BakeryService()

@bakery_bp.route('/', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_bakeries():
    """Get all bakeries"""
    bakeries = bakery_service.get_all_bakeries()
    return jsonify({"bakeries": bakeries_schema.dump(bakeries)})

@bakery_bp.route('/<int:bakery_id>', methods=['GET'])
@cache.cached(timeout=60, key_prefix='get_bakery')  # Cache with proper key
def get_bakery(bakery_id):
    """Get a specific bakery by ID"""
    bakery = bakery_service.get_bakery_by_id(bakery_id)
    if not bakery:
        return jsonify({"message": "Bakery not found"}), 404
    return jsonify(bakery_schema.dump(bakery))

@bakery_bp.route('/create', methods=['POST'])
def create_bakery():
    """Create a new bakery with improved validation"""
    try:
        # Get JSON data
        data = request.get_json()
        if not data:
            return jsonify({"message": "No input data provided"}), 400
            
        # Validate with schema
        errors = bakery_schema.validate(data)
        if errors:
            return jsonify({"message": "Validation error", "errors": errors}), 400
            
        # Create bakery
        name = data.get('name')
        zip_code = data.get('zipCode')
        
        if not name or not zip_code:
            return jsonify({"message": "Name and zip code are required"}), 400
        
        new_bakery = bakery_service.create_bakery(name, zip_code)
        
        # Invalidate cache
        cache.delete_memoized(get_bakeries)
        
        return jsonify({
            "message": "Bakery created successfully!",
            "bakery": bakery_schema.dump(new_bakery)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error creating bakery: {str(e)}"}), 400

@bakery_bp.route('/update/<int:bakery_id>', methods=['PATCH'])
def update_bakery(bakery_id):
    """Update an existing bakery with improved error handling"""
    try:
        # Check if bakery exists
        bakery = bakery_service.get_bakery_by_id(bakery_id)
        if not bakery:
            return jsonify({"message": "Bakery not found"}), 404
        
        # Get JSON data
        data = request.get_json()
        if not data:
            return jsonify({"message": "No input data provided"}), 400
        
        # Extract and validate data
        name = data.get('name', bakery.name)
        zip_code = data.get('zipCode', bakery.zip_code)
        
        if not name or not zip_code:
            return jsonify({"message": "Name and zip code cannot be empty"}), 400
        
        # Update bakery
        updated_bakery = bakery_service.update_bakery(bakery_id, name, zip_code)
        
        # Invalidate cache
        cache.delete_memoized(get_bakeries)
        cache.delete_memoized(get_bakery, bakery_id)
        
        return jsonify({
            "message": "Bakery updated successfully",
            "bakery": bakery_schema.dump(updated_bakery)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error updating bakery: {str(e)}"}), 400

@bakery_bp.route('/delete/<int:bakery_id>', methods=['DELETE'])
def delete_bakery(bakery_id):
    """Delete a bakery with improved error handling"""
    try:
        # Check if bakery exists
        bakery = bakery_service.get_bakery_by_id(bakery_id)
        if not bakery:
            return jsonify({"message": "Bakery not found"}), 404
        
        # Delete bakery
        bakery_service.delete_bakery(bakery_id)
        
        # Invalidate cache
        cache.delete_memoized(get_bakeries)
        cache.delete_memoized(get_bakery, bakery_id)
        
        return jsonify({"message": "Bakery deleted successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error deleting bakery: {str(e)}"}), 400

# New endpoints to support the app requirements

@bakery_bp.route('/search', methods=['GET'])
def search_bakeries():
    """Search bakeries by name or zip code"""
    search_term = request.args.get('q', '')
    zip_code = request.args.get('zip', '')
    
    if search_term:
        bakeries = bakery_service.search_bakeries(search_term)
    elif zip_code:
        bakeries = bakery_service.get_bakeries_by_zip(zip_code)
    else:
        return jsonify({"message": "Search term or zip code required"}), 400
        
    return jsonify({"bakeries": bakeries_schema.dump(bakeries)})

@bakery_bp.route('/<int:bakery_id>/stats', methods=['GET'])
@cache.cached(timeout=60)
def get_bakery_stats(bakery_id):
    """Get statistics for a bakery including review averages"""
    try:
        stats = bakery_service.get_bakery_stats(bakery_id)
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 404

@bakery_bp.route('/<int:bakery_id>/pastries', methods=['GET'])
@cache.cached(timeout=60)
def get_bakery_pastries(bakery_id):
    """Get all pastries for a specific bakery"""
    from services.pastry_service import PastryService
    from schemas import PastrySchema
    
    pastry_service = PastryService()
    pastries_schema = PastrySchema(many=True)
    
    bakery = bakery_service.get_bakery_by_id(bakery_id)
    if not bakery:
        return jsonify({"message": "Bakery not found"}), 404
        
    pastries = pastry_service.get_pastries_by_bakery(bakery_id)
    return jsonify({"pastries": pastries_schema.dump(pastries)})