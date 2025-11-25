from flask import Blueprint, jsonify, request
from db import get_connection
from middleware import token_required
import json

transactions_bp = Blueprint("transactions", __name__)


@transactions_bp.route("", methods=["GET"])
def get_transactions():
    """
    Returns transactions joined with customers, products, and transaction_items.

    Response shape (example):

    [
      {
        "id": 1,
        "customer_id": 3,
        "customer": "Noah Davis",
        "total": 15.75,
        "total_items": 2,   # number of distinct line items
        "total_qty": 3,     # sum of quantities
        "items": [
          {
            "product_id": 29,
            "name": "House Brew",
            "qty": 2,
            "line_total": 7.50
          },
          {
            "product_id": 14,
            "name": "blueberry muffin",
            "qty": 1,
            "line_total": 4.25
          }
        ]
      },
      ...
    ]
    """
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            t.txn_id AS id,
            t.CID    AS customer_id,
            COALESCE(c.Name, 'Walk-in customer') AS customer,
            SUM(p.price * ti.Quantity)           AS total,
            COUNT(*)                             AS total_items,
            SUM(ti.Quantity)                     AS total_qty,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'product_id', p.id,
                    'name',       p.name,
                    'qty',        ti.Quantity,
                    'line_total', p.price * ti.Quantity
                )
            ) AS items_json
        FROM transactions t
        JOIN transaction_items ti ON t.txn_id = ti.txn_id
        JOIN products p           ON ti.product_id = p.id
        LEFT JOIN customer c      ON t.CID = c.CID
        GROUP BY t.txn_id, customer, t.CID
        ORDER BY t.txn_id DESC;
        """
    )

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    # Post-process JSON + decimals for safe JSON output
    for row in rows:
        items_json = row.pop("items_json")
        row["items"] = json.loads(items_json) if items_json else []

        # Cast decimal to float
        row["total"] = float(row["total"] or 0)

        for item in row["items"]:
            item["line_total"] = float(item["line_total"])

    return jsonify(rows), 200


@transactions_bp.route("", methods=["POST"])
@token_required
def create_transaction(current_user_id):
    """
    Create a new transaction.

    Expects JSON:
    {
      "customer_id": 1 or null,
      "items": [
        { "product_id": 3, "qty": 2 },
        { "product_id": 10, "qty": 1 }
      ]
    }
    """
    data = request.get_json() or {}
    cid = data.get("customer_id")
    items = data.get("items") or []

    if not items:
        return jsonify({"error": "At least one line item is required"}), 400

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Generate next txn_id manually (since there's no AUTO_INCREMENT)
        cursor.execute("SELECT COALESCE(MAX(txn_id), 0) + 1 AS next_id FROM transactions")
        next_row = cursor.fetchone()
        txn_id = next_row["next_id"]

        # Insert into parent table
        cursor.execute(
            "INSERT INTO transactions (txn_id, CID) VALUES (%s, %s)",
            (txn_id, cid),
        )

        # Insert line items
        for item in items:
            product_id = item.get("product_id")
            qty = item.get("qty")

            if not product_id or not qty:
                conn.rollback()
                return jsonify({"error": "Each item needs product_id and qty"}), 400

            cursor.execute(
                "INSERT INTO transaction_items (txn_id, product_id, Quantity) "
                "VALUES (%s, %s, %s)",
                (txn_id, product_id, qty),
            )

        conn.commit()
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": str(e)}), 500

    cursor.close()
    conn.close()

    return jsonify({"message": "Transaction created", "id": txn_id}), 201


@transactions_bp.route("/<int:txn_id>", methods=["PUT"])
@token_required
def update_transaction(current_user_id, txn_id):
    """
    Replace a transaction's customer and line items.

    Expects the same JSON shape as POST:
    {
      "customer_id": 1 or null,
      "items": [
        { "product_id": 3, "qty": 2 },
        { "product_id": 10, "qty": 1 }
      ]
    }
    """
    data = request.get_json() or {}
    cid = data.get("customer_id")
    items = data.get("items") or []

    if not items:
        return jsonify({"error": "At least one line item is required"}), 400

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Make sure the transaction exists
        cursor.execute("SELECT txn_id FROM transactions WHERE txn_id = %s", (txn_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"error": "Transaction not found"}), 404

        # Update customer
        cursor.execute(
            "UPDATE transactions SET CID = %s WHERE txn_id = %s",
            (cid, txn_id),
        )

        # Clear old line items
        cursor.execute("DELETE FROM transaction_items WHERE txn_id = %s", (txn_id,))

        # Insert new line items
        for item in items:
            product_id = item.get("product_id")
            qty = item.get("qty")

            if not product_id or not qty:
                conn.rollback()
                cursor.close()
                conn.close()
                return jsonify({"error": "Each item needs product_id and qty"}), 400

            cursor.execute(
                "INSERT INTO transaction_items (txn_id, product_id, Quantity) "
                "VALUES (%s, %s, %s)",
                (txn_id, product_id, qty),
            )

        conn.commit()
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": str(e)}), 500

    cursor.close()
    conn.close()

    return jsonify({"message": "Transaction updated"}), 200


@transactions_bp.route("/<int:txn_id>", methods=["DELETE"])
@token_required
def delete_transaction(current_user_id, txn_id):
    """
    Delete a transaction (and its items via FK ON DELETE CASCADE).
    """
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("DELETE FROM transactions WHERE txn_id = %s", (txn_id,))
        conn.commit()
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": str(e)}), 500

    cursor.close()
    conn.close()

    return jsonify({"message": f"Transaction {txn_id} deleted"}), 200
