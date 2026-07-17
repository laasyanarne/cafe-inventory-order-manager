"""
seed_production.py — safe, idempotent production seed

Creates all tables (IF NOT EXISTS) and inserts portfolio-safe demo data.
Run against a fresh Aiven MySQL database before launching the app.

Usage (from repo root):
    python server/scripts/seed_production.py

All connection details are read from environment variables (DB_HOST, DB_PORT,
DB_USER, DB_PASS, DB_NAME) or a .env file in the project root.

Safe to run multiple times — checks for existing rows before inserting.
"""

import os
import sys
import random
from datetime import datetime, timedelta

_here   = os.path.dirname(os.path.abspath(__file__))
_server = os.path.dirname(_here)
if _server not in sys.path:
    sys.path.insert(0, _server)

from dotenv import load_dotenv
from db import get_connection

load_dotenv()


# ── Schema ────────────────────────────────────────────────────────────────────

SCHEMA_STATEMENTS = [
    """
    CREATE TABLE IF NOT EXISTS employee (
        EID           INT          NOT NULL,
        Name          VARCHAR(100) NOT NULL,
        Wages         DECIMAL(10,2) DEFAULT 0.00,
        Time_off      INT           DEFAULT 0,
        Contact       VARCHAR(255),
        Employee_since DATE,
        PRIMARY KEY (EID)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
    CREATE TABLE IF NOT EXISTS user_account (
        EID           INT          NOT NULL,
        email         VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        Access_level  VARCHAR(20)  DEFAULT 'staff',
        PRIMARY KEY (EID),
        UNIQUE KEY uk_email (email),
        CONSTRAINT fk_ua_emp FOREIGN KEY (EID) REFERENCES employee (EID)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
    CREATE TABLE IF NOT EXISTS customer (
        CID     INT          NOT NULL,
        Name    VARCHAR(100) NOT NULL,
        Contact VARCHAR(255) NOT NULL,
        PRIMARY KEY (CID)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
    CREATE TABLE IF NOT EXISTS products (
        id               INT            NOT NULL AUTO_INCREMENT,
        name             VARCHAR(255)   NOT NULL,
        description      TEXT,
        price            DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
        stock            INT            DEFAULT 0,
        unit             VARCHAR(50)    DEFAULT 'unit',
        par_level        INT            DEFAULT 0,
        supplier_name    VARCHAR(255),
        category         VARCHAR(100),
        last_restocked_at DATETIME,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
    CREATE TABLE IF NOT EXISTS ingredients (
        Ing_ID       INT            NOT NULL,
        item_name    VARCHAR(255)   NOT NULL,
        quantity     DECIMAL(10,3)  DEFAULT 0.000,
        min_quantity DECIMAL(10,3)  DEFAULT 0.000,
        unit         VARCHAR(50),
        PRIMARY KEY (Ing_ID)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
    CREATE TABLE IF NOT EXISTS product_ingredients (
        product_id    INT           NOT NULL,
        ingredient_id INT           NOT NULL,
        qty_per_serve DECIMAL(8,3)  NOT NULL,
        PRIMARY KEY (product_id, ingredient_id),
        CONSTRAINT fk_pi_prod FOREIGN KEY (product_id)    REFERENCES products    (id)     ON DELETE CASCADE,
        CONSTRAINT fk_pi_ing  FOREIGN KEY (ingredient_id) REFERENCES ingredients (Ing_ID)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
    CREATE TABLE IF NOT EXISTS transactions (
        txn_id      INT          NOT NULL,
        CID         INT,
        status      VARCHAR(20)  DEFAULT 'queued',
        order_note  VARCHAR(255),
        created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        PRIMARY KEY (txn_id),
        CONSTRAINT fk_txn_cid FOREIGN KEY (CID) REFERENCES customer (CID) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
    CREATE TABLE IF NOT EXISTS transaction_items (
        id         INT NOT NULL AUTO_INCREMENT,
        txn_id     INT NOT NULL,
        product_id INT NOT NULL,
        Quantity   INT NOT NULL DEFAULT 1,
        PRIMARY KEY (id),
        CONSTRAINT fk_ti_txn  FOREIGN KEY (txn_id)     REFERENCES transactions (txn_id)  ON DELETE CASCADE,
        CONSTRAINT fk_ti_prod FOREIGN KEY (product_id) REFERENCES products     (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
    CREATE TABLE IF NOT EXISTS shifts (
        EID        INT  NOT NULL,
        Start_Time TIME NOT NULL,
        End_Time   TIME NOT NULL,
        PRIMARY KEY (EID, Start_Time),
        CONSTRAINT fk_shift_emp FOREIGN KEY (EID) REFERENCES employee (EID) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
    CREATE TABLE IF NOT EXISTS inventory (
        Inv_ID           INT          NOT NULL AUTO_INCREMENT,
        Temperature      VARCHAR(50),
        Storage_location VARCHAR(255),
        PRIMARY KEY (Inv_ID)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
]


# ── Demo data ─────────────────────────────────────────────────────────────────

PRODUCTS = [
    # (name, description, price, stock, unit, par_level, supplier, category)
    ("Espresso",         "Double shot of house espresso",            3.50,  80, "cup",   30, "Blue Bottle Coffee",    "Coffee"),
    ("Cappuccino",       "Espresso with steamed milk and foam",      5.00,  60, "cup",   20, "Blue Bottle Coffee",    "Coffee"),
    ("Latte",            "Espresso with steamed whole milk",         5.50,  75, "cup",   25, "Blue Bottle Coffee",    "Coffee"),
    ("Iced Latte",       "Espresso over ice with cold milk",         6.00,  70, "cup",   20, "Blue Bottle Coffee",    "Coffee"),
    ("Cold Brew",        "Slow-steeped cold brew, 12-hour brew",     5.50,  50, "cup",   15, "Blue Bottle Coffee",    "Coffee"),
    ("Flat White",       "Ristretto shots with microfoam",           5.00,  55, "cup",   18, "Blue Bottle Coffee",    "Coffee"),
    ("Matcha Latte",     "Ceremonial matcha with steamed oat milk",  6.00,  45, "cup",   15, "Ippodo Tea Co.",        "Tea"),
    ("Chai Latte",       "Spiced masala chai with steamed milk",     5.50,  50, "cup",   18, "Ippodo Tea Co.",        "Tea"),
    ("Green Tea",        "Sencha loose-leaf green tea",              4.00,  40, "cup",   12, "Ippodo Tea Co.",        "Tea"),
    ("Earl Grey",        "Bergamot-scented black tea",               4.00,  35, "cup",   12, "Ippodo Tea Co.",        "Tea"),
    ("Croissant",        "Butter croissant, baked in-house daily",   4.50,  30, "pcs",   12, "Halwa Bakery",          "Bakery"),
    ("Almond Croissant", "Twice-baked with almond frangipane",       5.00,  24, "pcs",   10, "Halwa Bakery",          "Bakery"),
    ("Blueberry Muffin", "Wild blueberry muffin with streusel top",  3.50,  24, "pcs",   10, "Halwa Bakery",          "Bakery"),
    ("Banana Bread",     "Slice of house banana bread",              3.75,  18, "pcs",    8, "Halwa Bakery",          "Bakery"),
    ("Cinnamon Roll",    "Warm cinnamon roll with cream cheese glaze",5.50, 20, "pcs",    8, "Halwa Bakery",          "Bakery"),
    ("Avocado Toast",    "Sourdough, smashed avocado, chili flakes", 9.00,  25, "plate",  8, "Local Produce Co.",     "Food"),
    ("Egg Sandwich",     "Scrambled egg, cheddar on toasted brioche",8.50,  20, "plate",  8, "Local Produce Co.",     "Food"),
    ("Tiramisu",         "Classic espresso-soaked ladyfinger dessert",7.50, 15, "pcs",    6, "Halwa Bakery",          "Desserts"),
    ("Cheesecake Slice", "New York-style baked cheesecake",          6.50,  15, "pcs",    6, "Halwa Bakery",          "Desserts"),
    ("Still Water",      "Chilled still water, 500 ml",              2.50,  48, "bottle", 20, "Evian",                 "Drinks"),
    ("Sparkling Water",  "Carbonated mineral water, 500 ml",         3.00,  36, "bottle", 15, "Perrier",               "Drinks"),
    ("Fresh OJ",         "Cold-pressed orange juice, 300 ml",        5.00,  20, "cup",    8, "Local Produce Co.",     "Drinks"),
    ("Lemonade",         "House-made lemonade with fresh mint",      4.50,  20, "cup",    8, "Local Produce Co.",     "Drinks"),
    ("Hot Chocolate",    "Dark chocolate with steamed whole milk",   5.50,  30, "cup",   12, "Valrhona",              "Drinks"),
]

INGREDIENTS = [
    # (Ing_ID, item_name, quantity, min_quantity, unit)
    (1,  "Espresso Shots",   120, 40,  "oz"),
    (2,  "Whole Milk",       256, 64,  "oz"),
    (3,  "Oat Milk",         128, 32,  "oz"),
    (4,  "Matcha Powder",    500, 100, "g"),
    (5,  "Coffee Beans",    4000, 800, "g"),
    (6,  "Chai Concentrate",  96, 24,  "oz"),
    (7,  "Green Tea Bags",    80, 20,  "pcs"),
    (8,  "Earl Grey Bags",    60, 15,  "pcs"),
    (9,  "Croissant pcs",     30, 12,  "pcs"),
    (10, "Almond Croisst pcs",24, 10,  "pcs"),
    (11, "Muffin pcs",        24, 10,  "pcs"),
    (12, "Banana Bread slc",  18,  8,  "pcs"),
    (13, "Cinnamon Roll pcs", 20,  8,  "pcs"),
    (14, "Sourdough Slices",  30, 10,  "slices"),
    (15, "Avocado",           20,  6,  "pcs"),
    (16, "Eggs",              48, 12,  "pcs"),
    (17, "Brioche Bun",       20,  8,  "pcs"),
    (18, "Tiramisu pcs",      15,  6,  "pcs"),
    (19, "Cheesecake pcs",    15,  6,  "pcs"),
    (20, "Bottled Water",     48, 20,  "bottles"),
    (21, "Sparkling Water",   36, 15,  "bottles"),
    (22, "Orange Juice",      20,  8,  "cups"),
    (23, "Lemon Juice",       32, 10,  "oz"),
    (24, "Dark Chocolate",   500, 100, "g"),
]

# (product_index_0based, ingredient_id, qty_per_serve)
RECIPES = [
    (0,  1, 2.0), (0,  2, 0.0),  # Espresso: 2 oz shots
    (1,  1, 2.0), (1,  2, 4.0),  # Cappuccino: shots + milk
    (2,  1, 2.0), (2,  2, 8.0),  # Latte: shots + milk
    (3,  1, 2.0), (3,  2, 6.0),  # Iced Latte
    (4,  5, 40.0),               # Cold Brew: beans
    (5,  1, 2.0), (5,  2, 4.0),  # Flat White
    (6,  4, 4.0), (6,  3, 8.0),  # Matcha Latte: matcha + oat milk
    (7,  6, 4.0), (7,  2, 6.0),  # Chai Latte
    (8,  7, 1.0), (8,  2, 0.0),  # Green Tea
    (9,  8, 1.0), (9,  2, 0.0),  # Earl Grey
    (10,  9, 1.0),               # Croissant
    (11, 10, 1.0),               # Almond Croissant
    (12, 11, 1.0),               # Blueberry Muffin
    (13, 12, 1.0),               # Banana Bread
    (14, 13, 1.0),               # Cinnamon Roll
    (15, 14, 2.0), (15, 15, 0.5),# Avocado Toast: bread + avo
    (16, 16, 2.0), (16, 17, 1.0),# Egg Sandwich: eggs + bun
    (17, 18, 1.0),               # Tiramisu
    (18, 19, 1.0),               # Cheesecake
    (19, 20, 1.0),               # Still Water
    (20, 21, 1.0),               # Sparkling Water
    (21, 22, 1.0),               # Fresh OJ
    (22, 23, 4.0),               # Lemonade
    (23, 24, 30.0),(23, 2, 8.0), # Hot Chocolate
]

CUSTOMERS = [
    (1, "Alex Rivera",    "alex.rivera@email.com"),
    (2, "Sam Chen",       "sam.chen@email.com"),
    (3, "Jordan Park",    "jordan.park@email.com"),
    (4, "Taylor Morgan",  "555-0147"),
    (5, "Casey Williams", "casey.w@email.com"),
    (6, "Drew Okafor",    "555-0231"),
    (7, "Morgan Lee",     "morgan.lee@email.com"),
    (8, "Quinn Adams",    "q.adams@email.com"),
    (9, "Avery Singh",    "avery.singh@email.com"),
    (10,"Riley Torres",   "555-0398"),
]

EMPLOYEES = [
    # (EID, name, wages, time_off, contact, since)
    (1, "Jamie Raines",   16.50, 5, "jraines@halwacafe.com",   "2022-03-01"),
    (2, "Sam Okafor",     14.75, 8, "sokafor@halwacafe.com",   "2022-07-15"),
    (3, "Priya Nair",     15.00, 6, "pnair@halwacafe.com",     "2023-01-10"),
    (4, "Marcus Webb",    14.50, 4, "mwebb@halwacafe.com",     "2023-04-20"),
    (5, "Chloe Tran",     15.25, 7, "ctran@halwacafe.com",     "2023-09-05"),
    (6, "Devon Ellis",    18.00, 10,"dellis@halwacafe.com",    "2021-11-01"),
]

SHIFTS = [
    # (eid, start_time, end_time)
    (1, "07:00:00", "15:00:00"),
    (2, "08:00:00", "16:00:00"),
    (3, "06:30:00", "14:30:00"),
    (4, "14:00:00", "22:00:00"),
    (5, "15:00:00", "21:00:00"),
    (6, "07:00:00", "15:00:00"),
]


def apply_schema(cursor, conn):
    print("Applying schema …")
    for stmt in SCHEMA_STATEMENTS:
        cursor.execute(stmt)
    conn.commit()
    print("  Schema ready.")


def seed_products(cursor, conn):
    cursor.execute("SELECT COUNT(*) AS n FROM products")
    if cursor.fetchone()["n"] > 0:
        print("  Products already seeded — skipping.")
        return

    print("  Inserting products …")
    for p in PRODUCTS:
        cursor.execute(
            """INSERT INTO products
               (name, description, price, stock, unit, par_level, supplier_name, category)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
            p
        )
    conn.commit()
    print(f"    {len(PRODUCTS)} products inserted.")


