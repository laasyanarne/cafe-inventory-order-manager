from flask import Blueprint, request, jsonify
from db import get_connection
from middleware import token_required

products_bp = Blueprint('products', __name__)

@products_bp.route("", methods=["GET"])
def get_products():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM products")
    products = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(products)

@products_bp.route("", methods=["POST"])
@token_required
def add_product(current_user_id):
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO products (name, description, price, stock) VALUES (%s, %s, %s, %s)",
        (data["name"], data["description"], data["price"], data["stock"])
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Product added successfully!"})

@products_bp.route("/<int:product_id>", methods=["DELETE"])
@token_required
def delete_product(current_user_id, product_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": f"Product {product_id} deleted"}), 200

@products_bp.route("/<int:product_id>", methods=["PUT"])
@token_required
def update_product(current_user_id, product_id):
    data = request.get_json()

    name = data.get("name")
    description = data.get("description")
    price = data.get("price")
    stock = data.get("stock")

    if not name or price is None or stock is None:
        return jsonify({"error": "Missing fields"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE products
        SET name = %s, description = %s, price = %s, stock = %s
        WHERE id = %s
    """, (name, description, price, stock, product_id))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"success": True}), 200