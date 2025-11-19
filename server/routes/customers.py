from flask import Blueprint, request, jsonify
from db import get_connection
from middleware import token_required

customers_bp = Blueprint('customers', __name__)

@customers_bp.route("", methods=["GET"])
@token_required
def get_customers(current_user_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT CID as id, Name as name, Contact as contact FROM customer")
    customers = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(customers), 200

@customers_bp.route("", methods=["POST"])
@token_required
def add_customer(current_user_id):
    data = request.get_json()
    name = data.get("name")
    contact = data.get("contact")
    
    if not name:
        return jsonify({"error": "Name is required"}), 400
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # Get the next CID
    cursor.execute("SELECT MAX(CID) as max_id FROM customer")
    result = cursor.fetchone()
    next_id = (result[0] or 0) + 1 if result else 1
    
    cursor.execute(
        "INSERT INTO customer (CID, Name, Contact) VALUES (%s, %s, %s)",
        (next_id, name, contact)
    )
    conn.commit()
    customer_id = next_id
    cursor.close()
    conn.close()
    
    return jsonify({
        "message": "Customer added successfully!",
        "id": customer_id
    }), 201

@customers_bp.route("/<int:customer_id>", methods=["DELETE"])
@token_required
def delete_customer(current_user_id, customer_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM customer WHERE CID = %s", (customer_id,))
    conn.commit()
    affected_rows = cursor.rowcount
    cursor.close()
    conn.close()
    
    if affected_rows == 0:
        return jsonify({"error": "Customer not found"}), 404
    
    return jsonify({"message": f"Customer {customer_id} deleted"}), 200

