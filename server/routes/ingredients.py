from flask import Blueprint, jsonify, request
from db import get_connection
from middleware import token_required

ingredients_bp = Blueprint("ingredients", __name__)

@ingredients_bp.route("", methods=["GET"])
def get_ingredients():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            Ing_ID    AS id,
            item_name AS name
        FROM ingredients
        ORDER BY item_name;
    """)

    ingredients = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(ingredients)


@ingredients_bp.route("", methods=["POST"])
@token_required
def add_ingredient(current_user_id):
    data = request.get_json() or {}
    name = data.get("name")

    if not name:
        return jsonify({"error": "name is required"}), 400

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)


    cursor.execute("SELECT COALESCE(MAX(Ing_ID), 0) + 1 AS next_id FROM ingredients")
    row = cursor.fetchone()
    next_id = row["next_id"]

    cursor.execute(
        "INSERT INTO ingredients (Ing_ID, item_name) VALUES (%s, %s)",
        (next_id, name)
    )
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "Ingredient added successfully!", "id": next_id}), 201


@ingredients_bp.route("/<int:ing_id>", methods=["PUT"])
@token_required
def update_ingredient(current_user_id, ing_id):
    data = request.get_json() or {}
    name = data.get("name")

    if not name:
        return jsonify({"error": "name is required"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE ingredients SET item_name = %s WHERE Ing_ID = %s",
        (name, ing_id)
    )
    conn.commit()

    updated_rows = cursor.rowcount
    cursor.close()
    conn.close()

    if updated_rows == 0:
        return jsonify({"error": "Ingredient not found"}), 404

    return jsonify({"message": "Ingredient updated successfully!"}), 200


@ingredients_bp.route("/<int:ing_id>", methods=["DELETE"])
@token_required
def delete_ingredient(current_user_id, ing_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("DELETE FROM ingredients WHERE Ing_ID = %s", (ing_id,))
        conn.commit()
        deleted_rows = cursor.rowcount
    except Exception as e:
        conn.rollback()
        msg = str(e).lower()
        cursor.close()
        conn.close()

        if "foreign key" in msg or "constraint fails" in msg:
            return jsonify({
                "error": (
                    "Cannot delete this ingredient because it is still referenced "
                    "in other tables (e.g., menu items, inventory, or stocks)."
                )
            }), 400

        return jsonify({"error": "Failed to delete ingredient", "details": str(e)}), 500

    cursor.close()
    conn.close()

    if deleted_rows == 0:
        return jsonify({"error": "Ingredient not found"}), 404

    return jsonify({"message": "Ingredient deleted successfully!"}), 200
