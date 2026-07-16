# Halwa Cafe Operations Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack café management SaaS dashboard built as a senior capstone project. Covers the full operational loop of a specialty café — from taking orders and tracking inventory to scheduling staff and analysing revenue trends.

---

## Overview

Halwa Cafe Operations Platform is a role-aware business management system designed for small food-and-beverage venues. It replaces scattered spreadsheets and paper logs with a single, cohesive interface that a manager and their team can use side-by-side with different levels of access.

**Who it's for:** Café owners, managers, and front-of-house staff.

**Problems it solves:**
- No single place to track inventory stock levels and reorder thresholds
- Order flow managed verbally rather than through a visible queue
- Shift scheduling done in spreadsheets with no historical record
- No quick way to see which menu items are driving revenue
- Recipes not tied to inventory, so shortages aren't caught until service

---

## Features

### Dashboard
Real-time overview of business health. Displays active orders, inventory status, total revenue, average order value, a sales-trend sparkline, top-selling products, and a "Needs Attention" alert feed for low-stock or out-of-stock items.

### Order Center
Three-column Kanban board (Queued → Preparing → Ready) with one-click status transitions. Supports creating, editing, and completing orders. Includes a full historical transaction log with customer attribution and order totals.

### Inventory Management
Per-product stock tracking with configurable par levels and supplier fields. Colour-coded health indicators (In Stock / Low / Critical / Out of Stock) calculated relative to each item's par level. Slide-out detail drawer for inline stock adjustments without leaving the page.

### Recipe Management
Maps menu products to their inventory ingredients with per-serving quantities. Shows how many full servings each product can make given current stock, and flags the limiting ingredient. Supports adding, editing, and removing ingredient links from a searchable product list.

### Employee Scheduling
24-hour visual timeline board with draggable shift blocks per employee. Managers can create, edit, and delete shifts. A coverage bar shows total staff hours per time slot. Clicking an employee row opens a detail drawer with their profile, wage, and time-off balance.

### Customer Management
Full customer directory with contact details. Supports adding, editing, and deleting customer records. Customers are linked to transactions for order attribution.

### Reports & Analytics
Four reporting tabs — all data is all-time:

| Tab | Contents |
|-----|----------|
| **Sales** | Total revenue, average order value, revenue per customer, revenue by category, top products by revenue and quantity |
| **Menu** | Recipe coverage percentage, per-category breakdown, list of products missing recipes |
| **Inventory** | Ingredient stock health bar chart, out-of-stock and critical item lists |
| **Labor** | Shifts and hours per employee, estimated payroll (hours × hourly rate) |

### Role-Based Access Control
Two roles with different views of the same data — no separate applications to maintain.

### Mobile Responsive Design
Optimised at 390 px (iPhone), 768 px (tablet), and 1280 px+ (desktop). Sidebar collapses to a hamburger on small screens. Table columns hide gracefully on narrow viewports.

---

## Manager vs Employee Permissions

| Feature | Manager | Employee |
|---------|:-------:|:--------:|
| View Dashboard | ✅ | ✅ |
| Revenue & Avg Order KPIs | ✅ | — |
| Create / Edit Orders | ✅ | ✅ |
| Update Order Status | ✅ | ✅ |
| View Order History | ✅ | ✅ |
| View Inventory | ✅ | ✅ |
| Edit Stock Levels & Par | ✅ | — |
| View Recipes | ✅ | ✅ |
| Add / Edit Recipes | ✅ | — |
| View Menu Items | ✅ | ✅ |
| Add / Edit / Delete Menu Items | ✅ | — |
| View Customers | ✅ | ✅ |
| Add / Edit / Delete Customers | ✅ | — |
| View All Employees | ✅ | ✅ |
| Add / Edit / Delete Employees | ✅ | — |
| View Wages & Time-off | ✅ | — |
| View Schedule | ✅ | ✅ |
| Add / Edit / Delete Shifts | ✅ | — |
| View Reports | ✅ | — |
| Change Own Password | ✅ | ✅ |

---

## Tech Stack

