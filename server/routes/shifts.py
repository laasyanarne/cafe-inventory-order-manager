from flask import Blueprint, request, jsonify
from db import get_connection
from middleware import token_required, manager_required
from datetime import datetime, timedelta

shifts_bp = Blueprint('shifts', __name__)

def time_to_string(time_obj):
    """Convert time or timedelta object to string format"""
    if time_obj is None:
        return None
    if isinstance(time_obj, timedelta):
        # Convert timedelta to time string (HH:MM:SS)
        total_seconds = int(time_obj.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        seconds = total_seconds % 60
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    elif hasattr(time_obj, 'isoformat'):
        return time_obj.isoformat()
    else:
        return str(time_obj)

# GET all shifts
@shifts_bp.route("", methods=["GET"])
@token_required
def get_shifts(current_user_id):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT s.EID, s.Start_Time, s.End_Time, e.Name 
            FROM shifts s
            JOIN employee e ON s.EID = e.EID
            ORDER BY s.Start_Time DESC
        """)
        shifts = cursor.fetchall()
        cursor.close()
        conn.close()
        
        shift_list = []
        for shift in shifts:
            shift_list.append({
                'eid': shift['EID'],
                'start_time': time_to_string(shift['Start_Time']),
                'end_time': time_to_string(shift['End_Time']),
                'employee_name': shift['Name']
            })
        
        return jsonify(shift_list), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# CREATE shift
@shifts_bp.route("", methods=["POST"])
@manager_required
def create_shift(current_user_id):
    try:
        data = request.get_json()
        eid = data.get('eid')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        if not eid or not start_time or not end_time:
            return jsonify({'error': 'EID, start_time, and end_time are required'}), 400
        
        # Convert datetime-local format to time format
        # Input format: "2024-11-16T09:00" -> Extract time: "09:00:00"
        if 'T' in start_time:
            start_time = start_time.split('T')[1] + ':00'
        if 'T' in end_time:
            end_time = end_time.split('T')[1] + ':00'
        
        conn = get_connection()
        cursor = conn.cursor()
        
        # Check if employee exists
        cursor.execute("SELECT EID FROM employee WHERE EID = %s", (eid,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({'error': 'Employee not found'}), 404
        
        cursor.execute(
            "INSERT INTO shifts (EID, Start_Time, End_Time) VALUES (%s, %s, %s)",
            (eid, start_time, end_time)
        )
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Shift created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# UPDATE shift
@shifts_bp.route("/<int:eid>", methods=["PUT"])
@manager_required
def update_shift(current_user_id, eid):
    try:
        data = request.get_json()
        old_start_time = data.get('old_start_time')
        new_start_time = data.get('start_time')
        new_end_time = data.get('end_time')
        
        if not old_start_time or not new_start_time or not new_end_time:
            return jsonify({'error': 'Old start time, new start time, and end time are required'}), 400
        
        # Convert datetime-local format to time format if needed
        if 'T' in new_start_time:
            new_start_time = new_start_time.split('T')[1] + ':00'
        if 'T' in new_end_time:
            new_end_time = new_end_time.split('T')[1] + ':00'
        
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """UPDATE shifts 
               SET Start_Time = %s, End_Time = %s 
               WHERE EID = %s AND Start_Time = %s""",
            (new_start_time, new_end_time, eid, old_start_time)
        )
        
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Shift not found'}), 404
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Shift updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# DELETE shift
@shifts_bp.route("/<int:eid>/<start_time>", methods=["DELETE"])
@manager_required
def delete_shift(current_user_id, eid, start_time):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM shifts WHERE EID = %s AND Start_Time = %s",
            (eid, start_time)
        )
        
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Shift not found'}), 404
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Shift deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# GET all employees for dropdown
@shifts_bp.route("/employees", methods=["GET"])
@token_required
def get_employees_for_shifts(current_user_id):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT EID, Name FROM employee ORDER BY Name")
        employees = cursor.fetchall()
        cursor.close()
        conn.close()
        
        employee_list = []
        for emp in employees:
            employee_list.append({
                'eid': emp['EID'],
                'name': emp['Name']
            })
        
        return jsonify(employee_list), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500