from flask import Blueprint, request, jsonify
from backend.models import db, Pastry, Bakery
from backend.schemas import PastrySchema
from backend.services.pastry_service import PastryService
from backend.utils.caching import cache

CAN_EDIT = False  # Set this to False to disable editing and deleting

# Create blueprint
pastry_bp = Blueprint('pastry', __name__)

# Initialize schemas
pastry_schema = PastrySchema()
pastries_schema = PastrySchema(many=True)

# Initialize service
pastry_service = PastryService()

@pastry_bp.route('/', methods=['GET'])
@cache.cached(timeout=60)
def get_pastries():
    pastries = pastry_service.get_all_pastries()
    return jsonify({"pastries": pastries_schema.dump(pastries)})

@pastry_bp.route('/<int:pastry_id>', methods=['GET'])
@cache.cached(timeout=60)
def get_pastry(pastry_id):
    pastry = pastry_service.get_pastry_by_id(pastry_id)
    if not pastry:
        return jsonify({"message": "Pastry not found"}), 404
    return jsonify(pastry_schema.dump(pastry))

@pastry_bp.route('/bakery/<int:bakery_id>', methods=['GET'])
@cache.cached(timeout=60)
def get_pastries_by_bakery(bakery_id):
    pastries = pastry_service.get_pastries_by_bakery(bakery_id)
    return jsonify({"pastries": pastries_schema.dump(pastries)})

@pastry_bp.route('/create', methods=['POST'])
def create_pastry():
    try:
        name = request.json.get('name')
        bakery_id = request.json.get('bakeryId')

        if not name or not bakery_id:
            return jsonify({"message": "Name and bakeryId are required"}), 400

        bakery = Bakery.query.get(bakery_id)
        if not bakery:
            return jsonify({"message": "Bakery not found"}), 404

        errors = pastry_schema.validate(request.json)
        if errors:
            return jsonify({"message": "Validation error", "errors": errors}), 400

        new_pastry = pastry_service.create_pastry(name, bakery_id)

        cache.delete('view/get_pastries')
        cache.delete(f'view/get_pastries_by_bakery_{bakery_id}')

        return jsonify({
            "message": "Pastry created!",
            "pastry": pastry_schema.dump(new_pastry)
        }), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@pastry_bp.route('/update/<int:pastry_id>', methods=['PATCH'])
def update_pastry(pastry_id):
    if not CAN_EDIT:
        return jsonify({"message": "Editing is disabled"}), 403
    try:
        pastry = pastry_service.get_pastry_by_id(pastry_id)
        if not pastry:
            return jsonify({"message": "Pastry not found"}), 404

        data = request.json
        name = data.get('name', pastry.name)
        bakery_id = data.get('bakeryId', pastry.bakery_id)

        if bakery_id != pastry.bakery_id:
            bakery = Bakery.query.get(bakery_id)
            if not bakery:
                return jsonify({"message": "Bakery not found"}), 404

        if not name:
            return jsonify({"message": "Name cannot be empty"}), 400

        updated_pastry = pastry_service.update_pastry(pastry_id, name, bakery_id)

        cache.delete('view/get_pastries')
        cache.delete(f'view/get_pastry_{pastry_id}')
        cache.delete(f'view/get_pastries_by_bakery_{pastry.bakery_id}')
        if bakery_id != pastry.bakery_id:
            cache.delete(f'view/get_pastries_by_bakery_{bakery_id}')

        return jsonify({
            "message": "Pastry updated.",
            "pastry": pastry_schema.dump(updated_pastry)
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@pastry_bp.route('/delete/<int:pastry_id>', methods=['DELETE'])
def delete_pastry(pastry_id):
    if not CAN_EDIT:
        return jsonify({"message": "Deleting is disabled"}), 403
    try:
        pastry = pastry_service.get_pastry_by_id(pastry_id)
        if not pastry:
            return jsonify({"message": "Pastry not found"}), 404

        bakery_id = pastry.bakery_id
        pastry_service.delete_pastry(pastry_id)

        cache.delete('view/get_pastries')
        cache.delete(f'view/get_pastry_{pastry_id}')
        cache.delete(f'view/get_pastries_by_bakery_{bakery_id}')

        return jsonify({"message": "Pastry deleted!"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400
