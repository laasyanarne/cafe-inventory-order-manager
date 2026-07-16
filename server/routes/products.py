from datetime import datetime
from flask import Blueprint, request, jsonify
from db import get_connection
from middleware import token_required, manager_required

products_bp = Blueprint('products', __name__)

@products_bp.route("", methods=["GET"])
@token_required
def get_products(current_user_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM products")
    products = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(products)

@products_bp.route("", methods=["POST"])
@manager_required
def add_product(current_user_id):
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO products
           (name, description, price, stock, par_level, unit, supplier_name, category)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
        (
            data["name"],
            data.get("description"),
            data["price"],
            data.get("stock", 0),
            data.get("par_level", 0),
            data.get("unit", "unit"),
            data.get("supplier_name"),
            data.get("category"),
        )
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Product added successfully!"})

@products_bp.route("/<int:product_id>", methods=["DELETE"])
@manager_required
def delete_product(current_user_id, product_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": f"Product {product_id} deleted"}), 200

@products_bp.route("/<int:product_id>", methods=["PUT"])
@manager_required
def update_product(current_user_id, product_id):
    data = request.get_json()

    name  = data.get("name")
    price = data.get("price")
    stock = data.get("stock")

    if not name or price is None or stock is None:
        return jsonify({"error": "Missing fields"}), 400

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # Read current stock to detect a restock event
    cursor.execute("SELECT stock FROM products WHERE id = %s", (product_id,))
    row = cursor.fetchone()
    old_stock = int(row["stock"]) if row and row["stock"] is not None else None

    # Auto-set last_restocked_at only when stock quantity increases
    restock_ts = None
    if old_stock is not None and int(stock) > old_stock:
        restock_ts = datetime.utcnow()

    # Build SET clause dynamically: only update new inventory fields when the
    # caller explicitly sends them.  This protects ProductsPage (/menu), which
    # sends only {name, description, price, stock}, from clobbering par_level /
    # unit / supplier_name / category that were set via the inventory drawer.
    set_parts = [
        "name = %s",
        "description = %s",
        "price = %s",
        "stock = %s",
        "last_restocked_at = COALESCE(%s, last_restocked_at)",
    ]
    params = [
        name,
        data.get("description"),
        price,
        stock,
        restock_ts,
    ]

    if "par_level" in data:
        set_parts.append("par_level = %s")
        params.append(data["par_level"])
    if "unit" in data:
        set_parts.append("unit = %s")
        params.append(data["unit"])
    if "supplier_name" in data:
        set_parts.append("supplier_name = %s")
        params.append(data["supplier_name"])
    if "category" in data:
        set_parts.append("category = %s")
        params.append(data["category"])

    params.append(product_id)

    cursor = conn.cursor()
    cursor.execute(
        f"UPDATE products SET {', '.join(set_parts)} WHERE id = %s",
        params,
    )
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"success": True}), 200
