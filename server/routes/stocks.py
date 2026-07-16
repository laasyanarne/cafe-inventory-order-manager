from flask import Blueprint, request, jsonify
from db import get_connection
from middleware import token_required, manager_required

stocks_bp = Blueprint("stocks", __name__)

#READ
@stocks_bp.route("", methods=["GET"])
@token_required
def get_stocks(current_user_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT EID AS employee_id,
               Ing_ID AS ingredient_id
        FROM stocks
    """)
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(data)

#CREATE
@stocks_bp.route("", methods=["POST"])
@manager_required
def add_stock(current_user_id):
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO stocks (EID, Ing_ID)
        VALUES (%s, %s)
    """, (data.get("employee_id"), data.get("ingredient_id")))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Stock added!"}), 201

#UPDATE
@stocks_bp.route("/<int:eid>/<int:ing_id>", methods=["PUT"])
@manager_required
def update_stock(current_user_id, eid, ing_id):
    data = request.get_json(force=True)
    if not data or "employee_id" not in data or "ingredient_id" not in data:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    new_eid = data["employee_id"]
    new_ing = data["ingredient_id"]

    try:
        if (new_eid != eid) or (new_ing != ing_id):
            cursor.execute("DELETE FROM stocks WHERE EID = %s AND Ing_ID = %s", (eid, ing_id))
            cursor.execute("INSERT INTO stocks (EID, Ing_ID) VALUES (%s, %s)", (new_eid, new_ing))
        else:
            cursor.execute("""
                UPDATE stocks
                SET EID = %s, Ing_ID = %s
                WHERE EID = %s AND Ing_ID = %s
            """, (new_eid, new_ing, eid, ing_id))

        conn.commit()

    except mysql.connector.Error as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400

    finally:
        cursor.close()
        conn.close()
    return jsonify({"message": "Stock updated!"}), 200


#DELETE
@stocks_bp.route("/<int:eid>/<int:ing_id>", methods=["DELETE"])
@manager_required
def delete_stock(current_user_id, eid, ing_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM stocks WHERE EID = %s AND Ing_ID = %s", (eid, ing_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Stock deleted!"}), 200
