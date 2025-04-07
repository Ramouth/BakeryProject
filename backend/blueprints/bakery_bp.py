from flask import Blueprint, request, jsonify, current_app as app
from models import db, Bakery
from schemas import BakerySchema
from services.bakery_service import BakeryService
from utils.caching import cache
from utils.caching import cache_key_with_query
import logging


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
            
        # Log received data
        app.logger.info(f"Received bakery creation data: {data}")
            
        # Validate with schema
        errors = bakery_schema.validate(data)
        if errors:
            app.logger.error(f"Schema validation errors: {errors}")
            return jsonify({"message": "Validation error", "errors": errors}), 400
            
        # Extract required fields
        name = data.get('name')
        zip_code = data.get('zipCode')
        
        # Log extracted fields
        app.logger.info(f"Extracted fields - name: {name}, zipCode: {zip_code}")
        
        if not name or not zip_code:
            missing = []
            if not name: missing.append("name")
            if not zip_code: missing.append("zipCode")
            app.logger.error(f"Missing required fields: {missing}")
            return jsonify({"message": f"Name and zip code are required"}), 400
        
        # Extract optional fields
        street_name = data.get('streetName')
        street_number = data.get('streetNumber')
        image_url = data.get('imageUrl')
        website_url = data.get('websiteUrl')
        
        # Create bakery
        new_bakery = bakery_service.create_bakery(
            name=name, 
            zip_code=zip_code,
            street_name=street_name,
            street_number=street_number,
            image_url=image_url,
            website_url=website_url
        )
        
        # Invalidate cache
        cache.delete_memoized(get_bakeries)
        
        return jsonify({
            "message": "Bakery created successfully!",
            "bakery": bakery_schema.dump(new_bakery)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error creating bakery: {str(e)}")
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
        street_name = data.get('streetName', bakery.street_name)
        street_number = data.get('streetNumber', bakery.street_number)
        image_url = data.get('imageUrl', bakery.image_url)
        website_url = data.get('websiteUrl', bakery.website_url)
        
        if not name or not zip_code:
            return jsonify({"message": "Name and zip code cannot be empty"}), 400
        
        # Update bakery
        updated_bakery = bakery_service.update_bakery(
            bakery_id=bakery_id,
            name=name,
            zip_code=zip_code,
            street_name=street_name,
            street_number=street_number,
            image_url=image_url,
            website_url=website_url
        )
        
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
@cache.cached(timeout=30, key_prefix=cache_key_with_query)  # Use query parameters in cache key
def search_bakeries():
    """Search bakeries by name"""
    search_term = request.args.get('q', '')
    
    if not search_term or len(search_term) < 2:
        return jsonify({"message": "Search term must be at least 2 characters long", "bakeries": []}), 400
        
    try:
        # Use the bakery service to search by name
        bakeries = bakery_service.search_bakeries(search_term)
        return jsonify({"bakeries": bakeries_schema.dump(bakeries)}), 200
    except Exception as e:
        app.logger.error(f"Error searching bakeries: {str(e)}")
        return jsonify({"message": f"Error searching bakeries: {str(e)}", "bakeries": []}), 500


@bakery_bp.route('/<int:bakery_id>/stats', methods=['GET'])
@cache.cached(timeout=60)
def get_bakery_stats(bakery_id):
    """Get statistics for a bakery including review averages"""
    try:
        stats = bakery_service.get_bakery_stats(bakery_id)
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 404

@bakery_bp.route('/<int:bakery_id>/products', methods=['GET'])
@cache.cached(timeout=60)
def get_bakery_products(bakery_id):
    """Get all products for a specific bakery"""
    from services.product_service import ProductService
    from schemas import ProductSchema
    
    product_service = ProductService()
    products_schema = ProductSchema(many=True)
    
    bakery = bakery_service.get_bakery_by_id(bakery_id)
    if not bakery:
        return jsonify({"message": "Bakery not found"}), 404
        
    products = product_service.get_products_by_bakery(bakery_id)
    return jsonify({"products": products_schema.dump(products)})