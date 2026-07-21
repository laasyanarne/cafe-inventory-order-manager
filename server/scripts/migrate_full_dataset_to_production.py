"""
migrate_full_dataset_to_production.py -one-time full dataset migration

Replaces the production demo dataset with the complete original local dataset.
All customer and employee PII is anonymised before anything is written.
user_account rows are NEVER copied -only the two demo accounts are created.

Usage:
    python server/scripts/migrate_full_dataset_to_production.py --dry-run
    python server/scripts/migrate_full_dataset_to_production.py --execute

Required environment variables -source (local MySQL / Docker):
    SRC_DB_HOST     e.g. 127.0.0.1
    SRC_DB_PORT     e.g. 3307
    SRC_DB_USER
    SRC_DB_PASS
    SRC_DB_NAME     e.g. smallbiz
    SRC_DB_SSL_CA   (optional -leave blank for local Docker)

Required environment variables -destination (Aiven production):
    DST_DB_HOST     e.g. mysql-xxxxx.aivencloud.com
    DST_DB_PORT
    DST_DB_USER
    DST_DB_PASS
    DST_DB_NAME
    DST_DB_SSL_CA   (required for Aiven -raw PEM content or file path)

Safety gates:
    EXPECTED_AIVEN_HOST         must match DST_DB_HOST exactly
    ALLOW_PRODUCTION_DATA_REPLACE=true   required for --execute

Demo accounts (required for --execute):
    DEMO_MANAGER_PASSWORD
    DEMO_EMPLOYEE_PASSWORD

NEVER commit this script with credentials. Never print plaintext passwords.
Backup is written to ~/cafe_aiven_backup_<timestamp>.sql before any writes.
"""

import argparse
import datetime
import decimal
import os
import sys
import tempfile

_here = os.path.dirname(os.path.abspath(__file__))
_server = os.path.dirname(_here)
if _server not in sys.path:
    sys.path.insert(0, _server)

from dotenv import load_dotenv
import bcrypt
import mysql.connector

load_dotenv()


# ── Constants ──────────────────────────────────────────────────────────────────

CONFIRM_ENV = "ALLOW_PRODUCTION_DATA_REPLACE"
EXPECTED_HOST_ENV = "EXPECTED_AIVEN_HOST"

DEMO_USERS = [
    {
        "email": "manager@halwacafe.demo",
        "name": "Demo Manager",
        "access_level": "manager",
        "pw_env": "DEMO_MANAGER_PASSWORD",
    },
    {
        "email": "employee@halwacafe.demo",
        "name": "Demo Employee",
        "access_level": "staff",
        "pw_env": "DEMO_EMPLOYEE_PASSWORD",
    },
]

# Anonymisation pools -deterministic: same source ID always maps to same name.
_FIRST = [
    "Alex", "Sam", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Drew",
    "Quinn", "Avery", "Blake", "Cameron", "Devon", "Elliot", "Finley",
    "Harper", "Indigo", "Jamie", "Kai", "Lane", "Marlowe", "Noel",
    "Oakley", "Parker", "Reece", "Sage", "Tristan", "Uma", "Val", "Winter",
    "Xander", "Yara", "Zoe", "Ari", "Briar", "Corin",
]
_LAST = [
    "Rivera", "Chen", "Park", "Morgan", "Williams", "Okafor", "Lee",
    "Adams", "Singh", "Torres", "Martinez", "Kim", "Patel", "Johnson",
    "Garcia", "Brown", "Wilson", "Davis", "Taylor", "Anderson", "Thomas",
    "Jackson", "White", "Harris", "Martin", "Thompson", "Moore", "Young",
    "Allen", "Scott", "Walker", "Hall", "Lewis", "Robinson", "Clark",
    "Rodriguez", "Lewis", "Baker",
]

# FK-safe insertion order (no-dep tables first).
TABLES_IN_ORDER = [
    "inventory",
    "customer",
    "employee",
    "products",
    "ingredients",
    "product_ingredients",
    "transactions",
    "transaction_items",
    "shifts",
]
# Reverse for deletion (children before parents).
TABLES_DELETE_ORDER = list(reversed(TABLES_IN_ORDER)) + ["user_account"]

# Skipped source tables (legacy / not in production schema).
SKIP_TABLES = {"contains", "menu_items", "inventory_items", "stocks", "user_account"}


# ── Helpers ───────────────────────────────────────────────────────────────────