**Frontend**
- [React 19](https://react.dev/) — component-based UI
- [Vite](https://vitejs.dev/) — build tooling and dev server
- [React Router v6](https://reactrouter.com/) — client-side routing
- [Recharts](https://recharts.org/) — sales-trend area chart
- [Lucide React](https://lucide.dev/) — icon set
- [Axios](https://axios-http.com/) — HTTP client

**Backend**
- [Flask](https://flask.palletsprojects.com/) — REST API
- [Flask-CORS](https://flask-cors.readthedocs.io/) — cross-origin headers
- [PyJWT](https://pyjwt.readthedocs.io/) — JWT token generation and validation
- [bcrypt](https://pypi.org/project/bcrypt/) — password hashing
- [mysql-connector-python](https://dev.mysql.com/doc/connector-python/en/) — DB driver
- [python-dotenv](https://pypi.org/project/python-dotenv/) — environment variable loading

**Database**
- MySQL 8 — relational schema with foreign-key constraints

**Infrastructure**
- Docker Compose — local MySQL container with persistent volume
- [Render](https://render.com) — free-tier Python web service (backend)
- [Vercel](https://vercel.com) — Hobby plan (frontend CDN)
- [Aiven](https://aiven.io) — free-tier managed MySQL (database)

---

## Architecture

```
Browser (React + Vite)          — Vercel Hobby (CDN)
        │
        │  HTTPS / JSON  (Axios)
        ▼
Flask REST API  (:PORT/api/*)   — Render Free Web Service
        │
        │  mysql-connector-python (TLS)
        ▼
MySQL 8                         — Aiven Free Tier (managed, TLS-only)
```

**Local development** replaces Render + Aiven with Flask dev server on `:5001` and a Docker-mapped MySQL container on `:3307`.

The frontend is a single-page application. All state is loaded from the API on mount; no server-side rendering. JWT tokens are stored in `localStorage` and attached to every request via an Axios request interceptor. The backend validates each token with `PyJWT` before executing any query. Role checks (`token_required` / `manager_required`) are Flask decorators applied per route.

---

## Database Overview

| Entity | Purpose |
|--------|---------|
| `products` | Menu items with name, description, price, stock, unit, par level, and supplier |
| `ingredients` | Raw ingredients tracked for inventory, with quantity and minimum par |
| `product_ingredients` | Junction table mapping products → ingredients with `qty_per_serve` |
| `customers` | Customer directory with name and contact info |
| `employee` | Staff records with name, wage, time-off balance, and start date |
| `user_account` | Login credentials (email + bcrypt hash) and access level per employee |
| `transactions` | Order headers with customer, status, and timestamps |
| `transaction_items` | Line items linking transactions to products with quantity and price |
| `shifts` | Scheduled work blocks with start/end time per employee |
| `inventory` | Storage location and temperature records for ingredient batches |

---

## Repository Structure

```
cafe-inventory-order-manager/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/         # Shared UI components (AppShell, OrderBoard, etc.)
│   │   ├── context/            # React context (AuthContext, ToastContext)
│   │   ├── pages/              # Page-level components (one per route)
│   │   ├── styles/             # Global CSS tokens and shared classes
│   │   └── utils/              # Axios instance and helpers
│   ├── .env.example
│   └── vite.config.js
├── server/                     # Flask backend
│   ├── routes/                 # One Blueprint per resource
│   ├── middleware/             # JWT auth decorators
│   ├── db.py                   # MySQL connection factory
│   └── app.py                  # App entry point + CORS config
├── docker-compose.yml          # MySQL 8 container
├── .env.example                # Environment variable template
└── README.md
```

---

## Portfolio Highlights

This project demonstrates end-to-end product engineering at a level beyond typical coursework:

- **Role-aware UI without two codebases** — a single React app re-renders based on the JWT role claim, hiding manager controls from employees while sharing the same layout and components. Changes to permissions propagate in one place.
- **Real RBAC at every layer** — `@manager_required` Flask decorators enforce permissions at the API level so the server never trusts the client's role claim alone.
- **Relational data with cross-table logic** — the recipe servings calculation joins four tables (`products`, `product_ingredients`, `ingredients`) and returns the limiting ingredient in a single query, mirroring production reporting patterns.
- **Operational completeness** — the app covers the full café workflow: order intake → kanban status flow → completed transaction log → inventory impact visibility → revenue reporting. No feature is a stub.
- **Demo-ready data** — seeded with 1,284 realistic transactions, 128 products with ingredient recipes, 10 employees, and a full shift schedule so every page renders meaningful data on first load.

---

## Live Demo

> The free demo backend (Render free tier) may take up to approximately one minute to wake after a period of inactivity. The app will display a "waking up" notice during this time — subsequent requests are fast.

## Screenshots

> _Screenshots to be added after deployment._

| Page | Preview |
|------|---------|
| Dashboard (Manager) | _(coming soon)_ |
| Dashboard (Employee) | _(coming soon)_ |
| Order Center — Kanban Board | _(coming soon)_ |
| Inventory — Stock Health | _(coming soon)_ |
| Recipe Library | _(coming soon)_ |
| Employee Schedule | _(coming soon)_ |
| Reports — Sales Tab | _(coming soon)_ |
| Mobile View (390 px) | _(coming soon)_ |

---

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker Desktop (for the MySQL container)

---

### 1 — Clone the repository

```bash
git clone https://github.com/your-username/cafe-inventory-order-manager.git
cd cafe-inventory-order-manager
```

---

### 2 — Database setup

Start the MySQL container:

```bash
docker compose up -d
```

The container exposes MySQL on port **3307** (mapped from the container's 3306) with the credentials in your `.env` file. On first run, Docker will create an empty `smallbiz` database. Apply your schema using any MySQL client (e.g., DBeaver, TablePlus, or `mysql -h 127.0.0.1 -P 3307 -u user -p smallbiz < schema.sql`).

---

### 3 — Backend setup

```bash
cd server
python -m venv .venv
# macOS / Linux
source .venv/bin/activate
# Windows
.venv\Scripts\activate

pip install -r requirements.txt
```

Copy the environment template and fill in your values:

```bash
cp ../.env.example ../.env
# Edit .env with your DB credentials and a generated SECRET_KEY
```

Start the Flask development server:

```bash
python app.py
# Runs on http://localhost:5001
```

---

### 4 — Frontend setup

```bash
cd client
cp .env.example .env    # default VITE_API_URL=http://localhost:5001/api is correct for local dev
npm install
npm run dev
# Runs on http://localhost:5173
```

---

### Required environment variables

**`/.env`** (root, used by Flask)

| Variable | Description |
|----------|-------------|
| `DB_HOST` | MySQL host (e.g. `127.0.0.1`) |
| `DB_PORT` | MySQL port (e.g. `3307` for the Docker mapping) |
| `DB_USER` | MySQL username |
| `DB_PASS` | MySQL password |
| `DB_NAME` | Database name (e.g. `smallbiz`) |
| `SECRET_KEY` | Long random string for JWT signing |

**`/client/.env`** (used by Vite)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Full base URL of the Flask API (e.g. `http://localhost:5001/api`) |

Generate a `SECRET_KEY`:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

---

## Demo Credentials

Once the database is seeded, two demo accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Manager | _(set in your seed data)_ | _(set in your seed data)_ |
| Employee | _(set in your seed data)_ | _(set in your seed data)_ |

> Demo credentials are not committed to this repository. Seed your own via the registration endpoint or by inserting directly into `user_account` with a bcrypt-hashed password.

---

## Security

- **`.env` is required** — the app will throw at startup if `SECRET_KEY` is missing.
- **No credentials are committed** — `.env`, `*.sql` dumps, and database volumes are all gitignored.
- **Passwords are bcrypt-hashed** — plaintext passwords are never stored or logged.
- **JWT tokens expire** — tokens are validated on every request; role claims are re-read from the DB on privileged routes.
- **CORS is scoped** — the API only accepts requests from the configured frontend origin.
- **SQL injection mitigation** — all queries use parameterised statements via `mysql-connector-python`.

---

## Future Improvements

- **Email notifications** — low-stock alerts delivered to the manager's inbox
- **POS integration** — connect to a physical point-of-sale terminal for automatic order ingestion
- **Multi-location support** — extend the schema to support multiple café branches under one account
- **Offline mode** — service worker cache for order creation when internet is spotty
- **Export to CSV/PDF** — downloadable shift schedules and sales reports
- **Automated ingredient deduction** — subtract `qty_per_serve` from stock when an order is marked complete
- **Dark mode** — respect `prefers-color-scheme` using the existing CSS token system
- **Unit and integration tests** — Pytest for Flask routes, Vitest for React components

---

## License

MIT License — see [LICENSE](LICENSE) for details.

```
MIT License

Copyright (c) 2026 Laasya Narne

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