def seed_ingredients(cursor, conn):
    cursor.execute("SELECT COUNT(*) AS n FROM ingredients")
    if cursor.fetchone()["n"] > 0:
        print("  Ingredients already seeded — skipping.")
        return

    print("  Inserting ingredients …")
    for ing in INGREDIENTS:
        cursor.execute(
            "INSERT INTO ingredients (Ing_ID, item_name, quantity, min_quantity, unit) "
            "VALUES (%s, %s, %s, %s, %s)",
            ing
        )
    conn.commit()
    print(f"    {len(INGREDIENTS)} ingredients inserted.")


def seed_recipes(cursor, conn):
    cursor.execute("SELECT COUNT(*) AS n FROM product_ingredients")
    if cursor.fetchone()["n"] > 0:
        print("  Recipes already seeded — skipping.")
        return

    # Load product IDs in insertion order
    cursor.execute("SELECT id FROM products ORDER BY id")
    product_ids = [row["id"] for row in cursor.fetchall()]
    if not product_ids:
        print("  No products — skipping recipes.")
        return

    print("  Inserting recipes …")
    count = 0
    for (prod_idx, ing_id, qty) in RECIPES:
        if prod_idx >= len(product_ids):
            continue
        pid = product_ids[prod_idx]
        # Skip zero-qty placeholder rows
        if qty == 0.0:
            continue
        cursor.execute(
            "INSERT IGNORE INTO product_ingredients (product_id, ingredient_id, qty_per_serve) "
            "VALUES (%s, %s, %s)",
            (pid, ing_id, qty)
        )
        count += 1
    conn.commit()
    print(f"    {count} recipe rows inserted.")