def abort(msg: str) -> None:
    print(f"\nABORT: {msg}")
    sys.exit(1)


def _require(name: str) -> str:
    v = os.getenv(name, "").strip()
    if not v:
        abort(f"Required environment variable {name!r} is not set.")
    return v


def _make_ssl_kwargs(raw: str) -> dict:
    """Return ssl kwargs for mysql.connector given PEM content or file path."""
    if not raw:
        return {}
    if os.path.isfile(raw):
        path = raw
    else:
        tmp = tempfile.NamedTemporaryFile(
            mode="w", suffix=".pem", delete=False, prefix="mig_ssl_"
        )
        tmp.write(raw)
        tmp.close()
        path = tmp.name
    return {"ssl_ca": path, "ssl_verify_cert": True, "ssl_verify_identity": True}


def connect(prefix: str, label: str):
    host = _require(f"{prefix}_DB_HOST")
    port = int(_require(f"{prefix}_DB_PORT"))
    user = _require(f"{prefix}_DB_USER")
    password = _require(f"{prefix}_DB_PASS")
    database = _require(f"{prefix}_DB_NAME")
    ssl_raw = os.getenv(f"{prefix}_DB_SSL_CA", "").strip()

    kwargs = dict(host=host, port=port, user=user, password=password, database=database)
    kwargs.update(_make_ssl_kwargs(ssl_raw))

    try:
        conn = mysql.connector.connect(**kwargs)
        conn.autocommit = False
        print(f"  Connected to {label}: {host}:{port}/{database}")
        return conn
    except Exception as exc:
        abort(f"Could not connect to {label}: {exc}")


def _timedelta_to_str(td) -> str:
    """MySQL TIME columns come back as datetime.timedelta -convert to HH:MM:SS."""
    if isinstance(td, datetime.timedelta):
        total = int(td.total_seconds())
        return f"{total // 3600:02d}:{(total % 3600) // 60:02d}:{total % 60:02d}"
    return str(td)


def _sql_literal(v) -> str:
    """Format a Python value as a safe SQL literal (for the backup file only)."""
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "1" if v else "0"
    if isinstance(v, (int,)):
        return str(v)
    if isinstance(v, decimal.Decimal):
        return str(v)
    if isinstance(v, float):
        return repr(v)
    if isinstance(v, datetime.datetime):
        return f"'{v.strftime('%Y-%m-%d %H:%M:%S')}'"
    if isinstance(v, datetime.date):
        return f"'{v.strftime('%Y-%m-%d')}'"
    if isinstance(v, datetime.timedelta):
        return f"'{_timedelta_to_str(v)}'"
    escaped = (
        str(v)
        .replace("\\", "\\\\")
        .replace("'", "\\'")
        .replace("\n", "\\n")
        .replace("\r", "\\r")
    )
    return f"'{escaped}'"


# ── Anonymisation ─────────────────────────────────────────────────────────────

def _anon_name(seed: int) -> str:
    first = _FIRST[seed % len(_FIRST)]
    last = _LAST[(seed * 7 + 3) % len(_LAST)]
    return f"{first} {last}"


def _anon_customer_contact(cid: int, original: str) -> str:
    if original and "@" in original:
        return f"customer{cid:03d}@example.com"
    return f"555-{cid:04d}"


def anonymise_customers(rows: list) -> list:
    return [
        {
            "CID": r["CID"],
            "Name": _anon_name(r["CID"]),
            "Contact": _anon_customer_contact(r["CID"], r["Contact"] or ""),
        }
        for r in rows
    ]


def anonymise_employees(rows: list) -> list:
    return [
        {
            "EID": r["EID"],
            "Name": _anon_name(r["EID"] + 1000),  # offset so emp names differ from customer names
            "Wages": r["Wages"],
            "Time_off": r["Time_off"],
            "Contact": f"staff{r['EID']:03d}@halwacafe.demo",
            "Employee_since": r["Employee_since"],
        }
        for r in rows
    ]


# ── Source reading ─────────────────────────────────────────────────────────────

