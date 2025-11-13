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
    eid = data.get("eid")  # Employee ID from employee table
    
    if not email or not password or not name:
        return jsonify({"error": "Email, password, and name are required"}), 400
    
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Check if email already exists
    cursor.execute("SELECT EID FROM `user account` WHERE email = %s", (email,))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        return jsonify({"error": "Email already registered"}), 400
    
    # If EID provided, verify employee exists, otherwise create employee first
    if eid:
        cursor.execute("SELECT EID FROM employee WHERE EID = %s", (eid,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"error": "Employee ID not found"}), 400
    else:
        # Get the next EID (max + 1)
        cursor.execute("SELECT MAX(EID) as max_eid FROM employee")
        result = cursor.fetchone()
        eid = (result['max_eid'] or 0) + 1 if result else 1
        
        # Create employee record first
        cursor.execute(
            "INSERT INTO employee (EID, Name, Contact) VALUES (%s, %s, %s)",
            (eid, name, email)
        )
        conn.commit()
    
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Create user account with 'staff' access level (default)
    cursor.execute(
        "INSERT INTO `user account` (EID, email, password_hash, Access_level) VALUES (%s, %s, %s, 'staff')",
        (eid, email, password_hash)
    )
    conn.commit()
    cursor.close()
    conn.close()
    
    # Map Access_level to role: admin/manager -> 'manager', staff -> 'employee'
    role = 'employee'  # staff maps to employee
    
    token = jwt.encode({
        'user_id': eid,
        'email': email,
        'role': role,
        'exp': datetime.utcnow() + timedelta(days=7)
    }, get_secret_key(), algorithm='HS256')
    
    return jsonify({
        "message": "Employee registered successfully",
        "token": token,
        "user": {
            "id": eid,
            "email": email,
            "name": name,
            "role": role
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
    # Join user account with employee to get name
    cursor.execute("""
        SELECT ua.EID, ua.email, ua.password_hash, ua.Access_level, e.Name as name
        FROM `user account` ua
        JOIN employee e ON ua.EID = e.EID
        WHERE ua.email = %s
    """, (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401
    
    if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        return jsonify({"error": "Invalid email or password"}), 401
    
    # Map Access_level to role: admin/manager -> 'manager', staff -> 'employee'
    role = 'manager' if user['Access_level'] in ['admin', 'manager'] else 'employee'
    
    token = jwt.encode({
        'user_id': user['EID'],
        'email': user['email'],
        'role': role,
        'exp': datetime.utcnow() + timedelta(days=7)
    }, get_secret_key(), algorithm='HS256')
    
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user['EID'],
            "email": user['email'],
            "name": user['name'],
            "role": role
        }
    }), 200

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user(current_user_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    # Join user account with employee to get name
    cursor.execute("""
        SELECT ua.EID as id, ua.email, e.Name as name, ua.Access_level
        FROM `user account` ua
        JOIN employee e ON ua.EID = e.EID
        WHERE ua.EID = %s
    """, (current_user_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Map Access_level to role
    user['role'] = 'manager' if user['Access_level'] in ['admin', 'manager'] else 'employee'
    # Remove Access_level from response
    del user['Access_level']
    
    return jsonify(user), 200