def seed_customers(cursor, conn):
    cursor.execute("SELECT COUNT(*) AS n FROM customer")
    if cursor.fetchone()["n"] > 0:
        print("  Customers already seeded — skipping.")
        return

    print("  Inserting customers …")
    for cust in CUSTOMERS:
        cursor.execute(
            "INSERT INTO customer (CID, Name, Contact) VALUES (%s, %s, %s)", cust
        )
    conn.commit()
    print(f"    {len(CUSTOMERS)} customers inserted.")


def seed_employees(cursor, conn):
    cursor.execute("SELECT COUNT(*) AS n FROM employee")
    if cursor.fetchone()["n"] > 0:
        print("  Employees already seeded — skipping.")
        return

    print("  Inserting employees …")
    for emp in EMPLOYEES:
        eid, name, wages, time_off, contact, since = emp
        cursor.execute(
            "INSERT INTO employee (EID, Name, Wages, Time_off, Contact, Employee_since) "
            "VALUES (%s, %s, %s, %s, %s, %s)",
            (eid, name, wages, time_off, contact, since)
        )
        # Create a placeholder login so FK constraint is satisfied later
        # (no real password — demo accounts are created by create_demo_accounts.py)
        # We don't create user_account rows here for staff; they log in only if invited.
    conn.commit()
    print(f"    {len(EMPLOYEES)} employee records inserted.")


