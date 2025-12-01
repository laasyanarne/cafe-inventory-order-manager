from flask import Blueprint, jsonify
from db import get_connection
from middleware import token_required

reports_bp = Blueprint("reports", __name__)

@reports_bp.route("/top-products", methods=["GET"])
@token_required
def top_products(current_user_id):
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


@reports_bp.route("/total-revenue", methods=["GET"])
@token_required
def total_revenue(current_user_id):
    """Total revenue generated from all transactions."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT SUM(p.price * ti.Quantity) AS total_revenue
            FROM transaction_items ti
            JOIN products p ON ti.product_id = p.id
        """)

        row = cursor.fetchone()
        cursor.close()
        conn.close()

        result = {
            'total_revenue': float(row['total_revenue']) if row['total_revenue'] else 0
        }

        return jsonify(result), 200
    except Exception as e:
        print(f"Error fetching total revenue: {e}")
        return jsonify({"error": str(e)}), 500


@reports_bp.route("/customer-count", methods=["GET"])
@token_required
def customer_count(current_user_id):
    """Count of unique customers who have made transactions."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT COUNT(DISTINCT CID) AS customer_count
            FROM transactions
        """)

        row = cursor.fetchone()
        cursor.close()
        conn.close()

        result = {
            'customer_count': int(row['customer_count']) if row['customer_count'] else 0
        }

        return jsonify(result), 200
    except Exception as e:
        print(f"Error fetching customer count: {e}")
        return jsonify({"error": str(e)}), 500


@reports_bp.route("/lowest-price", methods=["GET"])
@token_required
def lowest_price(current_user_id):
    """Lowest price point on the menu."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT MIN(price) AS lowest_price
            FROM products
            WHERE price > 0
        """)

        row = cursor.fetchone()
        lowest = row['lowest_price']
        product_name = None
        
        if lowest:
            cursor.execute("""
                SELECT name
                FROM products
                WHERE price = %s
                LIMIT 1
            """, (lowest,))
            product_row = cursor.fetchone()
            if product_row:
                product_name = product_row['name']

        cursor.close()
        conn.close()

        result = {
            'lowest_price': float(lowest) if lowest else 0,
            'product_name': product_name
        }

        return jsonify(result), 200
    except Exception as e:
        print(f"Error fetching lowest price: {e}")
        return jsonify({"error": str(e)}), 500


@reports_bp.route("/employee/shifts", methods=["GET"])
@token_required
def employee_shift_summary(current_user_id):
    """Employee shift summary with total shifts, hours, and averages."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                EID AS employee_id,
                COUNT(*) AS total_shifts,
                SUM(TIMESTAMPDIFF(HOUR, Start_Time, End_Time)) AS total_hours,
                MIN(TIMESTAMPDIFF(HOUR, Start_Time, End_Time)) AS shortest_shift,
                MAX(TIMESTAMPDIFF(HOUR, Start_Time, End_Time)) AS longest_shift,
                AVG(TIMESTAMPDIFF(HOUR, Start_Time, End_Time)) AS avg_shift
            FROM shifts
            GROUP BY EID
        """)
        
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify(data), 200
    except Exception as e:
        print(f"Error fetching employee shifts: {e}")
        return jsonify({"error": str(e)}), 500