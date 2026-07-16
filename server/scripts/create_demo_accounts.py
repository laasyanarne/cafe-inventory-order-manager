"""
create_demo_accounts.py — idempotent demo account setup

Usage:
    DEMO_MANAGER_PASSWORD=secret1 DEMO_EMPLOYEE_PASSWORD=secret2 \
        python server/scripts/create_demo_accounts.py

Reads DEMO_MANAGER_PASSWORD and DEMO_EMPLOYEE_PASSWORD from environment.
Reads DB connection from the same .env / environment as the Flask app.
Never prints plaintext passwords.
Safe to run multiple times; updates existing accounts rather than duplicating.
"""

import os
import sys

# Allow running from repo root or from server/scripts/
_here = os.path.dirname(os.path.abspath(__file__))
_server = os.path.dirname(_here)
if _server not in sys.path:
    sys.path.insert(0, _server)

from dotenv import load_dotenv
import bcrypt
from db import get_connection

load_dotenv()


DEMO_USERS = [
    {
        "email": "manager@halwacafe.demo",
        "name":  "Demo Manager",
        "access_level": "manager",
        "pw_env": "DEMO_MANAGER_PASSWORD",
    },
    {
        "email": "employee@halwacafe.demo",
        "name":  "Demo Employee",
        "access_level": "staff",
        "pw_env": "DEMO_EMPLOYEE_PASSWORD",
    },
]


def upsert_demo_user(cursor, conn, user: dict) -> str:
    email        = user["email"]
    name         = user["name"]
    access_level = user["access_level"]
    password     = os.getenv(user["pw_env"])

    if not password:
        raise EnvironmentError(
            f"Environment variable {user['pw_env']} is not set. "
            "Set it before running this script."
        )
    if len(password) < 8:
        raise ValueError(
            f"{user['pw_env']} must be at least 8 characters."
        )

    pw_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    # Check if user_account already exists
    cursor.execute("SELECT EID FROM user_account WHERE email = %s", (email,))
    existing = cursor.fetchone()

    if existing:
        eid = existing["EID"]
        # Update password hash and role
        cursor.execute(
            "UPDATE user_account SET password_hash = %s, Access_level = %s WHERE EID = %s",
            (pw_hash, access_level, eid),
        )
        # Update name in employee record
        cursor.execute("UPDATE employee SET Name = %s WHERE EID = %s", (name, eid))
        conn.commit()
        return f"  [updated]  {email}  (EID={eid}, role={access_level})"
    else:
        # Allocate next EID
        cursor.execute("SELECT COALESCE(MAX(EID), 0) + 1 AS next_eid FROM employee")
        eid = cursor.fetchone()["next_eid"]

        # Create employee record
        cursor.execute(
            "INSERT INTO employee (EID, Name, Wages, Time_off, Contact, Employee_since) "
            "VALUES (%s, %s, %s, %s, %s, CURDATE())",
            (eid, name, 0.00, 0, email),
        )

        # Create login record
        cursor.execute(
            "INSERT INTO user_account (EID, email, password_hash, Access_level) "
            "VALUES (%s, %s, %s, %s)",
            (eid, email, pw_hash, access_level),
        )
        conn.commit()
        return f"  [created]  {email}  (EID={eid}, role={access_level})"


def main():
    print("Halwa Cafe — demo account setup")
    print("-" * 40)

    try:
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)
    except Exception as exc:
        print(f"ERROR: could not connect to database — {exc}")
        sys.exit(1)

    try:
        for user in DEMO_USERS:
            try:
                msg = upsert_demo_user(cursor, conn, user)
                print(msg)
            except (EnvironmentError, ValueError) as exc:
                print(f"  [skipped]  {user['email']} — {exc}")
    finally:
        cursor.close()
        conn.close()

    print("-" * 40)
    print("Done.")


if __name__ == "__main__":
    main()