def seed_shifts(cursor, conn):
    cursor.execute("SELECT COUNT(*) AS n FROM shifts")
    if cursor.fetchone()["n"] > 0:
        print("  Shifts already seeded — skipping.")
        return

    print("  Inserting shifts …")
    for eid, start, end in SHIFTS:
        cursor.execute(
            "INSERT IGNORE INTO shifts (EID, Start_Time, End_Time) VALUES (%s, %s, %s)",
            (eid, start, end)
        )
    conn.commit()
    print(f"    {len(SHIFTS)} shifts inserted.")


def seed_transactions(cursor, conn, target: int = 350):
    cursor.execute("SELECT COUNT(*) AS n FROM transactions")
    existing = cursor.fetchone()["n"]
    if existing >= target:
        print(f"  Transactions already seeded ({existing} rows) — skipping.")
        return

    cursor.execute("SELECT id FROM products ORDER BY id")
    product_ids = [row["id"] for row in cursor.fetchall()]
    if not product_ids:
        print("  No products — skipping transactions.")
        return

    cursor.execute("SELECT CID FROM customer")
    customer_ids = [row["CID"] for row in cursor.fetchall()]
    walk_in_weight = 0.40  # 40% walk-in

    # Weight products so coffee is more common
    weights = []
    cursor.execute("SELECT id, category FROM products ORDER BY id")
    cats = cursor.fetchall()
    for row in cats:
        if row["category"] in ("Coffee", "Tea"):
            weights.append(4)
        elif row["category"] == "Bakery":
            weights.append(3)
        else:
            weights.append(1)

    to_insert = target - existing
    print(f"  Inserting {to_insert} transactions …")

    cursor.execute("SELECT COALESCE(MAX(txn_id), 0) AS max_id FROM transactions")
    next_id = cursor.fetchone()["max_id"] + 1
    now = datetime.utcnow()

    for i in range(to_insert):
        # Spread across past 90 days with more weight to recent weeks
        days_ago = int(random.triangular(0, 90, 10))
        mins_ago = random.randint(0, 1440)
        created  = now - timedelta(days=days_ago, minutes=mins_ago)

        cid = None if (not customer_ids or random.random() < walk_in_weight) else random.choice(customer_ids)

        cursor.execute(
            "INSERT INTO transactions (txn_id, CID, status, created_at, completed_at) "
            "VALUES (%s, %s, 'completed', %s, %s)",
            (next_id, cid, created, created + timedelta(minutes=random.randint(3, 20)))
        )

        num_items = random.choices([1, 2, 3, 4], weights=[50, 30, 15, 5])[0]
        chosen = random.choices(product_ids, weights=weights, k=num_items)
        for pid in chosen:
            cursor.execute(
                "INSERT INTO transaction_items (txn_id, product_id, Quantity) VALUES (%s, %s, 1)",
                (next_id, pid)
            )

        next_id += 1
        if (i + 1) % 50 == 0:
            conn.commit()

    conn.commit()
    print(f"    {to_insert} transactions inserted.")


def main():
    print("Halwa Cafe — production seed")
    print("=" * 40)

    try:
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)
    except Exception as exc:
        print(f"ERROR: database connection failed — {exc}")
        sys.exit(1)

    try:
        apply_schema(cursor, conn)
        print("\nSeeding data:")
        seed_products(cursor, conn)
        seed_ingredients(cursor, conn)
        seed_recipes(cursor, conn)
        seed_customers(cursor, conn)
        seed_employees(cursor, conn)
        seed_shifts(cursor, conn)
        seed_transactions(cursor, conn, target=350)
    except Exception as exc:
        conn.rollback()
        print(f"\nERROR: {exc}")
        import traceback; traceback.print_exc()
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()

    print("\n" + "=" * 40)
    print("Seed complete.")
    print("\nNext step: run create_demo_accounts.py to add the two demo login accounts.")


if __name__ == "__main__":
    main()
