from flask import Blueprint, jsonify, request
from db import get_connection
from middleware import token_required
import json

transactions_bp = Blueprint("transactions", __name__)


@transactions_bp.route("", methods=["GET"])
def get_transactions():
    """
    Returns transactions joined with customers, menu_items, and transaction_items.
    Shape matches what your React TransactionsList expects.
    """
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            t.txn_id AS id,
            t.CID    AS customer_id,
            COALESCE(c.Name, 'Walk-in customer') AS customer,
            SUM(mi.Price * ti.Quantity)          AS total,
            COUNT(*)                             AS total_items,
            SUM(ti.Quantity)                     AS total_qty,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'menu_id',    mi.M_ID,
                    'name',       mi.item_name,
                    'qty',        ti.Quantity,
                    'line_total', mi.Price * ti.Quantity
                )
            ) AS items_json
        FROM transactions t
        JOIN transaction_items ti ON t.txn_id = ti.txn_id
        JOIN menu_items mi        ON ti.M_ID = mi.M_ID
        LEFT JOIN customer c      ON t.CID = c.CID
        GROUP BY t.txn_id, customer, t.CID
        ORDER BY t.txn_id DESC;
        """
    )

    rows = cursor.fetchall()
    cursor.close()
    conn.close()


    for row in rows:
        items_json = row.pop("items_json")
        row["items"] = json.loads(items_json) if items_json else []

        row["total"] = float(row["total"] or 0)

        for item in row["items"]:
            item["line_total"] = float(item["line_total"])

    return jsonify(rows), 200


@transactions_bp.route("", methods=["POST"])
@token_required
def create_transaction(current_user_id):
    """
    Expects JSON:
    {
      "customer_id": 1 or null,
      "items": [
        { "menu_id": 3, "qty": 2 },
        { "menu_id": 10, "qty": 1 }
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


    cursor.execute("SELECT COALESCE(MAX(txn_id), 0) + 1 AS next_id FROM transactions")
    next_row = cursor.fetchone()
    txn_id = next_row["next_id"]

    cursor.execute(
        "INSERT INTO transactions (txn_id, CID) VALUES (%s, %s)",
        (txn_id, cid),
    )


    for item in items:
        m_id = item.get("menu_id")
        qty = item.get("qty")
        if not m_id or not qty:
            conn.rollback()
            cursor.close()
            conn.close()
            return jsonify({"error": "Each item needs menu_id and qty"}), 400

        cursor.execute(
            "INSERT INTO transaction_items (txn_id, M_ID, Quantity) VALUES (%s, %s, %s)",
            (txn_id, m_id, qty),
        )

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Transaction created", "id": txn_id}), 201


@transactions_bp.route("/<int:txn_id>", methods=["PUT"])
@token_required
def update_transaction(current_user_id, txn_id):
    """
    Replace a transaction's customer and items.
    Same JSON shape as POST.
    """
    data = request.get_json() or {}
    cid = data.get("customer_id")
    items = data.get("items") or []

    if not items:
        return jsonify({"error": "At least one line item is required"}), 400

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)


    cursor.execute("SELECT txn_id FROM transactions WHERE txn_id = %s", (txn_id,))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        return jsonify({"error": "Transaction not found"}), 404


    cursor.execute(
        "UPDATE transactions SET CID = %s WHERE txn_id = %s",
        (cid, txn_id),
    )


    cursor.execute("DELETE FROM transaction_items WHERE txn_id = %s", (txn_id,))

    for item in items:
        m_id = item.get("menu_id")
        qty = item.get("qty")
        if not m_id or not qty:
            conn.rollback()
            cursor.close()
            conn.close()
            return jsonify({"error": "Each item needs menu_id and qty"}), 400

        cursor.execute(
            "INSERT INTO transaction_items (txn_id, M_ID, Quantity) VALUES (%s, %s, %s)",
            (txn_id, m_id, qty),
        )

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Transaction updated"}), 200


@transactions_bp.route("/<int:txn_id>", methods=["DELETE"])
@token_required
def delete_transaction(current_user_id, txn_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM transactions WHERE txn_id = %s", (txn_id,))


    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": f"Transaction {txn_id} deleted"}), 200
