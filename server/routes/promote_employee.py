from flask import Blueprint, jsonify, request
from db import get_connection
from middleware import token_required, manager_required, get_role
import bcrypt

employees_bp = Blueprint("employees", __name__)

# ============================================================
# GET ALL EMPLOYEES
# ============================================================
@employees_bp.route("", methods=["GET"])
@token_required
def get_employees(current_user_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            ua.EID AS id,
            e.Name AS name,
            ua.email,
            ua.Access_level AS role,
            e.Wages,
            e.Time_off,
            e.Employee_since
        FROM employee e
        JOIN user_account ua ON ua.EID = e.EID
        ORDER BY e.EID
    """)
    employees = cursor.fetchall()

    cursor.close()
    conn.close()

    if get_role(current_user_id) != 'manager':
        for emp in employees:
            emp.pop('Wages', None)
            emp.pop('Time_off', None)

    return jsonify(employees), 200


# ============================================================
# PROMOTE EMPLOYEE → MANAGER
# ============================================================
@employees_bp.route("/<int:employee_id>/promote", methods=["PUT"])
@manager_required
def promote_employee(current_user_id, employee_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM user_account WHERE EID = %s", (employee_id,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"error": "Employee not found"}), 404

    cursor.execute("""
        UPDATE user_account
        SET Access_level = 'manager'
        WHERE EID = %s
    """, (employee_id,))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Employee promoted to manager"}), 200

# ============================================================
# DEMOTE MANAGER → EMPLOYEE
# ============================================================
@employees_bp.route("/<int:employee_id>/demote", methods=["PUT"])
@manager_required
def demote_employee(current_user_id, employee_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # Check if user exists
    cursor.execute("SELECT * FROM user_account WHERE EID = %s", (employee_id,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"error": "Employee not found"}), 404

    # Already employee?
    if user["Access_level"] == "employee":
        return jsonify({"error": "This user is already an employee"}), 400

    # Demote
    cursor.execute("""
        UPDATE user_account
        SET Access_level = 'employee'
        WHERE EID = %s
    """, (employee_id,))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Manager demoted to employee"}), 200

# ============================================================
# ADD EMPLOYEE
# ============================================================
@employees_bp.route("", methods=["POST"])
@manager_required
def add_employee(current_user_id):
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    wages = data.get("wages", 15.00)
    time_off = data.get("time_off", 5)

    # Validate required fields
    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # 1) Check email duplicate
        cursor.execute("SELECT * FROM user_account WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"error": "Email already exists"}), 400

        # 2) Compute next EID MANUALLY (since EID is NOT auto_increment)
        cursor.execute("SELECT MAX(EID) AS max_eid FROM employee")
        row = cursor.fetchone()
        new_eid = (row["max_eid"] or 0) + 1

        # 3) Hash password
        hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

        # 4) Insert new employee WITH explicit EID
        cursor.execute("""
            INSERT INTO employee (EID, Name, Wages, Time_off, Employee_since, Contact, manager_id)
            VALUES (%s, %s, %s, %s, CURDATE(), %s, %s)
        """, (new_eid, name, wages, time_off, email, current_user_id))

        # 5) Insert login account
        cursor.execute("""
            INSERT INTO user_account (EID, email, password_hash, Access_level)
            VALUES (%s, %s, %s, %s)
        """, (new_eid, email, hashed_pw, "employee"))

        conn.commit()
        return jsonify({"message": "Employee added", "id": new_eid}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# ============================================================
# UPDATE EMPLOYEE
# ============================================================
@employees_bp.route("/<int:employee_id>", methods=["PUT"])
@manager_required
def update_employee(current_user_id, employee_id):
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    wages = data.get("wages")
    time_off = data.get("time_off")

    if not name or not email:
        return jsonify({"error": "Name and email are required"}), 400

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # 1) Make sure employee exists
        cursor.execute("""
            SELECT ua.email
            FROM user_account ua
            JOIN employee e ON ua.EID = e.EID
            WHERE ua.EID = %s
        """, (employee_id,))
        existing = cursor.fetchone()
        if not existing:
            return jsonify({"error": "Employee not found"}), 404

        # 2) If email changed, make sure it’s unique
        cursor.execute("""
            SELECT EID FROM user_account
            WHERE email = %s AND EID <> %s
        """, (email, employee_id))
        if cursor.fetchone():
            return jsonify({"error": "Email already in use by another employee"}), 400

        # 3) Update employee table
        cursor.execute("""
            UPDATE employee
            SET Name = %s,
                Wages = %s,
                Time_off = %s,
                Contact = %s
            WHERE EID = %s
        """, (name, wages, time_off, email, employee_id))

        # 4) Update login email (user_account)
        cursor.execute("""
            UPDATE user_account
            SET email = %s
            WHERE EID = %s
        """, (email, employee_id))

        conn.commit()
        return jsonify({"message": "Employee updated"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# ============================================================
# DELETE EMPLOYEE
# ============================================================
@employees_bp.route("/<int:employee_id>", methods=["DELETE"])
@manager_required
def delete_employee(current_user_id, employee_id):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT EID FROM employee WHERE EID = %s", (employee_id,))
        if not cursor.fetchone():
            return jsonify({"error": "Employee not found"}), 404

        # MUST delete login first (FK)
        cursor.execute("DELETE FROM user_account WHERE EID = %s", (employee_id,))
        cursor.execute("DELETE FROM employee WHERE EID = %s", (employee_id,))

        conn.commit()
        return jsonify({"message": "Employee deleted"}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": "Server error deleting employee"}), 500

    finally:
        cursor.close()
        conn.close()


@employees_bp.route("/me/password", methods=["PUT"])
@token_required
def change_password(current_user_id):
    data = request.get_json()
    old_pw = data.get("old_password")
    new_pw = data.get("new_password")

    if not old_pw or not new_pw:
        return jsonify({"error": "Both old and new passwords are required"}), 400

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # Fetch user's hashed password
    cursor.execute("SELECT password_hash FROM user_account WHERE EID = %s", (current_user_id,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Verify old password
    if not bcrypt.checkpw(old_pw.encode(), user["password_hash"].encode()):
        return jsonify({"error": "Incorrect current password"}), 401

    # Hash new password
    hashed_new = bcrypt.hashpw(new_pw.encode(), bcrypt.gensalt()).decode()

    cursor.execute("""
        UPDATE user_account
        SET password_hash = %s
        WHERE EID = %s
    """, (hashed_new, current_user_id))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Password updated successfully!"}), 200
