from flask import Blueprint, request, jsonify
from db import get_connection
from middleware import token_required, manager_required

inventory_bp = Blueprint("inventory", __name__)

#auto increment
import mysql.connector

try:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        ALTER TABLE inventory
        MODIFY Inv_ID INT NOT NULL AUTO_INCREMENT
    """)
    conn.commit()
except mysql.connector.Error:
    pass
finally:
    try:
        cursor.close()
        conn.close()
    except Exception:
        pass
#READ
@inventory_bp.route("", methods=["GET"])
@token_required
def get_inventory(current_user_id):
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

# CREATE
@inventory_bp.route("", methods=["POST"])
@manager_required
def add_inventory(current_user_id):
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    # Try to make Inv_ID auto-increment (may fail due to FK)
    try:
        cursor.execute("""
            ALTER TABLE inventory
            MODIFY Inv_ID INT NOT NULL AUTO_INCREMENT
        """)
        conn.commit()
    except Exception:
        pass

    #  Determine fallback Inv_ID manually if needed
    try:
        cursor.execute("SELECT IFNULL(MAX(Inv_ID), 0) + 1 FROM inventory")
        next_id = cursor.fetchone()[0]

        cursor.execute("""
            INSERT INTO inventory (Inv_ID, Temperature, Storage_location)
            VALUES (%s, %s, %s)
        """, (next_id, data.get("temperature"), data.get("location")))

        conn.commit()
        return jsonify({"message": "Inventory item added!", "Inv_ID": next_id}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

#UPDATE
@inventory_bp.route("/<int:item_id>", methods=["PUT"])
@manager_required
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

#DELETE
@inventory_bp.route("/<int:item_id>", methods=["DELETE"])
@manager_required
def delete_inventory(current_user_id, item_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM inventory WHERE Inv_ID = %s", (item_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Inventory deleted!"}), 200
