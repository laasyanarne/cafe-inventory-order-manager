from flask import Blueprint, request, jsonify
from db import get_connection
from middleware import token_required

stocks_bp = Blueprint("stocks", __name__)

# ✅ READ all stocks
@stocks_bp.route("", methods=["GET"])
def get_stocks():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT EID AS employee_id,
               Ing_ID AS ingredient_id
        FROM stocks
    """)
    data = cursor.fetchall()
    print("🧩 STOCKS RETURNED:", data)   # 👈 add this line
    cursor.close()
    conn.close()
    return jsonify(data)

# ✅ CREATE stock record
@stocks_bp.route("", methods=["POST"])
@token_required
def add_stock(current_user_id):
    data = request.get_json()
    print("🧩 STOCK ADD:", data)
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

# ✅ UPDATE stock
@stocks_bp.route("/<int:eid>/<int:ing_id>", methods=["PUT"])
@token_required
def update_stock(current_user_id, eid, ing_id):
    data = request.get_json(force=True)
    print("🧩 STOCK UPDATE:", eid, ing_id, data)
    if not data or "employee_id" not in data or "ingredient_id" not in data:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE stocks
        SET EID = %s, Ing_ID = %s
        WHERE EID = %s AND Ing_ID = %s
    """, (
        data["employee_id"],
        data["ingredient_id"],
        eid,
        ing_id
    ))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Stock updated!"}), 200

# ✅ DELETE stock
@stocks_bp.route("/<int:eid>/<int:ing_id>", methods=["DELETE"])
@token_required
def delete_stock(current_user_id, eid, ing_id):
    print("🧩 STOCK DELETE:", eid, ing_id)
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM stocks WHERE EID = %s AND Ing_ID = %s", (eid, ing_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Stock deleted!"}), 200
