# app.py
from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from datetime import timedelta
import os

# Initialize Flask app
app = Flask(__name__)

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-this-in-production')  # CHANGE THIS IN PRODUCTION!
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)

# Configure CORS
# For development, you might want to allow all origins, but in production, specify your domains
CORS(app, resources={
    r"/*": {
        "origins": os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(','),
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Sample user database (replace with your actual database integration)
users_db = {
    "user1": {
        "username": "user1",
        "password": "password1",  # In production, use hashed passwords!
        "role": "user"
    },
    "admin": {
        "username": "admin",
        "password": "admin_pass",  # In production, use hashed passwords!
        "role": "admin"
    }
}

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

    user = users_db.get(username, None)
    if not user or user['password'] != password:  # In production, check hashed passwords!
        return jsonify({"error": "Invalid username or password"}), 401

    # Create JWT token
    access_token = create_access_token(identity={
        "username": username,
        "role": user['role']
    })
    
    return jsonify({"access_token": access_token}), 200

@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    # Access the identity of the current user
    current_user = get_jwt_identity()
    return jsonify({"logged_in_as": current_user}), 200

@app.route('/admin', methods=['GET'])
@jwt_required()
def admin_only():
    current_user = get_jwt_identity()
    if current_user.get('role') != 'admin':
        return jsonify({"error": "Admin access required"}), 403
    
    return jsonify({"message": "Admin access granted"}), 200

if __name__ == '__main__':
    app.run(debug=True)