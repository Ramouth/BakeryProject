from flask import request, jsonify
from config import app, db
from models import Contact, Bakery, Pastry


@app.route("/contacts", methods=["GET"])
def get_contacts():
    contacts = Contact.query.all()
    json_contacts = list(map(lambda x: x.to_json(), contacts))
    return jsonify({"contacts": json_contacts})


@app.route("/create_contact", methods=["POST"])
def create_contact():
    first_name = request.json.get("firstName")
    last_name = request.json.get("lastName")
    email = request.json.get("email")

    if not first_name or not last_name or not email:
        return (
            jsonify({"message": "You must include a first name, last name and email"}),
            400,
        )

    new_contact = Contact(first_name=first_name, last_name=last_name, email=email)
    try:
        db.session.add(new_contact)
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    return jsonify({"message": "User created!"}), 201


@app.route("/update_contact/<int:user_id>", methods=["PATCH"])
def update_contact(user_id):
    contact = Contact.query.get(user_id)

    if not contact:
        return jsonify({"message": "User not found"}), 404

    data = request.json
    contact.first_name = data.get("firstName", contact.first_name)
    contact.last_name = data.get("lastName", contact.last_name)
    contact.email = data.get("email", contact.email)

    db.session.commit()

    return jsonify({"message": "Usr updated."}), 200


@app.route("/delete_contact/<int:user_id>", methods=["DELETE"])
def delete_contact(user_id):
    contact = Contact.query.get(user_id)

    if not contact:
        return jsonify({"message": "User not found"}), 404

    db.session.delete(contact)
    db.session.commit()

    return jsonify({"message": "User deleted!"}), 200

@app.route("/bakeries", methods=["GET"])
def get_bakeries():
    bakeries = Bakery.query.all()
    json_bakeries = list(map(lambda x: x.to_json(), bakeries))
    return jsonify({"bakeries": json_bakeries})

@app.route("/create_bakery", methods=["POST"])
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

@app.route("/update_bakery/<int:bakery_id>", methods=["PATCH"])
def update_bakery(bakery_id):
    bakery = Bakery.query.get(bakery_id)

    if not bakery:
        return jsonify({"message": "Bakery not found"}), 404

    data = request.json
    bakery.name = data.get("name", bakery.name)
    bakery.zip_code = data.get("zipCode", bakery.zip_code)

    db.session.commit()

    return jsonify({"message": "Bakery updated."}), 200


@app.route("/delete_bakery/<int:bakery_id>", methods=["DELETE"])
def delete_bakery(bakery_id):
    bakery = Bakery.query.get(bakery_id)

    if not bakery:
        return jsonify({"message": "Bakery not found"}), 404

    db.session.delete(bakery)
    db.session.commit()

    return jsonify({"message": "Bakery deleted!"}), 200

@app.route("/pastries", methods=["GET"])
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


@app.route("/create_pastry", methods=["POST"])
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

@app.route("/update_pastry/<int:pastry_id>", methods=["PATCH"])
def update_pastry(pastry_id):
    pastry = Pastry.query.get(pastry_id)

    if not pastry:
        return jsonify({"message": "Pastry not found"}), 404

    data = request.json
    pastry.name = data.get("name", pastry.name)
    pastry.bakery_id = data.get("bakery_id", pastry.bakery_id)

    db.session.commit()

    return jsonify({"message": "Pastry updated."}), 200


@app.route("/delete_pastry/<int:pastry_id>", methods=["DELETE"])
def delete_pastry(pastry_id):
    pastry = Pastry.query.get(pastry_id)

    if not pastry:
        return jsonify({"message": "Pastry not found"}), 404

    db.session.delete(pastry)
    db.session.commit()

    return jsonify({"message": "Pastry deleted!"}), 200


if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True)