def read_source(src_conn) -> dict:
    """Read all migration-relevant tables. Explicit column lists skip local-only columns."""
    cur = src_conn.cursor(dictionary=True)

    queries = {
        # Skip created_at (extra in local, not in production schema)
        "products": (
            "SELECT id, name, description, price, stock, unit, par_level, "
            "supplier_name, category, last_restocked_at "
            "FROM products ORDER BY id"
        ),
        "ingredients": (
            "SELECT Ing_ID, item_name, quantity, min_quantity, unit "
            "FROM ingredients ORDER BY Ing_ID"
        ),
        "product_ingredients": (
            "SELECT product_id, ingredient_id, qty_per_serve "
            "FROM product_ingredients ORDER BY product_id, ingredient_id"
        ),
        "customer": (
            "SELECT CID, Name, Contact FROM customer ORDER BY CID"
        ),
        # Skip manager_id (extra in local, not in production schema)
        "employee": (
            "SELECT EID, Name, Wages, Time_off, Contact, Employee_since "
            "FROM employee ORDER BY EID"
        ),
        "shifts": (
            "SELECT EID, Start_Time, End_Time FROM shifts ORDER BY EID, Start_Time"
        ),
        "inventory": (
            "SELECT Inv_ID, Temperature, Storage_location FROM inventory ORDER BY Inv_ID"
        ),
        "transactions": (
            "SELECT txn_id, CID, status, order_note, created_at, completed_at "
            "FROM transactions ORDER BY txn_id"
        ),
        # No id column in local transaction_items; production id is AUTO_INCREMENT
        "transaction_items": (
            "SELECT txn_id, product_id, Quantity FROM transaction_items ORDER BY txn_id, product_id"
        ),
    }

    data = {}
    for table, sql in queries.items():
        cur.execute(sql)
        data[table] = cur.fetchall()
        print(f"  {table:25s} {len(data[table]):>5} rows")

    cur.close()
    return data


# ── Validation ────────────────────────────────────────────────────────────────

def validate_source(data: dict) -> list:
    """Return list of error strings. Empty list = clean."""
    errors = []

    product_ids = {r["id"] for r in data["products"]}
    ingredient_ids = {r["Ing_ID"] for r in data["ingredients"]}
    customer_ids = {r["CID"] for r in data["customer"]}
    employee_ids = {r["EID"] for r in data["employee"]}
    txn_ids = {r["txn_id"] for r in data["transactions"]}

    for r in data["product_ingredients"]:
        if r["product_id"] not in product_ids:
            errors.append(f"product_ingredients: product_id {r['product_id']} not in products")
        if r["ingredient_id"] not in ingredient_ids:
            errors.append(f"product_ingredients: ingredient_id {r['ingredient_id']} not in ingredients")

    for r in data["transactions"]:
        if r["CID"] is not None and r["CID"] not in customer_ids:
            errors.append(f"transactions: CID {r['CID']} not in customer")

    for r in data["transaction_items"]:
        if r["txn_id"] not in txn_ids:
            errors.append(f"transaction_items: txn_id {r['txn_id']} not in transactions")
        if r["product_id"] not in product_ids:
            errors.append(f"transaction_items: product_id {r['product_id']} not in products")

    for r in data["shifts"]:
        if r["EID"] not in employee_ids:
            errors.append(f"shifts: EID {r['EID']} not in employee")

    for r in data["products"]:
        if not r["name"]:
            errors.append(f"products: id={r['id']} has NULL/empty name")

    return errors


# ── Backup ────────────────────────────────────────────────────────────────────

def backup_destination(dst_conn) -> str:
    """Dump all destination tables to ~/cafe_aiven_backup_<timestamp>.sql.
    Returns the file path. Aborts on failure."""
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = os.path.join(os.path.expanduser("~"), f"cafe_aiven_backup_{ts}.sql")

    cur = dst_conn.cursor()
    try:
        lines = [
            f"-- Aiven production backup -{ts}",
            "-- Generated by migrate_full_dataset_to_production.py",
            "-- Restore this file to roll back the migration.",
            "",
            "SET FOREIGN_KEY_CHECKS=0;",
            "",
        ]

        cur.execute("SHOW TABLES")
        tables = [row[0] for row in cur.fetchall()]

        for table in tables:
            cur.execute(f"SHOW CREATE TABLE `{table}`")
            create_row = cur.fetchone()
            create_sql = create_row[1]

            lines.append(f"-- Table: {table}")
            lines.append(f"DROP TABLE IF EXISTS `{table}`;")
            lines.append(create_sql + ";")
            lines.append("")

            cur.execute(f"SELECT * FROM `{table}`")
            col_names = [d[0] for d in cur.description]
            col_list = ", ".join(f"`{c}`" for c in col_names)
            rows = cur.fetchall()
            for row in rows:
                vals = ", ".join(_sql_literal(v) for v in row)
                lines.append(f"INSERT INTO `{table}` ({col_list}) VALUES ({vals});")
            lines.append("")

        lines.append("SET FOREIGN_KEY_CHECKS=1;")

        with open(backup_path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))

        print(f"  Backup written: {backup_path}")
        return backup_path

    except Exception as exc:
        abort(f"Backup failed -aborting to protect production data: {exc}")
    finally:
        cur.close()


