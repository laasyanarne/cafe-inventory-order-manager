from functools import wraps
from flask import request, jsonify
import jwt
import os

def get_secret_key():
    secret_key = os.getenv('SECRET_KEY')
    if not secret_key:
        raise ValueError("SECRET_KEY environment variable is not set. Please set it in your .env file.")
    return secret_key

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, get_secret_key(), algorithms=['HS256'])
            current_user_id = data['user_id']
        except:
            return jsonify({'error': 'Token is invalid'}), 401
        
        return f(current_user_id, *args, **kwargs)
    return decorated

def manager_required(f):
    @wraps(f)
    @token_required
    def decorated(current_user_id, *args, **kwargs):
        from db import get_connection
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT Access_level FROM `user_account` WHERE EID = %s", (current_user_id,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Map Access_level to role: admin/manager -> 'manager', staff -> 'employee'
        role = 'manager' if user['Access_level'] in ['admin', 'manager'] else 'employee'
        
        if role != 'manager':
            return jsonify({'error': 'Manager access required'}), 403

        return f(current_user_id, *args, **kwargs)
    return decorated


def get_role(user_id):
    """Return 'manager' or 'employee' for the given user_id."""
    from db import get_connection
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT Access_level FROM user_account WHERE EID = %s", (user_id,))
        row = cursor.fetchone()
        cursor.close()
        conn.close()
        if not row:
            return 'employee'
        return 'manager' if row['Access_level'] in ['admin', 'manager'] else 'employee'
    except Exception:
        return 'employee'
