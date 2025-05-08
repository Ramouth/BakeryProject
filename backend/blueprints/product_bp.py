from flask import Blueprint, request, jsonify
from backend.models import Product, Bakery, Subcategory  # Adjusted model import path
from backend.schemas import ProductSchema  # Adjusted schema import path
from backend.services.product_service import ProductService  # Adjusted service import path
from flask import current_app as app
from backend.utils.caching import cache  # Adjusted utils import path
from backend.services.category_service import SubcategoryService 


# Create blueprint
product_bp = Blueprint('product', __name__)

# Initialize schemas
product_schema = ProductSchema()
products_schema = ProductSchema(many=True)

# Initialize service
product_service = ProductService()

@product_bp.route('/', methods=['GET'])
def get_products():
    """Get all products with detailed information"""
    try:
        products = Product.query.all()
        result = products_schema.dump(products)
        print("Fetched products:", result)
        return jsonify({
            "products": result,
            "total_count": len(result)
        }), 200
    except Exception as e:
        print(f"Error fetching products: {str(e)}")
        return jsonify({
            "message": f"Failed to fetch products: {str(e)}",
            "products": []
        }), 500

@product_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a specific product by ID"""
    product = product_service.get_product_by_id(product_id)
    if not product:
        return jsonify({"message": "Product not found"}), 404
    return jsonify(product_schema.dump(product))

@product_bp.route('/<int:product_id>/stats', methods=['GET'])
def get_product_stats(product_id):
    """Get statistics for a product including review averages"""
    try:
        stats = product_service.get_product_stats(product_id)
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 404

@product_bp.route('/bakery/<int:bakery_id>', methods=['GET'])
def get_products_by_bakery(bakery_id):
    """Get all products for a specific bakery"""
    products = product_service.get_products_by_bakery(bakery_id)
    return jsonify({"products": products_schema.dump(products)})

@product_bp.route('/category/<category>', methods=['GET'])
def get_products_by_category(category):
    """Get all products for a specific category"""
    products = product_service.get_products_by_category(category)
    return jsonify({"products": products_schema.dump(products)})

@product_bp.route('/subcategory/<int:subcategory_id>', methods=['GET'])
@cache.cached(timeout=60)
def get_products_by_subcategory_id(subcategory_id):
    """Get all products for a specific subcategory by ID"""
    subcategory_service = SubcategoryService()
    
    subcategory = subcategory_service.get_subcategory_by_id(subcategory_id)
    if not subcategory:
        return jsonify({"message": "Subcategory not found"}), 404

    products = Product.query.filter_by(subcategory_id=subcategory_id).order_by(Product.name).all()
    return jsonify({"products": products_schema.dump(products)})

@product_bp.route('/create', methods=['POST'])
def create_product():
    """Create a new product"""
    try:
        data = request.json
        if not data.get('name') or not data.get('bakeryId'):
            return jsonify({"message": "Name and bakeryId are required"}), 400

        bakery = Bakery.query.get(data['bakeryId'])
        if not bakery:
            return jsonify({"message": "Bakery not found"}), 404

        # Add validation for subcategory-category relationship
        if data.get('subcategoryId') and not data.get('categoryId'):
            return jsonify({"message": "Category is required when subcategory is provided"}), 400
            
        # If both category and subcategory are provided, check relationship
        if data.get('subcategoryId') and data.get('categoryId'):
            subcategory = Subcategory.query.get(data['subcategoryId'])
            if not subcategory or subcategory.category_id != data['categoryId']:
                return jsonify({"message": "Subcategory does not belong to the selected category"}), 400

        errors = product_schema.validate(data)
        if errors:
            return jsonify({"message": "Validation error", "errors": errors}), 400

        new_product = product_service.create_product(
            name=data['name'],
            bakery_id=data['bakeryId'],
            category_id=data.get('categoryId'),
            subcategory_id=data.get('subcategoryId'),
            image_url=data.get('imageUrl')
        )

        # Invalidate cache
        cache.delete('view/get_products')
        cache.delete(f'view/get_products_by_bakery_{data["bakeryId"]}')
        if data.get('categoryId'):
            cache.delete(f'view/get_products_by_category_{data["categoryId"]}')

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
        category_id = data.get('categoryId', product.category_id)
        subcategory_id = data.get('subcategoryId', product.subcategory_id)
        image_url = data.get('imageUrl', product.image_url)

        if bakery_id != product.bakery_id:
            bakery = Bakery.query.get(bakery_id)
            if not bakery:
                return jsonify({"message": "Bakery not found"}), 404

        if not name:
            return jsonify({"message": "Name cannot be empty"}), 400

        updated_product = product_service.update_product(
            product_id=product_id,
            name=name,
            bakery_id=bakery_id,
            category_id=category_id,
            subcategory_id=subcategory_id,
            image_url=image_url
        )

        # Invalidate cache
        cache.delete('view/get_products')
        cache.delete(f'view/get_product_{product_id}')
        cache.delete(f'view/get_products_by_bakery_{product.bakery_id}')
        if bakery_id != product.bakery_id:
            cache.delete(f'view/get_products_by_bakery_{bakery_id}')
        if category_id and category_id != product.category_id:
            cache.delete(f'view/get_products_by_category_{product.category_id}')
            cache.delete(f'view/get_products_by_category_{category_id}')

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

        product_service.delete_product(product_id)

        # Invalidate cache
        cache.delete('view/get_products')
        cache.delete(f'view/get_product_{product_id}')
        cache.delete(f'view/get_products_by_bakery_{product.bakery_id}')
        if product.category_id:
            cache.delete(f'view/get_products_by_category_{product.category_id}')

        return jsonify({"message": "Product deleted!"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@product_bp.route('/search', methods=['GET'])
def search_products():
    """Search products by name"""
    search_term = request.args.get('q', '')

    if not search_term or len(search_term) < 2:
        return jsonify({"message": "Search term must be at least 2 characters long", "products": []}), 400

    try:
        products = product_service.search_products(search_term)
        return jsonify({"products": products_schema.dump(products)}), 200
    except Exception as e:
        app.logger.error(f"Error searching products: {str(e)}")
        return jsonify({"message": f"Error searching products: {str(e)}", "products": []}), 500