# ── Dry-run report ────────────────────────────────────────────────────────────

def dry_run_report(data: dict) -> None:
    print("\n" + "=" * 60)
    print("DRY RUN -no destination changes will be made")
    print("=" * 60)

    print("\nPlanned destination row counts:")
    for table in TABLES_IN_ORDER:
        print(f"  {table:30s} {len(data[table]):>5}")
    print(f"  {'user_account':30s}     2  (demo accounts only)")

    customers = data["customer"]
    employees = data["employee"]
    email_contacts = sum(1 for r in customers if r.get("Contact") and "@" in r["Contact"])
    phone_contacts = len(customers) - email_contacts

    print("\nPrivacy sanitisation plan:")
    print(f"  customer.Name      {len(customers):>5} values -> fictional names")
    print(f"  customer.Contact   {len(customers):>5} values -> anonymised")
    print(f"                           ({email_contacts} email-format -> customerXXX@example.com)")
    print(f"                           ({phone_contacts} other format  -> 555-XXXX)")
    print(f"  employee.Name      {len(employees):>5} values -> fictional names")
    print(f"  employee.Contact   {len(employees):>5} values -> staffXXX@halwacafe.demo")
    print(f"  user_account       source rows will NOT be imported (0 rows)")
    print(f"                           (2 demo accounts from DEMO_*_PASSWORD env vars)")

    # Schema transformation notes
    print("\nSchema transformations:")
    print("  products.created_at      skipped (not in production schema)")
    print("  employee.manager_id      skipped (not in production schema)")
    print("  transaction_items.id     generated by AUTO_INCREMENT in destination")

    # Detect and report any NULL values in key columns
    null_warnings = []
    for r in data["transactions"]:
        if r["CID"] is None:
            null_warnings.append("transactions")
            break
    if null_warnings:
        print(f"\n  Note: some transactions have NULL CID (walk-in orders) -this is expected.")

    print("\nRun with --execute and ALLOW_PRODUCTION_DATA_REPLACE=true to apply.")


# ── Bulk insert helper ────────────────────────────────────────────────────────

def _bulk_insert(cur, table: str, columns: list, rows: list, batch_size: int = 200) -> None:
    """Send rows to destination in batches of batch_size using multi-row VALUES.
    One network round-trip per batch instead of one per row."""
    if not rows:
        return
    cols = ", ".join(f"`{c}`" for c in columns)
    row_ph = f"({', '.join(['%s'] * len(columns))})"
    for i in range(0, len(rows), batch_size):
        batch = rows[i : i + batch_size]
        placeholders = ", ".join([row_ph] * len(batch))
        flat = [v for row_tuple in batch for v in row_tuple]
        cur.execute(
            f"INSERT INTO `{table}` ({cols}) VALUES {placeholders}",
            flat,
        )


# ── Execute migration ─────────────────────────────────────────────────────────

