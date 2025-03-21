from flask import request, jsonify
from config import app, db
from Contact import contact_bp
from Bakery import bakery_bp
from Pastry import pastry_bp
from Reviews import bakeryreview_bp, pastryreview_bp

app.register_blueprint(contact_bp, url_prefix="/contacts")
app.register_blueprint(bakery_bp, url_prefix="/bakeries")
app.register_blueprint(pastry_bp, url_prefix="/pastries")
app.register_blueprint(pastryreview_bp, url_prefix="/pastryreviews")
app.register_blueprint(bakeryreview_bp, url_prefix="/bakeryreviews")

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True)