from flask import request, jsonify
from . import bakery_bp
from config import db
from models import Bakery

# Routes for CRUD operations for Bakery
# Notice that we are now using @bakery_bp instead of @app and the route is now "/" because of url prefix in the blueprint 
# Also make sure to make changes in the routes in the frontend to match the new routes

@bakery_bp.route("/", methods=["GET"])
def get_bakeries():
    bakeries = Bakery.query.all()
    json_bakeries = list(map(lambda x: x.to_json(), bakeries))
    return jsonify({"bakeries": json_bakeries})

@bakery_bp.route("/create", methods=["POST"])
def create_bakery():
    name = request.json.get("name")
    zip_code = request.json.get("zipCode")

    if not name or not zip_code:
        return (
            jsonify({"message": "You must include a name and zip code"}),
            400,
        )

    new_bakery = Bakery(name=name, zip_code=zip_code)
    try:
        db.session.add(new_bakery)
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    return jsonify({"message": "Bakery created!"}), 201

@bakery_bp.route("/update/<int:bakery_id>", methods=["PATCH"])
def update_bakery(bakery_id):
    bakery = Bakery.query.get(bakery_id)

    if not bakery:
        return jsonify({"message": "Bakery not found"}), 404

    data = request.json
    bakery.name = data.get("name", bakery.name)
    bakery.zip_code = data.get("zipCode", bakery.zip_code)

    db.session.commit()

    return jsonify({"message": "Bakery updated."}), 200


@bakery_bp.route("/delete/<int:bakery_id>", methods=["DELETE"])
def delete_bakery(bakery_id):
    bakery = Bakery.query.get(bakery_id)

    if not bakery:
        return jsonify({"message": "Bakery not found"}), 404

    db.session.delete(bakery)
    db.session.commit()

    return jsonify({"message": "Bakery deleted!"}), 200