def execute_migration(dst_conn, data: dict, demo_passwords: dict) -> bool:
    anon_customers = anonymise_customers(data["customer"])
    anon_employees = anonymise_employees(data["employee"])

    cur = dst_conn.cursor()
    try:
        # ── 1. Clear destination in child-first order ──────────────────────────
        print("\nClearing destination tables (DELETE within transaction)...")
        cur.execute("SET FOREIGN_KEY_CHECKS=0")
        for table in TABLES_DELETE_ORDER:
            cur.execute(f"DELETE FROM `{table}`")
            print(f"  Cleared {table}: {cur.rowcount} rows removed")
        cur.execute("SET FOREIGN_KEY_CHECKS=1")

        # ── 2. inventory ───────────────────────────────────────────────────────
        print("\nInserting (batched)...")
        _bulk_insert(cur, "inventory",
            ["Inv_ID", "Temperature", "Storage_location"],
            [(r["Inv_ID"], r["Temperature"], r["Storage_location"]) for r in data["inventory"]],
        )
        print(f"  inventory            {len(data['inventory']):>5} rows")

        # ── 3. customer (anonymised) ───────────────────────────────────────────
        _bulk_insert(cur, "customer",
            ["CID", "Name", "Contact"],
            [(r["CID"], r["Name"], r["Contact"]) for r in anon_customers],
        )
        print(f"  customer             {len(anon_customers):>5} rows (names+contacts anonymised)")

        # ── 4. employee (anonymised, manager_id skipped) ──────────────────────
        _bulk_insert(cur, "employee",
            ["EID", "Name", "Wages", "Time_off", "Contact", "Employee_since"],
            [
                (r["EID"], r["Name"], r["Wages"], r["Time_off"], r["Contact"], r["Employee_since"])
                for r in anon_employees
            ],
        )
        print(f"  employee             {len(anon_employees):>5} rows (names+contacts anonymised)")

        # ── 5. products (preserve id, created_at skipped) ─────────────────────
        _bulk_insert(cur, "products",
            ["id", "name", "description", "price", "stock", "unit",
             "par_level", "supplier_name", "category", "last_restocked_at"],
            [
                (r["id"], r["name"], r["description"], r["price"], r["stock"],
                 r["unit"], r["par_level"], r["supplier_name"], r["category"],
                 r["last_restocked_at"])
                for r in data["products"]
            ],
        )
        print(f"  products             {len(data['products']):>5} rows")

        # ── 6. ingredients ─────────────────────────────────────────────────────
        _bulk_insert(cur, "ingredients",
            ["Ing_ID", "item_name", "quantity", "min_quantity", "unit"],
            [(r["Ing_ID"], r["item_name"], r["quantity"], r["min_quantity"], r["unit"])
             for r in data["ingredients"]],
        )
        print(f"  ingredients          {len(data['ingredients']):>5} rows")

        # ── 7. product_ingredients ─────────────────────────────────────────────
        _bulk_insert(cur, "product_ingredients",
            ["product_id", "ingredient_id", "qty_per_serve"],
            [(r["product_id"], r["ingredient_id"], r["qty_per_serve"])
             for r in data["product_ingredients"]],
        )
        print(f"  product_ingredients  {len(data['product_ingredients']):>5} rows")

        # ── 8. transactions ────────────────────────────────────────────────────
        _bulk_insert(cur, "transactions",
            ["txn_id", "CID", "status", "order_note", "created_at", "completed_at"],
            [
                (r["txn_id"], r["CID"], str(r["status"]),
                 r["order_note"], r["created_at"], r["completed_at"])
                for r in data["transactions"]
            ],
        )
        print(f"  transactions         {len(data['transactions']):>5} rows")

        # ── 9. transaction_items (let AUTO_INCREMENT generate id) ──────────────
        _bulk_insert(cur, "transaction_items",
            ["txn_id", "product_id", "Quantity"],
            [(r["txn_id"], r["product_id"], r["Quantity"]) for r in data["transaction_items"]],
        )
        print(f"  transaction_items    {len(data['transaction_items']):>5} rows")

        # ── 10. shifts (TIME stored as timedelta — convert before sending) ──────
        _bulk_insert(cur, "shifts",
            ["EID", "Start_Time", "End_Time"],
            [
                (r["EID"], _timedelta_to_str(r["Start_Time"]), _timedelta_to_str(r["End_Time"]))
                for r in data["shifts"]
            ],
        )
        print(f"  shifts               {len(data['shifts']):>5} rows")

        # ── 11. Demo accounts (user_account) ───────────────────────────────────
        print("\nCreating demo accounts...")
        for user in DEMO_USERS:
            pw = demo_passwords[user["pw_env"]]
            pw_hash = bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

            cur.execute("SELECT COALESCE(MAX(EID), 0) + 1 AS next_eid FROM employee")
            next_eid = cur.fetchone()[0]

            cur.execute(
                "INSERT INTO employee (EID, Name, Wages, Time_off, Contact, Employee_since) "
                "VALUES (%s, %s, %s, %s, %s, CURDATE())",
                (next_eid, user["name"], 0.00, 0, user["email"]),
            )
            cur.execute(
                "INSERT INTO user_account (EID, email, password_hash, Access_level) "
                "VALUES (%s, %s, %s, %s)",
                (next_eid, user["email"], pw_hash, user["access_level"]),
            )
            print(f"  Created: {user['email']}  (EID={next_eid}, role={user['access_level']})")

        dst_conn.commit()
        print("\nCommit successful.")
        return True

    except Exception as exc:
        dst_conn.rollback()
        print(f"\nERROR during migration: {exc}")
        print("Rolled back - destination is unchanged.")
        return False

    finally:
        try:
            cur.execute("SET FOREIGN_KEY_CHECKS=1")
        except Exception:
            pass
        cur.close()


