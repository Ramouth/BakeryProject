from flask import Blueprint, request, jsonify
from models import Category, Subcategory
from schemas import CategorySchema, SubcategorySchema
from services.category_service import CategoryService, SubcategoryService
from utils.caching import cache

# Create blueprint
category_bp = Blueprint('category', __name__)

# Initialize schemas
category_schema = CategorySchema()
categories_schema = CategorySchema(many=True)
subcategory_schema = SubcategorySchema()
subcategories_schema = SubcategorySchema(many=True)

# Initialize services
category_service = CategoryService()
subcategory_service = SubcategoryService()

# === Category Routes ===

@category_bp.route('/', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_categories():
    """Get all categories"""
    categories = category_service.get_all_categories()
    return jsonify({"categories": categories_schema.dump(categories)})

@category_bp.route('/<int:category_id>', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_category(category_id):
    """Get a specific category by ID"""
    category = category_service.get_category_by_id(category_id)
    if not category:
        return jsonify({"message": "Category not found"}), 404
    return jsonify(category_schema.dump(category))

@category_bp.route('/create', methods=['POST'])
def create_category():
    """Create a new category"""
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({"message": "Name is required"}), 400
        
        # Create category
        category = category_service.create_category(name=data['name'])
        
        # Invalidate cache
        cache.delete_memoized(get_categories)
        
        return jsonify({
            "message": "Category created successfully!",
            "category": category_schema.dump(category)
        }), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@category_bp.route('/update/<int:category_id>', methods=['PATCH'])
def update_category(category_id):
    """Update a category"""
    try:
        category = category_service.get_category_by_id(category_id)
        if not category:
            return jsonify({"message": "Category not found"}), 404
        
        data = request.json
        
        # Validate input data
        if not data.get('name'):
            return jsonify({"message": "Name cannot be empty"}), 400
        
        # Update category
        updated_category = category_service.update_category(
            category_id=category_id,
            name=data['name']
        )
        
        # Invalidate cache
        cache.delete_memoized(get_categories)
        cache.delete_memoized(get_category, category_id)
        
        return jsonify({
            "message": "Category updated successfully",
            "category": category_schema.dump(updated_category)
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@category_bp.route('/delete/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    """Delete a category"""
    try:
        category = category_service.get_category_by_id(category_id)
        if not category:
            return jsonify({"message": "Category not found"}), 404
        
        # Delete category
        category_service.delete_category(category_id)
        
        # Invalidate cache
        cache.delete_memoized(get_categories)
        cache.delete_memoized(get_category, category_id)
        
        return jsonify({"message": "Category deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

# === Subcategory Routes ===

@category_bp.route('/subcategories', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_subcategories():
    """Get all subcategories"""
    subcategories = subcategory_service.get_all_subcategories()
    return jsonify({"subcategories": subcategories_schema.dump(subcategories)})

@category_bp.route('/<int:category_id>/subcategories', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_subcategories_by_category(category_id):
    """Get all subcategories for a specific category"""
    category = category_service.get_category_by_id(category_id)
    if not category:
        return jsonify({"message": "Category not found"}), 404
        
    subcategories = subcategory_service.get_subcategories_by_category(category_id)
    return jsonify({"subcategories": subcategories_schema.dump(subcategories)})

@category_bp.route('/subcategories/<int:subcategory_id>', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_subcategory(subcategory_id):
    """Get a specific subcategory by ID"""
    subcategory = subcategory_service.get_subcategory_by_id(subcategory_id)
    if not subcategory:
        return jsonify({"message": "Subcategory not found"}), 404
    return jsonify(subcategory_schema.dump(subcategory))

@category_bp.route('/subcategories/create', methods=['POST'])
def create_subcategory():
    """Create a new subcategory"""
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('name') or not data.get('categoryId'):
            return jsonify({"message": "Name and categoryId are required"}), 400
        
        # Validate category exists
        category = category_service.get_category_by_id(data['categoryId'])
        if not category:
            return jsonify({"message": "Category not found"}), 404
        
        # Create subcategory
        subcategory = subcategory_service.create_subcategory(
            name=data['name'],
            category_id=data['categoryId']
        )
        
        # Invalidate cache
        cache.delete_memoized(get_subcategories)
        cache.delete_memoized(get_subcategories_by_category, data['categoryId'])
        
        return jsonify({
            "message": "Subcategory created successfully!",
            "subcategory": subcategory_schema.dump(subcategory)
        }), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@category_bp.route('/subcategories/update/<int:subcategory_id>', methods=['PATCH'])
def update_subcategory(subcategory_id):
    """Update a subcategory"""
    try:
        subcategory = subcategory_service.get_subcategory_by_id(subcategory_id)
        if not subcategory:
            return jsonify({"message": "Subcategory not found"}), 404
        
        data = request.json
        
        # Validate input data
        if not data.get('name'):
            return jsonify({"message": "Name cannot be empty"}), 400
        
        # Validate category exists if it's being updated
        category_id = data.get('categoryId')
        if category_id and category_id != subcategory.category_id:
            category = category_service.get_category_by_id(category_id)
            if not category:
                return jsonify({"message": "Category not found"}), 404
        
        # Update subcategory
        updated_subcategory = subcategory_service.update_subcategory(
            subcategory_id=subcategory_id,
            name=data['name'],
            category_id=data.get('categoryId')
        )
        
        # Invalidate cache
        cache.delete_memoized(get_subcategories)
        cache.delete_memoized(get_subcategory, subcategory_id)
        cache.delete_memoized(get_subcategories_by_category, subcategory.category_id)
        if category_id and category_id != subcategory.category_id:
            cache.delete_memoized(get_subcategories_by_category, category_id)
        
        return jsonify({
            "message": "Subcategory updated successfully",
            "subcategory": subcategory_schema.dump(updated_subcategory)
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@category_bp.route('/subcategories/delete/<int:subcategory_id>', methods=['DELETE'])
def delete_subcategory(subcategory_id):
    """Delete a subcategory"""
    try:
        subcategory = subcategory_service.get_subcategory_by_id(subcategory_id)
        if not subcategory:
            return jsonify({"message": "Subcategory not found"}), 404
        
        category_id = subcategory.category_id
        
        # Delete subcategory
        subcategory_service.delete_subcategory(subcategory_id)
        
        # Invalidate cache
        cache.delete_memoized(get_subcategories)
        cache.delete_memoized(get_subcategory, subcategory_id)
        cache.delete_memoized(get_subcategories_by_category, category_id)
        
        return jsonify({"message": "Subcategory deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400