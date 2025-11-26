# server/routes/reports.py
from flask import Blueprint, jsonify
from db import get_connection
from middleware import token_required

reports_bp = Blueprint("reports", __name__)

@reports_bp.route("/top-products", methods=["GET"])
@token_required
def top_products(current_user_id):
    """
    Most popular products by total quantity sold.
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                p.id,
                p.name,
                SUM(ti.Quantity) AS total_qty
            FROM transaction_items ti
            JOIN products p ON ti.product_id = p.id
            GROUP BY p.id, p.name
            ORDER BY total_qty DESC
            LIMIT 10;
        """)

        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify(rows), 200
    except Exception as e:
        print(f"Error fetching top products: {e}")
        return jsonify({"error": str(e)}), 500


@reports_bp.route("/avg-transaction", methods=["GET"])
@token_required
def avg_transaction(current_user_id):
    """
    Average transaction value across all transactions.
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT AVG(txn_total) AS avg_total
            FROM (
                SELECT
                    t.txn_id,
                    SUM(p.price * ti.Quantity) AS txn_total
                FROM transactions t
                JOIN transaction_items ti ON t.txn_id = ti.txn_id
                JOIN products p           ON ti.product_id = p.id
                GROUP BY t.txn_id
            ) AS totals;
        """)

        row = cursor.fetchone()
        cursor.close()
        conn.close()

        return jsonify(row), 200
    except Exception as e:
        print(f"Error fetching avg transaction: {e}")
        return jsonify({"error": str(e)}), 500
