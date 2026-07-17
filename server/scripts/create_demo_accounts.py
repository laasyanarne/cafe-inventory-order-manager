"""
create_demo_accounts.py — idempotent demo account setup

Usage:
    DEMO_MANAGER_PASSWORD=secret1 DEMO_EMPLOYEE_PASSWORD=secret2 \
        python server/scripts/create_demo_accounts.py

Reads DEMO_MANAGER_PASSWORD and DEMO_EMPLOYEE_PASSWORD from environment.
Reads DB connection from the same .env / environment as the Flask app.

Idempotency contract:
  - If an account already exists, it is left completely unchanged (no password
    update, no role update). Output: [exists].
  - If an account does not exist, it is created using the password from the
    environment variable. Output: [created].
  - DEMO_*_PASSWORD is only required when the account does not yet exist.
    If the account exists and the variable is unset, the script still succeeds.
  - If a new account must be created but the env var is missing, the script
    exits with code 1 so the build fails visibly rather than silently skipping.

Never prints plaintext passwords, hashes, or connection details.
"""

import os
import sys

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

    # Check existence BEFORE reading the env var or doing any bcrypt work.
    # Existing accounts are left completely unchanged — no password reset,
    # no role update. This makes the script safe to run on every deploy.
    cursor.execute("SELECT EID FROM user_account WHERE email = %s", (email,))
    existing = cursor.fetchone()

    if existing:
        eid = existing["EID"]
        return f"  [exists]   {email}  (EID={eid}) — already configured, no changes made"

    # Account does not exist yet — creation is required.
    # Only now is the env var read and the password hashed.
    password = os.getenv(user["pw_env"])
    if not password:
        raise EnvironmentError(
            f"Environment variable {user['pw_env']} is not set. "
            "It is required to create this demo account on first deploy. "
            "Set it in Render's Environment tab and redeploy."
        )
    if len(password) < 8:
        raise ValueError(f"{user['pw_env']} must be at least 8 characters.")

    pw_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    cursor.execute("SELECT COALESCE(MAX(EID), 0) + 1 AS next_eid FROM employee")
    eid = cursor.fetchone()["next_eid"]

    cursor.execute(
        "INSERT INTO employee (EID, Name, Wages, Time_off, Contact, Employee_since) "
        "VALUES (%s, %s, %s, %s, %s, CURDATE())",
        (eid, name, 0.00, 0, email),
    )
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

    exit_code = 0
    try:
        for user in DEMO_USERS:
            try:
                msg = upsert_demo_user(cursor, conn, user)
                print(msg)
            except (EnvironmentError, ValueError) as exc:
                print(f"  ERROR: {user['email']} — {exc}")
                exit_code = 1
                break
    finally:
        cursor.close()
        conn.close()

    print("-" * 40)
    if exit_code == 0:
        print("Done.")
    else:
        print("Failed — correct the error above and redeploy.")
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
