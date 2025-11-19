from flask import Blueprint, request, jsonify
from db import get_connection
from middleware import token_required

inventory_bp = Blueprint("inventory", __name__)

# ✅ READ all inventory
@inventory_bp.route("", methods=["GET"])
def get_inventory():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT Inv_ID AS id,
               Temperature AS temperature,
               Storage_location AS location
        FROM inventory
    """)
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(data)

# ✅ CREATE inventory item
@inventory_bp.route("", methods=["POST"])
@token_required
def add_inventory(current_user_id):
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO inventory (Temperature, Storage_location)
        VALUES (%s, %s)
    """, (data.get("temperature"), data.get("location")))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Inventory item added!"}), 201

# ✅ UPDATE inventory item
@inventory_bp.route("/<int:item_id>", methods=["PUT"])
@token_required
def update_inventory(current_user_id, item_id):
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE inventory
        SET Temperature = %s,
            Storage_location = %s
        WHERE Inv_ID = %s
    """, (data.get("temperature"), data.get("location"), item_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Inventory updated!"}), 200

# ✅ DELETE inventory item
@inventory_bp.route("/<int:item_id>", methods=["DELETE"])
@token_required
def delete_inventory(current_user_id, item_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM inventory WHERE Inv_ID = %s", (item_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Inventory deleted!"}), 200
