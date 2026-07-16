from flask import Blueprint, jsonify, request
from db import get_connection
from middleware import token_required, manager_required
import json

transactions_bp = Blueprint("transactions", __name__)


@transactions_bp.route("", methods=["GET"])
@token_required
def get_transactions(current_user_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            t.txn_id       AS id,
            t.CID          AS customer_id,
            t.status,
            t.order_note,
            t.created_at,
            t.completed_at,
            COALESCE(c.Name, 'Walk-in customer') AS customer,
            SUM(p.price * ti.Quantity)            AS total,
            COUNT(*)                              AS total_items,
            SUM(ti.Quantity)                      AS total_qty,
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
        GROUP BY t.txn_id, t.CID, t.status, t.order_note, t.created_at, t.completed_at, customer
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

        if row["created_at"]:
            row["created_at"] = row["created_at"].isoformat()
        if row["completed_at"]:
            row["completed_at"] = row["completed_at"].isoformat()

    return jsonify(rows), 200


@transactions_bp.route("", methods=["POST"])
@token_required
def create_transaction(current_user_id):
    data = request.get_json() or {}
    cid   = data.get("customer_id")
    items = data.get("items") or []
    note  = data.get("order_note")

    if not items:
        return jsonify({"error": "At least one line item is required"}), 400

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT COALESCE(MAX(txn_id), 0) + 1 AS next_id FROM transactions")
        txn_id = cursor.fetchone()["next_id"]

        cursor.execute(
            "INSERT INTO transactions (txn_id, CID, order_note) VALUES (%s, %s, %s)",
            (txn_id, cid, note),
        )

        for item in items:
            product_id = item.get("product_id")
            qty        = item.get("qty")

            if not product_id or not qty:
                conn.rollback()
                return jsonify({"error": "Each item needs product_id and qty"}), 400

            cursor.execute(
                "INSERT INTO transaction_items (txn_id, product_id, Quantity) VALUES (%s, %s, %s)",
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
    data  = request.get_json() or {}
    cid   = data.get("customer_id")
    items = data.get("items") or []
    note  = data.get("order_note")

    if not items:
        return jsonify({"error": "At least one line item is required"}), 400

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT txn_id FROM transactions WHERE txn_id = %s", (txn_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"error": "Transaction not found"}), 404

        cursor.execute(
            "UPDATE transactions SET CID = %s, order_note = %s WHERE txn_id = %s",
            (cid, note, txn_id),
        )

        cursor.execute("DELETE FROM transaction_items WHERE txn_id = %s", (txn_id,))

        for item in items:
            product_id = item.get("product_id")
            qty        = item.get("qty")

            if not product_id or not qty:
                conn.rollback()
                cursor.close()
                conn.close()
                return jsonify({"error": "Each item needs product_id and qty"}), 400

            cursor.execute(
                "INSERT INTO transaction_items (txn_id, product_id, Quantity) VALUES (%s, %s, %s)",
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


@transactions_bp.route("/<int:txn_id>/status", methods=["PATCH"])
@token_required
def update_status(current_user_id, txn_id):
    data       = request.get_json() or {}
    new_status = data.get("status")
    valid      = {"queued", "preparing", "ready", "completed"}

    if new_status not in valid:
        return jsonify({"error": f"status must be one of: {', '.join(sorted(valid))}"}), 400

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT txn_id FROM transactions WHERE txn_id = %s", (txn_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"error": "Transaction not found"}), 404

        if new_status == "completed":
            cursor.execute(
                "UPDATE transactions SET status = %s, completed_at = UTC_TIMESTAMP() WHERE txn_id = %s",
                (new_status, txn_id),
            )
        else:
            cursor.execute(
                "UPDATE transactions SET status = %s, completed_at = NULL WHERE txn_id = %s",
                (new_status, txn_id),
            )

        conn.commit()
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": str(e)}), 500

    cursor.close()
    conn.close()
    return jsonify({"message": "Status updated", "status": new_status}), 200


@transactions_bp.route("/<int:txn_id>", methods=["DELETE"])
@manager_required
def delete_transaction(current_user_id, txn_id):
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
