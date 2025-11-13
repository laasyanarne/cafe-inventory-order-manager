from flask import Blueprint, jsonify
from db import get_connection
from middleware import manager_required, token_required

employees_bp = Blueprint('employees', __name__)

@employees_bp.route("", methods=["GET"])
@token_required
def get_employees(current_user_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    # Join user account with employee to get all info
    cursor.execute("""
        SELECT 
            ua.EID as id, 
            ua.email, 
            e.Name as name, 
            CASE 
                WHEN ua.Access_level IN ('admin', 'manager') THEN 'manager'
                ELSE 'employee'
            END as role
        FROM `user account` ua
        JOIN employee e ON ua.EID = e.EID
    """)
    employees = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(employees), 200

@employees_bp.route("/<int:employee_id>/promote", methods=["PUT"])
@manager_required
def promote_employee(current_user_id, employee_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Check if user account exists
    cursor.execute("SELECT EID FROM `user account` WHERE EID = %s", (employee_id,))
    user_account = cursor.fetchone()
    
    if not user_account:
        cursor.close()
        conn.close()
        return jsonify({"error": "Employee not found"}), 404
    
    # Update Access_level to 'manager'
    cursor.execute("UPDATE `user account` SET Access_level = 'manager' WHERE EID = %s", (employee_id,))
    conn.commit()
    cursor.close()
    conn.close()
    
    return jsonify({"message": f"Employee {employee_id} promoted to manager"}), 200

