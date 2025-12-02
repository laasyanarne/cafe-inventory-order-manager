# Cafe Inventory & Order Manager

We created a database/system that supports internal business operations for a local Blacksburg coffee shop, Halwa. 
The system will is designed to manage key processes such as order and menu management, employee and customer 
management, ingredient inventory, low-stock alerts, sales analytics, and more.

---

## Features

- Auth
  - Employee signup / login
  - Manager vs employee roles
  - Change-password flow

- Menu & Products
  - Create, edit, and delete products
  - Track price and stock

- Ingredients & Inventory
  - Manage ingredients list
  - Inventory cards with temperature + storage location
  - Edit / delete inventory entries

- Stocks
  - Associate employees with ingredients they handle
  - Edit / delete stock records

- Employees & Shifts
  - Employee management (add, edit, promote/demote, delete)
  - Shift scheduling with start/end times
  - Employee shift summary table + chart

- Customers & Transactions
  - Simple customer list
  - Transaction history with line items
  - Metrics like total revenue and average transaction value

- Reports
  - Employee shift analytics
  - Revenue and pricing KPIs
  - Customer transaction count

---

## Tech Stack

- Frontend: React + Vite
- Styling: Plain CSS + inline styles
- Backend: Node.js / Express
- Database: MySQL
- Other: Axios-style API helper, Recharts


