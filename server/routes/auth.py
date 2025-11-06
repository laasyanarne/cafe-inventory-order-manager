from flask import Blueprint, request, jsonify
from db import get_connection
import jwt
import bcrypt
from datetime import datetime, timedelta
import os
from middleware import token_required

auth_bp = Blueprint('auth', __name__)

def get_secret_key():
    secret_key = os.getenv('SECRET_KEY')
    if not secret_key:
        raise ValueError("SECRET_KEY environment variable is not set. Please set it in your .env file.")
    return secret_key

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    
    if not email or not password or not name:
        return jsonify({"error": "Email, password, and name are required"}), 400
    
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT id FROM employees WHERE email = %s", (email,))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        return jsonify({"error": "Email already registered"}), 400
    
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    cursor.execute(
        "INSERT INTO employees (email, password_hash, name, role) VALUES (%s, %s, %s, 'employee')",
        (email, password_hash, name)
    )
    employee_id = cursor.lastrowid
    conn.commit()
    cursor.close()
    conn.close()
    
    token = jwt.encode({
        'user_id': employee_id,
        'email': email,
        'role': 'employee',
        'exp': datetime.utcnow() + timedelta(days=7)
    }, get_secret_key(), algorithm='HS256')
    
    return jsonify({
        "message": "Employee registered successfully",
        "token": token,
        "user": {
            "id": employee_id,
            "email": email,
            "name": name,
            "role": "employee"
        }
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM employees WHERE email = %s", (email,))
    employee = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not employee:
        return jsonify({"error": "Invalid email or password"}), 401
    
    if not bcrypt.checkpw(password.encode('utf-8'), employee['password_hash'].encode('utf-8')):
        return jsonify({"error": "Invalid email or password"}), 401
    
    token = jwt.encode({
        'user_id': employee['id'],
        'email': employee['email'],
        'role': employee['role'],
        'exp': datetime.utcnow() + timedelta(days=7)
    }, get_secret_key(), algorithm='HS256')
    
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": employee['id'],
            "email": employee['email'],
            "name": employee['name'],
            "role": employee['role']
        }
    }), 200

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user(current_user_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, email, name, role FROM employees WHERE id = %s", (current_user_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(user), 200

