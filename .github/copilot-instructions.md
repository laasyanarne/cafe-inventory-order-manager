Purpose

This file gives AI coding agents just-enough, repo-specific context to be immediately productive.
Keep it short and actionable: architecture, key files, dev workflows, conventions, and integration points.

## Big picture

- Full‑stack app with two main parts:
  - Frontend: React + Vite (folder `client/`). Dev server runs on http://localhost:5173.
  - Backend: Flask API (folder `server/`) exposing endpoints under `/api/*` (see `server/app.py`).
  - Persistent store: MySQL; an init SQL file is present at `smallbiz.sql` and a `docker-compose.yml` brings up MySQL + phpMyAdmin.
- Data flow: UI uses `client/src/utils/api.js` (axios instance) to call `http://localhost:5001/api/*`. The backend uses blueprints in `server/routes/*.py` and connects to MySQL via `server/db.py`.

## Key files to inspect first

- `server/app.py` — Flask app, CORS settings, JWT secret, and blueprint registration.
- `server/db.py` — MySQL connection helper (uses env vars like DB_HOST/DB_PORT/DB_USER/DB_PASS/DB_NAME).
- `server/routes/` — individual API blueprints (products, employees, customers, transactions, reports, etc.).
- `server/middleware/auth.py` — auth decorator/jwt handling used across routes.
- `client/src/utils/api.js` — axios baseURL = `http://localhost:5001/api` and request interceptor that adds `Authorization: Bearer <token>` from localStorage.
- `client/src/context/AuthContext.jsx` — app-level auth state and how components expect tokens.
- `docker-compose.yml` and `smallbiz.sql` — used to bootstrap the MySQL DB locally (hosts port mapping: host 3307 -> container 3306; see compose file).

## Developer workflows (quick)

1. Frontend (dev):

   - In PowerShell from repo root:

     ```powershell
     cd client
     npm install
     npm run dev
     ```

   - Vite serves the app at http://localhost:5173 by default.

2. Backend (dev):

   - Create / activate a Python env, then:

     ```powershell
     cd server
     pip install -r requirements.txt
     # create a .env with DB_* values and JWT_SECRET or export env vars
     python app.py
     ```

   - By default the Flask app runs on port 5001. CORS is configured to allow the Vite origin.

3. Full local stack with DB (optional):

   - Start MySQL and phpMyAdmin via docker-compose (from repo root):

     ```powershell
     docker-compose up --build
     ```

   - Note: the compose file maps host port 3307 -> container 3306. If the backend runs on the host, set DB_HOST=localhost and DB_PORT=3307 in your `.env` so `server/db.py` connects correctly.

## Patterns & conventions (project-specific)

- Frontend uses a single shared axios instance (`client/src/utils/api.js`) — prefer this for all network calls so tokens and baseURL are consistent.
- Token storage: JWT token is stored in localStorage and attached via axios interceptor. Components expect a token and AuthContext to be present.
- Flask backend uses blueprints (one file per resource) under `server/routes/`. When adding new APIs, follow the existing blueprint pattern and register it in `server/app.py`.
- DB access is via `server/db.py` (mysql-connector). Use environment variables (no ORM/migrations present). If you modify schema, update `smallbiz.sql` or coordinate DB changes manually.

## Integration points / gotchas

- CORS: `server/app.py` allows only origin `http://localhost:5173` by default. Update if running frontend elsewhere.
- API base URL: `client/src/utils/api.js` is hardcoded to `http://localhost:5001/api` — update when deploying or when running backend on a different host/port.
- Docker vs host DB: When using compose, container name is `db` (other containers would connect to `db:3306`). Running backend on host requires pointing to the host-mapped port (3307) as noted above.
- Auth routes live under `/api/auth` (see `server/routes/auth.py`). Protect routes using `server/middleware/auth.py` standards.

## Quick examples (how code expects to be used)

- Fetch products in frontend:

  ```js
  import api from "../utils/api";
  const resp = await api.get('/products');
  ```

- Backend blueprint registration example: see `server/app.py` where blueprints are registered with `url_prefix='/api/<resource>'`.

## Testing & CI

- No automated tests or CI config found in the repo root; add tests close to code you change and follow the component patterns (React testing library / pytest) if you add test infra.

If anything here is unclear or you want more detail about a specific area (auth flow, DB schema, deployment), tell me which part and I’ll expand or add examples.
