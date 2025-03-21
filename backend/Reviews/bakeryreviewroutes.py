from flask import request, jsonify
from . import bakeryreview_bp
from config import db
from models import BakeryReview

# Routes for CRUD operations for Bakery Reviews

# Get all bakery reviews
@bakeryreview_bp.route("/", methods=["GET"])
def get_bakery_reviews():
    bakery_reviews = BakeryReview.query.all()
    json_reviews = list(map(lambda x: x.to_json(), bakery_reviews))
    return jsonify({"bakeryreviews": json_reviews})

# Create a new bakery review
@bakeryreview_bp.route("/create", methods=["POST"])
def create_bakeryreview():
    review = request.json.get("review")
    overall_rating = request.json.get("overallRating")
    service_rating = request.json.get("serviceRating")
    price_rating = request.json.get("priceRating")
    atmosphere_rating = request.json.get("atmosphereRating")
    location_rating = request.json.get("locationRating")
    contact_id = request.json.get("contactId")
    bakery_id = request.json.get("bakeryId")

    if not review or not overall_rating or not service_rating or not price_rating or not atmosphere_rating or not location_rating or not contact_id or not bakery_id:
        return jsonify({"message": "You must include all fields (review, ratings, contactId, bakeryId)"}), 400

    # Create new bakery review
    new_bakery_review = BakeryReview(
        review=review,
        overallRating=overall_rating,
        serviceRating=service_rating,
        priceRating=price_rating,
        atmosphereRating=atmosphere_rating,
        locationRating=location_rating,
        contact_id=contact_id,
        bakery_id=bakery_id,
    )

    try:
        db.session.add(new_bakery_review)
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    return jsonify({"message": "Bakery review created!"}), 201

# Update a bakery review by ID
@bakeryreview_bp.route("/update/<int:review_id>", methods=["PATCH"])
def update_bakeryreview(review_id):
    bakery_review = BakeryReview.query.get(review_id)

    if not bakery_review:
        return jsonify({"message": "Bakery review not found"}), 404

    data = request.json
    bakery_review.review = data.get("review", bakery_review.review)
    bakery_review.overallRating = data.get("overallRating", bakery_review.overallRating)
    bakery_review.serviceRating = data.get("serviceRating", bakery_review.serviceRating)
    bakery_review.priceRating = data.get("priceRating", bakery_review.priceRating)
    bakery_review.atmosphereRating = data.get("atmosphereRating", bakery_review.atmosphereRating)
    bakery_review.locationRating = data.get("locationRating", bakery_review.locationRating)
    bakery_review.contact_id = data.get("contactId", bakery_review.contact_id)
    bakery_review.bakery_id = data.get("bakeryId", bakery_review.bakery_id)

    db.session.commit()

    return jsonify({"message": "Bakery review updated."}), 200

# Delete a bakery review by ID
@bakeryreview_bp.route("/delete/<int:review_id>", methods=["DELETE"])
def delete_bakeryreview(review_id):
    bakery_review = BakeryReview.query.get(review_id)

    if not bakery_review:
        return jsonify({"message": "Bakery review not found"}), 404

    db.session.delete(bakery_review)
    db.session.commit()

    return jsonify({"message": "Bakery review deleted!"}), 200
