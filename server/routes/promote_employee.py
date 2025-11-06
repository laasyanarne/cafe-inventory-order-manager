from flask import Blueprint, jsonify
from db import get_connection
from middleware import manager_required, token_required

employees_bp = Blueprint('employees', __name__)

@employees_bp.route("", methods=["GET"])
@token_required
def get_employees(current_user_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, email, name, role FROM employees")
    employees = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(employees), 200

@employees_bp.route("/<int:employee_id>/promote", methods=["PUT"])
@manager_required
def promote_employee(current_user_id, employee_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT * FROM employees WHERE id = %s", (employee_id,))
    employee = cursor.fetchone()
    
    if not employee:
        cursor.close()
        conn.close()
        return jsonify({"error": "Employee not found"}), 404
    
    cursor.execute("UPDATE employees SET role = 'manager' WHERE id = %s", (employee_id,))
    conn.commit()
    cursor.close()
    conn.close()
    
    return jsonify({"message": f"Employee {employee_id} promoted to manager"}), 200

