from flask import Blueprint, request, jsonify
from models import db, Pastry, Bakery
from schemas import PastrySchema
from services.pastry_service import PastryService
from utils.caching import cache

# Create blueprint
pastry_bp = Blueprint('pastry', __name__)

# Initialize schemas
pastry_schema = PastrySchema()
pastries_schema = PastrySchema(many=True)

# Initialize service
pastry_service = PastryService()

@pastry_bp.route('/', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_pastries():
    """Get all pastries with their bakery details"""
    pastries = pastry_service.get_all_pastries()
    return jsonify({"pastries": pastries_schema.dump(pastries)})

@pastry_bp.route('/<int:pastry_id>', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_pastry(pastry_id):
    """Get a specific pastry by ID"""
    pastry = pastry_service.get_pastry_by_id(pastry_id)
    if not pastry:
        return jsonify({"message": "Pastry not found"}), 404
    return jsonify(pastry_schema.dump(pastry))

@pastry_bp.route('/bakery/<int:bakery_id>', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_pastries_by_bakery(bakery_id):
    """Get all pastries for a specific bakery"""
    pastries = pastry_service.get_pastries_by_bakery(bakery_id)
    return jsonify({"pastries": pastries_schema.dump(pastries)})

@pastry_bp.route('/create', methods=['POST'])
def create_pastry():
    """Create a new pastry"""
    try:
        name = request.json.get('name')
        bakery_id = request.json.get('bakeryId')
        
        if not name or not bakery_id:
            return jsonify({"message": "Name and bakeryId are required"}), 400
        
        # Validate bakery exists
        bakery = Bakery.query.get(bakery_id)
        if not bakery:
            return jsonify({"message": "Bakery not found"}), 404
        
        # Validate input data against schema
        errors = pastry_schema.validate(request.json)
        if errors:
            return jsonify({"message": "Validation error", "errors": errors}), 400
        
        new_pastry = pastry_service.create_pastry(name, bakery_id)
        
        # Invalidate cache
        cache.delete('view/get_pastries')
        cache.delete(f'view/get_pastries_by_bakery_{bakery_id}')
        
        return jsonify({"message": "Pastry created!", "pastry": pastry_schema.dump(new_pastry)}), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@pastry_bp.route('/update/<int:pastry_id>', methods=['PATCH'])
def update_pastry(pastry_id):
    """Update a pastry"""
    try:
        pastry = pastry_service.get_pastry_by_id(pastry_id)
        if not pastry:
            return jsonify({"message": "Pastry not found"}), 404
        
        data = request.json
        name = data.get('name', pastry.name)
        bakery_id = data.get('bakeryId', pastry.bakery_id)
        
        # Validate bakery exists if it's being updated
        if bakery_id != pastry.bakery_id:
            bakery = Bakery.query.get(bakery_id)
            if not bakery:
                return jsonify({"message": "Bakery not found"}), 404
        
        # Validate input data
        if not name:
            return jsonify({"message": "Name cannot be empty"}), 400
        
        updated_pastry = pastry_service.update_pastry(pastry_id, name, bakery_id)
        
        # Invalidate cache
        cache.delete('view/get_pastries')
        cache.delete(f'view/get_pastry_{pastry_id}')
        cache.delete(f'view/get_pastries_by_bakery_{pastry.bakery_id}')
        if bakery_id != pastry.bakery_id:
            cache.delete(f'view/get_pastries_by_bakery_{bakery_id}')
        
        return jsonify({"message": "Pastry updated.", "pastry": pastry_schema.dump(updated_pastry)}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@pastry_bp.route('/delete/<int:pastry_id>', methods=['DELETE'])
def delete_pastry(pastry_id):
    """Delete a pastry"""
    try:
        pastry = pastry_service.get_pastry_by_id(pastry_id)
        if not pastry:
            return jsonify({"message": "Pastry not found"}), 404
        
        bakery_id = pastry.bakery_id
        pastry_service.delete_pastry(pastry_id)
        
        # Invalidate cache
        cache.delete('view/get_pastries')
        cache.delete(f'view/get_pastry_{pastry_id}')
        cache.delete(f'view/get_pastries_by_bakery_{bakery_id}')
        
        return jsonify({"message": "Pastry deleted!"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400