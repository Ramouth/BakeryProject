# backend/blueprints/bakery_bp.py

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
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_bakery(bakery_id):
    """Get a specific bakery by ID"""
    bakery = bakery_service.get_bakery_by_id(bakery_id)
    if not bakery:
        return jsonify({"message": "Bakery not found"}), 404
    return jsonify(bakery_schema.dump(bakery))

@bakery_bp.route('/create', methods=['POST'])
def create_bakery():
    """Create a new bakery"""
    try:
        name = request.json.get('name')
        zip_code = request.json.get('zipCode')
        
        if not name or not zip_code:
            return jsonify({"message": "Name and zip code are required"}), 400
        
        # Validate input data against schema
        errors = bakery_schema.validate(request.json)
        if errors:
            return jsonify({"message": "Validation error", "errors": errors}), 400
        
        new_bakery = bakery_service.create_bakery(name, zip_code)
        
        # Invalidate cache
        cache.delete('view/get_bakeries')
        
        return jsonify({"message": "Bakery created!", "bakery": bakery_schema.dump(new_bakery)}), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@bakery_bp.route('/update/<int:bakery_id>', methods=['PATCH'])
def update_bakery(bakery_id):
    """Update a bakery"""
    try:
        bakery = bakery_service.get_bakery_by_id(bakery_id)
        if not bakery:
            return jsonify({"message": "Bakery not found"}), 404
        
        data = request.json
        name = data.get('name', bakery.name)
        zip_code = data.get('zipCode', bakery.zip_code)
        
        # Validate input data
        if not name or not zip_code:
            return jsonify({"message": "Name and zip code cannot be empty"}), 400
        
        updated_bakery = bakery_service.update_bakery(bakery_id, name, zip_code)
        
        # Invalidate cache
        cache.delete('view/get_bakeries')
        cache.delete(f'view/get_bakery_{bakery_id}')
        
        return jsonify({"message": "Bakery updated.", "bakery": bakery_schema.dump(updated_bakery)}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@bakery_bp.route('/delete/<int:bakery_id>', methods=['DELETE'])
def delete_bakery(bakery_id):
    """Delete a bakery"""
    try:
        bakery = bakery_service.get_bakery_by_id(bakery_id)
        if not bakery:
            return jsonify({"message": "Bakery not found"}), 404
        
        bakery_service.delete_bakery(bakery_id)
        
        # Invalidate cache
        cache.delete('view/get_bakeries')
        cache.delete(f'view/get_bakery_{bakery_id}')
        
        return jsonify({"message": "Bakery deleted!"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400