from flask import request, jsonify
from . import pastryreview_bp
from config import db
from models import PastryReview

# Get all pastry reviews
@pastryreview_bp.route("/", methods=["GET"])
def get_pastry_reviews():
    pastry_reviews = PastryReview.query.all()
    json_reviews = list(map(lambda x: x.to_json(), pastry_reviews))
    return jsonify({"pastryreviews": json_reviews})


# Create a new pastry review
@pastryreview_bp.route("/create", methods=["POST"])
def create_pastry_review():
    review = request.json.get("review")
    overall_rating = request.json.get("overallRating")
    taste_rating = request.json.get("tasteRating")
    price_rating = request.json.get("priceRating")
    presentation_rating = request.json.get("presentationRating")
    contact_id = request.json.get("contactId")
    pastry_id = request.json.get("pastryId")

    if not all([review, overall_rating, taste_rating, price_rating, presentation_rating, contact_id, pastry_id]):
        return jsonify({"message": "You must include all fields (review, ratings, contactId, pastryId)"}), 400

    # Create new pastry review
    new_pastry_review = PastryReview(
        review=review,
        overallRating=overall_rating,
        tasteRating=taste_rating,
        priceRating=price_rating,
        presentationRating=presentation_rating,
        contact_id=contact_id,
        pastry_id=pastry_id,
    )

    try:
        db.session.add(new_pastry_review)
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    return jsonify({"message": "Pastry review created!"}), 201


# Update a pastry review by ID
@pastryreview_bp.route("/update/<int:review_id>", methods=["PATCH"])
def update_pastry_review(review_id):
    pastry_review = PastryReview.query.get(review_id)

    if not pastry_review:
        return jsonify({"message": "Pastry review not found"}), 404

    data = request.json
    pastry_review.review = data.get("review", pastry_review.review)
    pastry_review.overallRating = data.get("overallRating", pastry_review.overallRating)
    pastry_review.tasteRating = data.get("tasteRating", pastry_review.tasteRating)
    pastry_review.priceRating = data.get("priceRating", pastry_review.priceRating)
    pastry_review.presentationRating = data.get("presentationRating", pastry_review.presentationRating)
    pastry_review.contact_id = data.get("contactId", pastry_review.contact_id)
    pastry_review.pastry_id = data.get("pastryId", pastry_review.pastry_id)

    db.session.commit()

    return jsonify({"message": "Pastry review updated."}), 200


# Delete a pastry review by ID
@pastryreview_bp.route("/delete/<int:review_id>", methods=["DELETE"])
def delete_pastry_review(review_id):
    pastry_review = PastryReview.query.get(review_id)

    if not pastry_review:
        return jsonify({"message": "Pastry review not found"}), 404

    db.session.delete(pastry_review)
    db.session.commit()

    return jsonify({"message": "Pastry review deleted!"}), 200