# ── Post-migration validation ─────────────────────────────────────────────────

def validate_destination(dst_conn, data: dict) -> bool:
    """Verify row counts, FK integrity, and PII removal. Returns True if all pass."""
    cur = dst_conn.cursor()
    errors = []

    print("\n" + "=" * 60)
    print("Post-migration validation")
    print("=" * 60)

    expected = {
        "products":            len(data["products"]),
        "ingredients":         len(data["ingredients"]),
        "product_ingredients": len(data["product_ingredients"]),
        "customer":            len(data["customer"]),
        "employee":            len(data["employee"]) + 2,   # +2 demo accounts
        "transactions":        len(data["transactions"]),
        "transaction_items":   len(data["transaction_items"]),
        "shifts":              len(data["shifts"]),
        "inventory":           len(data["inventory"]),
        "user_account":        2,
    }

    print("\nRow counts:")
    for table, exp in expected.items():
        cur.execute(f"SELECT COUNT(*) FROM `{table}`")
        actual = cur.fetchone()[0]
        ok = actual == exp
        mark = "OK" if ok else "FAIL"
        print(f"  [{mark}] {table:30s}  got {actual:>5}  expected {exp:>5}")
        if not ok:
            errors.append(f"{table}: expected {exp}, got {actual}")

    print("\nFK integrity checks:")
    checks = [
        (
            "Orphaned transaction_items (product_id)",
            "SELECT COUNT(*) FROM transaction_items ti "
            "LEFT JOIN products p ON ti.product_id = p.id WHERE p.id IS NULL",
        ),
        (
            "Orphaned transaction_items (txn_id)",
            "SELECT COUNT(*) FROM transaction_items ti "
            "LEFT JOIN transactions t ON ti.txn_id = t.txn_id WHERE t.txn_id IS NULL",
        ),
        (
            "Orphaned product_ingredients (product_id)",
            "SELECT COUNT(*) FROM product_ingredients pi "
            "LEFT JOIN products p ON pi.product_id = p.id WHERE p.id IS NULL",
        ),
        (
            "Orphaned product_ingredients (ingredient_id)",
            "SELECT COUNT(*) FROM product_ingredients pi "
            "LEFT JOIN ingredients i ON pi.ingredient_id = i.Ing_ID WHERE i.Ing_ID IS NULL",
        ),
        (
            "Orphaned shifts (EID)",
            "SELECT COUNT(*) FROM shifts s "
            "LEFT JOIN employee e ON s.EID = e.EID WHERE e.EID IS NULL",
        ),
    ]
    for label, sql in checks:
        cur.execute(sql)
        count = cur.fetchone()[0]
        mark = "OK" if count == 0 else "FAIL"
        print(f"  [{mark}] {label}: {count}")
        if count != 0:
            errors.append(f"{label}: {count} orphaned rows")

    print("\nPII and safety checks:")

    # user_account must contain ONLY demo accounts
    cur.execute("SELECT COUNT(*) FROM user_account WHERE email NOT LIKE '%@halwacafe.demo'")
    non_demo = cur.fetchone()[0]
    mark = "OK" if non_demo == 0 else "FAIL"
    print(f"  [{mark}] Non-demo rows in user_account: {non_demo} (expected 0)")
    if non_demo:
        errors.append(f"{non_demo} non-demo rows remain in user_account")

    # customer contacts must match our anonymisation patterns
    cur.execute(
        "SELECT COUNT(*) FROM customer "
        "WHERE Contact NOT LIKE '555-%' AND Contact NOT LIKE '%@example.com'"
    )
    pii_contacts = cur.fetchone()[0]
    mark = "OK" if pii_contacts == 0 else "FAIL"
    print(f"  [{mark}] Customer contacts with unexpected format: {pii_contacts} (expected 0)")
    if pii_contacts:
        errors.append(f"{pii_contacts} customer contacts in unexpected format")

    # employee contacts must be @halwacafe.demo
    cur.execute("SELECT COUNT(*) FROM employee WHERE Contact NOT LIKE '%@halwacafe.demo'")
    pii_emp = cur.fetchone()[0]
    mark = "OK" if pii_emp == 0 else "FAIL"
    print(f"  [{mark}] Employee contacts with unexpected format: {pii_emp} (expected 0)")
    if pii_emp:
        errors.append(f"{pii_emp} employee contacts in unexpected format")

    # AUTO_INCREMENT sanity
    print("\nAUTO_INCREMENT checks:")
    ai_checks = [
        ("products", "id"),
        ("inventory", "Inv_ID"),
        ("transaction_items", "id"),
    ]
    for table, id_col in ai_checks:
        cur.execute(f"SELECT MAX(`{id_col}`) FROM `{table}`")
        max_id = cur.fetchone()[0] or 0
        cur.execute(
            "SELECT AUTO_INCREMENT FROM information_schema.TABLES "
            "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s",
            (table,),
        )
        ai_val = cur.fetchone()[0] or 0
        ok = ai_val > max_id
        mark = "OK" if ok else "WARN"
        print(f"  [{mark}] {table}.AUTO_INCREMENT={ai_val}  MAX({id_col})={max_id}")

    cur.close()

    print()
    if not errors:
        print("All validation checks passed.")
        return True
    else:
        print(f"{len(errors)} validation error(s):")
        for e in errors:
            print(f"  - {e}")
        return False


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Migrate full local dataset to Aiven production (with PII anonymisation)."
    )
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--dry-run", action="store_true", help="Validate and report -no writes.")
    mode.add_argument("--execute", action="store_true", help="Run the migration.")
    args = parser.parse_args()

    print("=" * 60)
    print("Halwa Cafe -Full Dataset Production Migration")
    print("=" * 60)
    print()

    # ── Safety gates ──────────────────────────────────────────────────────────
    if args.execute:
        if os.getenv(CONFIRM_ENV, "").strip().lower() != "true":
            abort(
                f"{CONFIRM_ENV} must be set to 'true' to run in execute mode. "
                "This is a destructive operation -it will DELETE all existing "
                "destination data before inserting."
            )

    dst_host = _require("DST_DB_HOST")
    expected_host = _require(EXPECTED_HOST_ENV)
    if dst_host != expected_host:
        abort(
            f"DST_DB_HOST ({dst_host!r}) does not match "
            f"EXPECTED_AIVEN_HOST ({expected_host!r}). "
            "Update EXPECTED_AIVEN_HOST to the exact Aiven hostname before running."
        )

    # ── Demo passwords ────────────────────────────────────────────────────────
    demo_passwords: dict[str, str] = {}
    for user in DEMO_USERS:
        pw = os.getenv(user["pw_env"], "").strip()
        if args.execute:
            if not pw:
                abort(f"{user['pw_env']} must be set for execute mode.")
            if len(pw) < 8:
                abort(f"{user['pw_env']} must be at least 8 characters.")
        demo_passwords[user["pw_env"]] = pw

    # ── Connect ───────────────────────────────────────────────────────────────
    print("Connecting...")
    src_conn = connect("SRC", "source (local)")
    dst_conn = connect("DST", "destination")

    try:
        # ── Backup ────────────────────────────────────────────────────────────
        if args.execute:
            print("\nBacking up destination...")
            backup_path = backup_destination(dst_conn)
            print(f"  Backup complete: {backup_path}")
            print("  Keep this file until you have verified the migration.")

        # ── Read source ───────────────────────────────────────────────────────
        print("\nReading source database...")
        data = read_source(src_conn)

        # ── Validate source ───────────────────────────────────────────────────
        print("\nValidating source FK integrity...")
        errors = validate_source(data)
        if errors:
            for e in errors:
                print(f"  ERROR: {e}")
            abort(f"{len(errors)} source validation error(s) -will not proceed.")
        print("  Source validation passed.")

        # ── Dry run or execute ─────────────────────────────────────────────────
        if args.dry_run:
            dry_run_report(data)
        else:
            print("\nMigrating...")
            ok = execute_migration(dst_conn, data, demo_passwords)
            if not ok:
                sys.exit(1)
            validate_destination(dst_conn, data)

    finally:
        src_conn.close()
        dst_conn.close()


if __name__ == "__main__":
    main()
