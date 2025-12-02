from flask import Blueprint, jsonify
from db import get_connection

reports_employee_bp = Blueprint("reports_employee", __name__)

@reports_employee_bp.route("/employee/shifts", methods=["GET"])
def employee_shift_summary():
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
    return jsonify(data)
