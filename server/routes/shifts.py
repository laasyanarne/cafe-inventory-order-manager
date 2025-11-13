from flask import Blueprint, request, jsonify
from db import get_connection
from middleware import token_required
from urllib.parse import unquote

shifts_bp = Blueprint('shifts', __name__)

@shifts_bp.route("", methods=["GET"])
@token_required
def get_shifts(current_user_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    # Join with employee table to get employee name
    cursor.execute("""
        SELECT 
            s.EID as employee_id,
            e.Name as employee_name,
            s.Start_Time as start_time,
            s.End_Time as end_time
        FROM shifts s
        LEFT JOIN employee e ON s.EID = e.EID
        ORDER BY s.EID, s.Start_Time
    """)
    shifts = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(shifts), 200

@shifts_bp.route("", methods=["POST"])
@token_required
def add_shift(current_user_id):
    data = request.get_json()
    employee_id = data.get("employee_id")
    start_time = data.get("start_time")
    end_time = data.get("end_time")
    
    if not employee_id or not start_time or not end_time:
        return jsonify({"error": "employee_id, start_time, and end_time are required"}), 400
    
    # Verify employee exists
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT EID FROM employee WHERE EID = %s", (employee_id,))
    employee = cursor.fetchone()
    
    if not employee:
        cursor.close()
        conn.close()
        return jsonify({"error": "Employee not found"}), 404
    
    # Check if shift already exists (composite key)
    cursor.execute(
        "SELECT * FROM shifts WHERE EID = %s AND Start_Time = %s AND End_Time = %s",
        (employee_id, start_time, end_time)
    )
    existing = cursor.fetchone()
    
    if existing:
        cursor.close()
        conn.close()
        return jsonify({"error": "Shift already exists"}), 400
    
    cursor.execute(
        "INSERT INTO shifts (EID, Start_Time, End_Time) VALUES (%s, %s, %s)",
        (employee_id, start_time, end_time)
    )
    conn.commit()
    cursor.close()
    conn.close()
    
    return jsonify({"message": "Shift added successfully!"}), 201

@shifts_bp.route("/<int:employee_id>/<path:start_time>/<path:end_time>", methods=["DELETE"])
@token_required
def delete_shift(current_user_id, employee_id, start_time, end_time):
    conn = get_connection()
    cursor = conn.cursor()
    # URL decode the times if needed (handles colons in time format)
    start_time = unquote(start_time)
    end_time = unquote(end_time)
    cursor.execute(
        "DELETE FROM shifts WHERE EID = %s AND Start_Time = %s AND End_Time = %s",
        (employee_id, start_time, end_time)
    )
    conn.commit()
    affected_rows = cursor.rowcount
    cursor.close()
    conn.close()
    
    if affected_rows == 0:
        return jsonify({"error": "Shift not found"}), 404
    
    return jsonify({"message": "Shift deleted successfully"}), 200

