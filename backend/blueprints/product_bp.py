from flask import Blueprint, request, jsonify
from models import db, Product, Bakery
from schemas import ProductSchema
from services.product_service import ProductService
from utils.caching import cache

# Create blueprint
product_bp = Blueprint('product', __name__)

# Initialize schemas
product_schema = ProductSchema()
products_schema = ProductSchema(many=True)

# Initialize service
product_service = ProductService()

@product_bp.route('/', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_products():
    """Get all products with filtering option by category"""
    category = request.args.get('category')
    
    if category:
        products = product_service.get_products_by_category(category)
    else:
        products = product_service.get_all_products()
        
    return jsonify({"products": products_schema.dump(products)})

@product_bp.route('/<int:product_id>', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_product(product_id):
    """Get a specific product by ID"""
    product = product_service.get_product_by_id(product_id)
    if not product:
        return jsonify({"message": "Product not found"}), 404
    return jsonify(product_schema.dump(product))

@product_bp.route('/bakery/<int:bakery_id>', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_products_by_bakery(bakery_id):
    """Get all products for a specific bakery"""
    products = product_service.get_products_by_bakery(bakery_id)
    return jsonify({"products": products_schema.dump(products)})

@product_bp.route('/category/<category>', methods=['GET'])
@cache.cached(timeout=60)  # Cache for 60 seconds
def get_products_by_category(category):
    """Get all products for a specific category"""
    products = product_service.get_products_by_category(category)
    return jsonify({"products": products_schema.dump(products)})

@product_bp.route('/create', methods=['POST'])
def create_product():
    """Create a new product"""
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('name') or not data.get('bakeryId'):
            return jsonify({"message": "Name and bakeryId are required"}), 400
        
        # Validate bakery exists
        bakery = Bakery.query.get(data['bakeryId'])
        if not bakery:
            return jsonify({"message": "Bakery not found"}), 404
        
        # Validate input data against schema
        errors = product_schema.validate(data)
        if errors:
            return jsonify({"message": "Validation error", "errors": errors}), 400
        
        # Create product
        new_product = product_service.create_product(
            name=data['name'],
            bakery_id=data['bakeryId'],
            category=data.get('category'),
            image_url=data.get('imageUrl')
        )
        
        # Invalidate cache
        cache.delete('view/get_products')
        cache.delete(f'view/get_products_by_bakery_{data["bakeryId"]}')
        if data.get('category'):
            cache.delete(f'view/get_products_by_category_{data["category"]}')
        
        return jsonify({"message": "Product created!", "product": product_schema.dump(new_product)}), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@product_bp.route('/update/<int:product_id>', methods=['PATCH'])
def update_product(product_id):
    """Update a product"""
    try:
        product = product_service.get_product_by_id(product_id)
        if not product:
            return jsonify({"message": "Product not found"}), 404
        
        data = request.json
        name = data.get('name', product.name)
        bakery_id = data.get('bakeryId', product.bakery_id)
        category = data.get('category', product.category)
        image_url = data.get('imageUrl', product.image_url)
        
        # Validate bakery exists if it's being updated
        if bakery_id != product.bakery_id:
            bakery = Bakery.query.get(bakery_id)
            if not bakery:
                return jsonify({"message": "Bakery not found"}), 404
        
        # Validate input data
        if not name:
            return jsonify({"message": "Name cannot be empty"}), 400
        
        # Update product
        updated_product = product_service.update_product(
            product_id=product_id,
            name=name,
            bakery_id=bakery_id,
            category=category,
            image_url=image_url
        )
        
        # Invalidate cache
        cache.delete('view/get_products')
        cache.delete(f'view/get_product_{product_id}')
        cache.delete(f'view/get_products_by_bakery_{product.bakery_id}')
        if bakery_id != product.bakery_id:
            cache.delete(f'view/get_products_by_bakery_{bakery_id}')
        if category and category != product.category:
            cache.delete(f'view/get_products_by_category_{product.category}')
            cache.delete(f'view/get_products_by_category_{category}')
        
        return jsonify({"message": "Product updated.", "product": product_schema.dump(updated_product)}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@product_bp.route('/delete/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete a product"""
    try:
        product = product_service.get_product_by_id(product_id)
        if not product:
            return jsonify({"message": "Product not found"}), 404
        
        bakery_id = product.bakery_id
        category = product.category
        
        # Delete product
        product_service.delete_product(product_id)
        
        # Invalidate cache
        cache.delete('view/get_products')
        cache.delete(f'view/get_product_{product_id}')
        cache.delete(f'view/get_products_by_bakery_{bakery_id}')
        if category:
            cache.delete(f'view/get_products_by_category_{category}')
        
        return jsonify({"message": "Product deleted!"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400