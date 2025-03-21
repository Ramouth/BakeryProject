from flask import request, jsonify
from . import pastry_bp
from config import db
from models import Pastry, Bakery

@pastry_bp.route("/", methods=["GET"])
def get_pastries():
    pastries = Pastry.query.all()
    pastries_with_bakery = []

    for pastry in pastries:
        bakery = Bakery.query.get(pastry.bakery_id)  # Get the bakery associated with the pastry
        pastries_with_bakery.append({
            "id": pastry.id,
            "name": pastry.name,
            "bakery": {"id": bakery.id, "name": bakery.name},  # Include bakery details
        })

    return jsonify({"pastries": pastries_with_bakery})


@pastry_bp.route("/create", methods=["POST"])
def create_pastry():
    name = request.json.get("name")
    bakery_id = request.json.get("bakeryId")

    if not name or not bakery_id:
        return (
            jsonify({"message": "You must include a name and bakery"}),
            400,
        )

    new_pastry = Pastry(name=name, bakery_id=bakery_id)
    try:
        db.session.add(new_pastry)
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    return jsonify({"message": "Pastry created!"}), 201

@pastry_bp.route("/update/<int:pastry_id>", methods=["PATCH"])
def update_pastry(pastry_id):
    pastry = Pastry.query.get(pastry_id)

    if not pastry:
        return jsonify({"message": "Pastry not found"}), 404

    data = request.json
    pastry.name = data.get("name", pastry.name)
    pastry.bakery_id = data.get("bakery_id", pastry.bakery_id)

    db.session.commit()

    return jsonify({"message": "Pastry updated."}), 200


@pastry_bp.route("/delete/<int:pastry_id>", methods=["DELETE"])
def delete_pastry(pastry_id):
    pastry = Pastry.query.get(pastry_id)

    if not pastry:
        return jsonify({"message": "Pastry not found"}), 404

    db.session.delete(pastry)
    db.session.commit()

    return jsonify({"message": "Pastry deleted!"}), 200
