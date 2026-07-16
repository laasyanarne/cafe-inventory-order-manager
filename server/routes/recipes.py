from flask import Blueprint, jsonify, request
from db import get_connection
from middleware import token_required, manager_required

recipes_bp = Blueprint("recipes", __name__)


def _ingredient_status(qty, min_qty):
    qty, min_qty = (qty or 0), (min_qty or 0)
    if qty == 0:
        return "out"
    if min_qty > 0:
        if qty < min_qty * 0.5:
            return "critical"
        if qty < min_qty:
            return "low"
    return "ok"


# ── GET /api/recipes  (summary list — all products) ───────────────────────

@recipes_bp.route("", methods=["GET"])
@token_required
def list_recipes(current_user_id):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("""
        SELECT
            p.id            AS product_id,
            p.name,
            p.category,
            p.price,
            COUNT(pi.ingredient_id) AS ingredient_count,
            CASE
                WHEN COUNT(pi.ingredient_id) = 0 THEN NULL
                ELSE MIN(
                    CASE WHEN pi.qty_per_serve > 0
                         THEN FLOOR(i.quantity / pi.qty_per_serve)
                         ELSE 0 END
                )
            END AS servings_possible,
            MAX(
                CASE WHEN pi.ingredient_id IS NOT NULL
                          AND i.quantity < i.min_quantity
                     THEN 1 ELSE 0 END
            ) AS has_shortage
        FROM products p
        LEFT JOIN product_ingredients pi ON pi.product_id = p.id
        LEFT JOIN ingredients i ON i.Ing_ID = pi.ingredient_id
        GROUP BY p.id, p.name, p.category, p.price
        ORDER BY p.category, p.name
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    for r in rows:
        r["servings_possible"] = (
            int(r["servings_possible"]) if r["servings_possible"] is not None else None
        )
        r["has_shortage"] = bool(r["has_shortage"])
        r["price"] = float(r["price"] or 0)

    return jsonify(rows)


# ── GET /api/recipes/ingredients  (ingredient picker — full stock info) ────

@recipes_bp.route("/ingredients", methods=["GET"])
@token_required
def list_all_ingredients(current_user_id):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("""
        SELECT
            Ing_ID       AS id,
            item_name    AS name,
            quantity,
            min_quantity,
            unit
        FROM ingredients
        ORDER BY item_name
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    for r in rows:
        r["status"] = _ingredient_status(r["quantity"], r["min_quantity"])
    return jsonify(rows)


# ── GET /api/recipes/<product_id>  (recipe detail) ────────────────────────

@recipes_bp.route("/<int:product_id>", methods=["GET"])
@token_required
def get_recipe(current_user_id, product_id):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)

    # Product info
    cur.execute(
        "SELECT id AS product_id, name, category, price FROM products WHERE id = %s",
        (product_id,),
    )
    product = cur.fetchone()
    if not product:
        cur.close()
        conn.close()
        return jsonify({"error": "Product not found"}), 404
    product["price"] = float(product["price"] or 0)

    # Recipe ingredients
    cur.execute("""
        SELECT
            i.Ing_ID        AS ingredient_id,
            i.item_name     AS ingredient_name,
            pi.qty_per_serve,
            i.unit,
            i.quantity      AS stock_qty,
            i.min_quantity  AS min_qty
        FROM product_ingredients pi
        JOIN ingredients i ON i.Ing_ID = pi.ingredient_id
        WHERE pi.product_id = %s
        ORDER BY i.item_name
    """, (product_id,))
    ingredients = cur.fetchall()
    cur.close()
    conn.close()

    for ing in ingredients:
        ing["qty_per_serve"] = float(ing["qty_per_serve"])
        sq = ing["stock_qty"] or 0
        qps = ing["qty_per_serve"]
        ing["servings_possible"] = int(sq / qps) if qps > 0 else 0
        ing["status"] = _ingredient_status(sq, ing["min_qty"])

    if ingredients:
        servings_possible = min(i["servings_possible"] for i in ingredients)
        limiting = min(ingredients, key=lambda i: i["servings_possible"])
        limiting_ingredient = limiting["ingredient_name"]
    else:
        servings_possible = None
        limiting_ingredient = None

    return jsonify({
        "product": product,
        "ingredients": ingredients,
        "servings_possible": servings_possible,
        "limiting_ingredient": limiting_ingredient,
    })


# ── POST /api/recipes/<product_id>/ingredients  (add ingredient) ──────────

@recipes_bp.route("/<int:product_id>/ingredients", methods=["POST"])
@manager_required
def add_ingredient(current_user_id, product_id):
    data = request.get_json() or {}
    ingredient_id = data.get("ingredient_id")
    qty_per_serve = data.get("qty_per_serve", 1.0)

    if not ingredient_id:
        return jsonify({"error": "ingredient_id is required"}), 400
    try:
        qty_per_serve = float(qty_per_serve)
        if qty_per_serve <= 0:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"error": "qty_per_serve must be a positive number"}), 400

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            INSERT INTO product_ingredients (product_id, ingredient_id, qty_per_serve)
            VALUES (%s, %s, %s)
            """,
            (product_id, ingredient_id, qty_per_serve),
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        msg = str(e).lower()
        if "duplicate" in msg:
            return jsonify({"error": "Ingredient already in this recipe"}), 409
        if "foreign key" in msg or "constraint" in msg:
            return jsonify({"error": "Invalid product or ingredient ID"}), 400
        return jsonify({"error": "Failed to add ingredient"}), 500

    cur.close()
    conn.close()
    return jsonify({"message": "Ingredient added to recipe"}), 201


# ── PUT /api/recipes/<product_id>/ingredients/<ingredient_id>  (update qty) ─

@recipes_bp.route("/<int:product_id>/ingredients/<int:ingredient_id>", methods=["PUT"])
@manager_required
def update_ingredient_qty(current_user_id, product_id, ingredient_id):
    data = request.get_json() or {}
    qty_per_serve = data.get("qty_per_serve")

    try:
        qty_per_serve = float(qty_per_serve)
        if qty_per_serve <= 0:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"error": "qty_per_serve must be a positive number"}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        UPDATE product_ingredients
        SET qty_per_serve = %s
        WHERE product_id = %s AND ingredient_id = %s
        """,
        (qty_per_serve, product_id, ingredient_id),
    )
    conn.commit()
    updated = cur.rowcount
    cur.close()
    conn.close()

    if updated == 0:
        return jsonify({"error": "Recipe ingredient not found"}), 404
    return jsonify({"message": "Quantity updated"})


# ── DELETE /api/recipes/<product_id>/ingredients/<ingredient_id> ──────────

@recipes_bp.route("/<int:product_id>/ingredients/<int:ingredient_id>", methods=["DELETE"])
@manager_required
def remove_ingredient(current_user_id, product_id, ingredient_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "DELETE FROM product_ingredients WHERE product_id = %s AND ingredient_id = %s",
        (product_id, ingredient_id),
    )
    conn.commit()
    deleted = cur.rowcount
    cur.close()
    conn.close()

    if deleted == 0:
        return jsonify({"error": "Recipe ingredient not found"}), 404
    return jsonify({"message": "Ingredient removed from recipe"})
