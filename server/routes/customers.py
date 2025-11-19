from flask import Blueprint, request, jsonify
from db import get_connection
from middleware import token_required

customers_bp = Blueprint('customers', __name__)

# GET all customers
@customers_bp.route("", methods=["GET"])
def get_customers():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT CID, Name, Contact FROM customer ORDER BY CID")
        customers = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convert to match frontend format
        customer_list = []
        for customer in customers:
            customer_list.append({
                'cid': customer['CID'],
                'name': customer['Name'],
                'contact': customer['Contact']
            })
        
        return jsonify(customer_list), 200
    except Exception as e:
        print(f"Error fetching customers: {e}")
        return jsonify({'error': str(e)}), 500

# GET single customer
@customers_bp.route("/<int:cid>", methods=["GET"])
def get_customer(cid):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT CID, Name, Contact FROM customer WHERE CID = %s", (cid,))
        customer = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if customer:
            return jsonify({
                'cid': customer['CID'],
                'name': customer['Name'],
                'contact': customer['Contact']
            }), 200
        else:
            return jsonify({'error': 'Customer not found'}), 404
    except Exception as e:
        print(f"Error fetching customer: {e}")
        return jsonify({'error': str(e)}), 500

# CREATE customer
@customers_bp.route("", methods=["POST"])
@token_required
def create_customer(current_user_id):
    try:
        data = request.get_json()
        name = data.get('name')
        contact = data.get('contact')
        
        if not name or not contact:
            return jsonify({'error': 'Name and contact are required'}), 400
        
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO customer (Name, Contact) VALUES (%s, %s)",
            (name, contact)
        )
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Customer created successfully'}), 201
    except Exception as e:
        print(f"Error creating customer: {e}")
        return jsonify({'error': str(e)}), 500

# UPDATE customer
@customers_bp.route("/<int:cid>", methods=["PUT"])
@token_required
def update_customer(current_user_id, cid):
    try:
        data = request.get_json()
        name = data.get('name')
        contact = data.get('contact')
        
        if not name or not contact:
            return jsonify({'error': 'Name and contact are required'}), 400
        
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE customer SET Name = %s, Contact = %s WHERE CID = %s",
            (name, contact, cid)
        )
        
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Customer not found'}), 404
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Customer updated successfully'}), 200
    except Exception as e:
        print(f"Error updating customer: {e}")
        return jsonify({'error': str(e)}), 500

# DELETE customer
@customers_bp.route("/<int:cid>", methods=["DELETE"])
@token_required
def delete_customer(current_user_id, cid):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM customer WHERE CID = %s", (cid,))
        
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Customer not found'}), 404
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Customer deleted successfully'}), 200
    except Exception as e:
        print(f"Error deleting customer: {e}")
        return jsonify({'error': str(e)}), 500