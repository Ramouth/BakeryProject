from flask import Flask, jsonify, request, make_response
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
from flask_cors import CORS
from datetime import timedelta
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)

# Simple CORS configuration - a single place to handle CORS
allowed_origin = os.environ.get('ALLOWED_ORIGIN', 'http://localhost:5173')
CORS(app, 
     origins=[allowed_origin],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# Routes
@app.route('/')
def index():
    return jsonify({"message": "Welcome to the Flask JWT Auth API"})

@app.route('/login', methods=['POST'])
def login():
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400

    username = request.json.get('username', None)
    password = request.json.get('password', None)
    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    # This would typically check against your database
    # For now, just a successful response for any credentials
    access_token = create_access_token(identity={
        "username": username,
        "role": "admin"  # Default role for testing
    })
    return jsonify({"access_token": access_token}), 200

@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"logged_in_as": current_user}), 200

@app.route('/admin', methods=['GET'])
@jwt_required()
def admin_only():
    current_user = get_jwt_identity()
    if current_user.get('role') != 'admin':
        return jsonify({"error": "Admin access required"}), 403
    return jsonify({"message": "Admin access granted"}), 200

# Your actual endpoints would connect to your database models
# These are provided as minimal examples
@app.route('/bakeries', methods=['GET'])
def list_bakeries():
    # In a real app, this would query your database
    return jsonify({"bakeries": []}), 200

@app.route('/bakeries/top', methods=['GET'])
def top_bakeries():
    # In a real app, this would query your database with filtering/sorting
    return jsonify({"bakeries": []}), 200

@app.route('/bakeries/<int:bakery_id>/stats', methods=['GET'])
def get_bakery_stats(bakery_id):
    """Get statistics for a bakery including review averages"""
    try:
        # In a real app, this would query your database for the specific bakery
        # For now, just return a not found response
        return jsonify({"message": f"Bakery with id {bakery_id} not found"}), 404
    except Exception as e:
        return jsonify({"message": str(e)}), 404

if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=debug_mode)