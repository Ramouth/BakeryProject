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

# Configure CORS
allowed_origins = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, resources={
    r"/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Sample user database (replace with your actual database integration)
users_db = {
    "user1": {"username": "user1", "password": "password1", "role": "user"},
    "admin": {"username": "admin", "password": "admin_pass", "role": "admin"}
}

# Sample bakery database (replace with your actual database integration)
bakeries_db = [
    {"id": 1, "name": "Sunrise Bakery", "rating": 4.5},
    {"id": 2, "name": "Flour Power",   "rating": 4.8},
    {"id": 3, "name": "Sweet Crumbs", "rating": 4.2},
    {"id": 4, "name": "Daily Dough",   "rating": 4.7},
    {"id": 5, "name": "Bread & Butter","rating": 4.6},
]

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

    user = users_db.get(username)
    if not user or user['password'] != password:
        return jsonify({"error": "Invalid username or password"}), 401

    access_token = create_access_token(identity={
        "username": username,
        "role": user['role']
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

# Public bakery endpoints
@app.route('/bakeries', methods=['GET'])
def list_bakeries():
    return jsonify({"bakeries": bakeries_db}), 200

@app.route('/bakeries/top', methods=['GET', 'OPTIONS'])
def top_bakeries():
    # Handle preflight CORS
    if request.method == 'OPTIONS':
        resp = make_response()
        resp.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
        resp.headers['Access-Control-Allow-Methods'] = 'GET,OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        return resp

    try:
        limit = int(request.args.get('limit', 5))
    except ValueError:
        return jsonify({"error": "Invalid limit parameter"}), 400

    sorted_bakeries = sorted(bakeries_db, key=lambda b: b['rating'], reverse=True)
    top_n = sorted_bakeries[:limit]
    return jsonify({"bakeries": top_n}), 200

if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=debug_mode)
