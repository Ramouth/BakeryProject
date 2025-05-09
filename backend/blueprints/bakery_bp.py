from flask import Blueprint, request, jsonify, current_app as app, make_response
from backend.extensions import db
from backend.schemas.bakery_schema import BakerySchema
from backend.services.bakery_service import BakeryService
from backend.services.product_service import ProductService
from backend.schemas.product_schema import ProductSchema

# Create blueprint
bakery_bp = Blueprint('bakery', __name__)

# Initialize schemas
bakery_schema = BakerySchema()
bakeries_schema = BakerySchema(many=True)

# Initialize service
bakery_service = BakeryService()


@bakery_bp.route('/', methods=['GET'])
def get_bakeries():
    """Get all bakeries"""
    try:
        bakeries = bakery_service.get_all_bakeries()
        return jsonify({"bakeries": bakeries_schema.dump(bakeries)})
    except Exception as e:
        import traceback
        app.logger.error(f"Error getting all bakeries: {str(e)}")
        app.logger.error(traceback.format_exc())  # This will log the full stack trace
        return jsonify({"message": str(e), "bakeries": []}), 500


@bakery_bp.route('/top', methods=['GET'])
def get_top_bakeries():
    """Get top rated bakeries"""
    try:
        limit = request.args.get('limit', default=4, type=int)

        # Get all bakeries first
        bakeries = bakery_service.get_all_bakeries()

        # For each bakery, get its stats (using the same logic as the profile page)
        for bakery in bakeries:
            stats = bakery_service.get_bakery_stats(bakery.id)
            bakery.average_rating = stats.get('average_rating', 0)
            bakery.review_count = stats.get('review_count', 0)

        # Sort by average rating (highest first)
        sorted_bakeries = sorted(
            bakeries,
            key=lambda b: b.average_rating if hasattr(b, 'average_rating') else 0,
            reverse=True
        )

        # Return only the requested number of bakeries
        top_bakeries = sorted_bakeries[:limit]

        return jsonify({"bakeries": bakeries_schema.dump(top_bakeries)})
    except Exception as e:
        app.logger.error(f"Error getting top bakeries: {str(e)}")
        return jsonify({"message": str(e), "bakeries": []}), 500


@bakery_bp.route('/<int:bakery_id>', methods=['GET'])
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
        data = request.get_json()
        if not data:
            return jsonify({"message": "No input data provided"}), 400

        app.logger.info(f"Received bakery creation data: {data}")

        errors = bakery_schema.validate(data)
        if errors:
            app.logger.error(f"Schema validation errors: {errors}")
            return jsonify({"message": "Validation error", "errors": errors}), 400

        name = data.get('name')
        zip_code = data.get('zipCode')

        app.logger.info(f"Extracted fields - name: {name}, zipCode: {zip_code}")

        if not name or not zip_code:
            missing = []
            if not name:
                missing.append("name")
            if not zip_code:
                missing.append("zipCode")
            app.logger.error(f"Missing required fields: {missing}")
            return jsonify({"message": f"Name and zip code are required"}), 400

        street_name = data.get('streetName')
        street_number = data.get('streetNumber')
        image_url = data.get('imageUrl')
        website_url = data.get('websiteUrl')

        new_bakery = bakery_service.create_bakery(
            name=name,
            zip_code=zip_code,
            street_name=street_name,
            street_number=street_number,
            image_url=image_url,
            website_url=website_url
        )

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
        bakery = bakery_service.get_bakery_by_id(bakery_id)
        if not bakery:
            return jsonify({"message": "Bakery not found"}), 404

        data = request.get_json()
        if not data:
            return jsonify({"message": "No input data provided"}), 400

        name = data.get('name', bakery.name)
        zip_code = data.get('zipCode', bakery.zip_code)
        street_name = data.get('streetName', bakery.street_name)
        street_number = data.get('streetNumber', bakery.street_number)
        image_url = data.get('imageUrl', bakery.image_url)
        website_url = data.get('websiteUrl', bakery.website_url)

        if not name or not zip_code:
            return jsonify({"message": "Name and zip code cannot be empty"}), 400

        updated_bakery = bakery_service.update_bakery(
            bakery_id=bakery_id,
            name=name,
            zip_code=zip_code,
            street_name=street_name,
            street_number=street_number,
            image_url=image_url,
            website_url=website_url
        )

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
        bakery = bakery_service.get_bakery_by_id(bakery_id)
        if not bakery:
            return jsonify({"message": "Bakery not found"}), 404

        bakery_service.delete_bakery(bakery_id)

        return jsonify({"message": "Bakery deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error deleting bakery: {str(e)}"}), 400


@bakery_bp.route('/search', methods=['GET'])
def search_bakeries():
    """Search bakeries by name"""
    search_term = request.args.get('q', '')

    if not search_term or len(search_term) < 2:
        return jsonify({"message": "Search term must be at least 2 characters long", "bakeries": []}), 400

    try:
        bakeries = bakery_service.search_bakeries(search_term)
        return jsonify({"bakeries": bakeries_schema.dump(bakeries)}), 200
    except Exception as e:
        app.logger.error(f"Error searching bakeries: {str(e)}")
        return jsonify({"message": f"Error searching bakeries: {str(e)}", "bakeries": []}), 500


# New bulk stats endpoint
@bakery_bp.route('/stats', methods=['GET'])
def get_multiple_bakery_stats():
    """
    Get stats for multiple bakeries. Accepts a comma-separated list of bakery IDs as ?ids=1,2,3,...
    """
    try:
        ids_param = request.args.get('ids')
        if not ids_param:
            return jsonify({"message": "Missing 'ids' query parameter"}), 400

        try:
            id_list = [int(i.strip()) for i in ids_param.split(',') if i.strip().isdigit()]
        except ValueError:
            return jsonify({"message": "IDs must be a comma-separated list of integers"}), 400

        if not id_list:
            return jsonify({"message": "No valid IDs provided"}), 400

        stats_list = []
        for bakery_id in id_list:
            try:
                stats = bakery_service.get_bakery_stats(bakery_id)
                # Ensure keys
                stats.setdefault('average_rating', 0)
                stats.setdefault('review_count', 0)
                stats.setdefault('ratings', {
                    'overall': 0,
                    'service': 0,
                    'price': 0,
                    'atmosphere': 0,
                    'location': 0
                })
                stats_list.append({
                    'bakery_id': bakery_id,
                    **stats
                })
            except Exception as e:
                app.logger.warning(f"Could not fetch stats for bakery ID {bakery_id}: {str(e)}")
                import traceback
                app.logger.debug(traceback.format_exc())
                continue

        return jsonify({"stats": stats_list}), 200

    except Exception as e:
        import traceback
        app.logger.error(f"Unexpected error in /bakeries/stats: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({"message": "Unexpected server error"}), 500


@bakery_bp.route('/<int:bakery_id>/stats', methods=['GET'])
def get_bakery_stats(bakery_id):
    """Get statistics for a bakery including review averages"""
    try:
        stats = bakery_service.get_bakery_stats(bakery_id)
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 404


@bakery_bp.route('/<int:bakery_id>/products', methods=['GET'])
def get_bakery_products(bakery_id):
    """Get all products for a specific bakery"""
    from backend.services.product_service import ProductService
    from backend.schemas.product_schema import ProductSchema

    product_service = ProductService()
    products_schema = ProductSchema(many=True)

    bakery = bakery_service.get_bakery_by_id(bakery_id)
    if not bakery:
        return jsonify({"message": "Bakery not found"}), 404

    products = product_service.get_products_by_bakery(bakery_id)
    return jsonify({"products": products_schema.dump(products)})