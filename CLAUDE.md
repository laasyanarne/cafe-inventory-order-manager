# CLAUDE.md — Cafe Inventory & Order Manager

## Required Skill

Before making frontend design or UI changes, invoke the `frontend-design` skill.

Use it for:
- visual design audits
- layout redesigns
- typography decisions
- spacing systems
- dashboard polish
- table/form refinement
- full-site UI consistency reviews

## Project Overview

This project began as a Virginia Tech Computer Science class project for a local Blacksburg coffee shop (Halwa Bakery & Cafe).

The application is a full-stack business operations platform used to manage:

* Menu Items
* Inventory
* Ingredients
* Transactions
* Employees
* Customers
* Shifts
* Reports & Analytics

The goal is to transform this from a functional class project into a portfolio-quality business operations platform that resembles a modern SaaS dashboard.

---

# Technology Stack

Frontend:

* React
* React Router
* Axios
* Recharts

Backend:

* Flask
* Python

Database:

* MySQL

Version Control:

* Git
* GitHub

---

# Primary Goal

Improve:

1. User Experience
2. Visual Design
3. Information Architecture
4. Responsiveness
5. Accessibility
6. Code Quality

while preserving existing business functionality.

Do not rewrite working business logic unless necessary.

---

# Product Vision

This should feel like:

* Shopify Admin
* Toast POS
* Square Dashboard
* Stripe Dashboard
* Linear
* Notion

This should NOT feel like:

* A class project
* A database viewer
* A collection of CRUD pages
* A collection of unrelated forms

The application should feel like a unified business operations platform.

---

# Core Design Principles

## Visual Style

Design characteristics:

* Clean
* Professional
* Minimal
* Data-focused
* Fast to scan
* Consistent spacing
* Strong visual hierarchy
* Modern dashboard aesthetic

Avoid:

* Random colors
* Giant buttons
* Excessive gradients
* Overly playful UI
* Inconsistent spacing
* Card spam
* Student project appearance

---

# Information Architecture

The current application exposes database entities as navigation items.

This is a problem.

Navigation should be workflow-oriented rather than database-oriented.

## Preferred Navigation Structure

Dashboard

Sales

* Transactions
* Customers

Inventory

* Item Catalog
* Stock Levels
* Ingredients

Menu

Team

* Employees
* Shifts

Reports

Settings (future)

---

# Navigation Rules

Prefer:

* Sidebar navigation
* Persistent navigation
* Active route indicators
* Expandable sections
* Collapsible groups

Avoid:

* Crowded top navigation
* Excessive top-level pages
* Flat navigation structures

---

# Dashboard Rules

Dashboard should be the default landing page.

Dashboard should surface:

* Revenue KPI
* Average Transaction KPI
* Customer KPI
* Inventory Alerts
* Low Stock Items
* Revenue Trends
* Recent Activity

Dashboard should answer:

"What does the business need attention on today?"

---

# Reports Rules

Dashboard and Reports are not the same thing.

Dashboard:

* Operational
* Current-state focused
* Quick insights

Reports:

* Historical analysis
* Trends
* Employee performance
* Business analytics

Do not mix both concerns into a single page.

---

# Inventory Rules

Inventory-related functionality should feel like one workflow.

Prefer grouping:

* Inventory
* Stock Levels
* Ingredients

under one Inventory section.

Avoid exposing each inventory table as a separate top-level navigation item.

---

# Tables

All data-heavy pages should eventually support:

* Search
* Sorting
* Filtering
* Empty states
* Consistent row actions

Pages include:

* Products
* Inventory
* Ingredients
* Employees
* Customers
* Transactions

Prefer tables over large collections of cards.

---

# Forms

All forms should:

* Use consistent spacing
* Use consistent labels
* Display validation clearly
* Display errors clearly

Prefer reusable form patterns.

---

# Existing Architecture Notes

Current known architecture:

* AppShell exists and should become the primary layout system
* Navbar is legacy architecture
* ReportsPage currently acts as both dashboard and reports
* EmployeeReportPage duplicates reporting functionality
* Inventory, Stocks, and Ingredients belong to the same domain
* Customers belongs conceptually under Sales
* Shifts belongs conceptually under Team

Use these observations when planning changes.

---

# Development Rules

## Before Editing

Always:

1. Analyze impacted files
2. Explain planned changes
3. List files to be modified
4. Identify risks
5. Explain testing approach

Do not immediately edit code.

---

## Change Scope Rules

Implement changes in phases.

Avoid:

* Massive rewrites
* Multi-phase implementations
* Large refactors combined with redesigns

Prefer:

* Small, testable changes
* One phase at a time
* One architectural concern at a time

---

# Verification Requirements

After any code modification:

1. Determine how the application should be started
2. Run the application locally
3. Verify the frontend compiles
4. Verify routing still works
5. Verify authentication still works
6. Verify there are no new console errors
7. Verify there are no build errors
8. Fix discovered issues before ending the task

Always report:

* Files modified
* Commands executed
* Errors encountered
* Errors fixed
* Remaining concerns

Do not consider a task complete until the application runs successfully.

---

# Code Quality Rules

Prefer:

* Reusable components
* Clean React patterns
* Consistent naming
* Smaller focused components
* Shared styling systems

Avoid:

* Massive files
* Duplicate CSS
* Duplicate logic
* Inline styles unless justified
* Repeated API logic

---

# Cleanup Rules

Identify:

* Dead code
* Unused components
* Duplicate CSS
* Unused imports
* Unused routes

Before deleting anything:

1. Verify it is unused
2. Show evidence
3. Explain impact
4. Ask for approval

Do not delete files automatically.

---

# Portfolio Quality Standard

Every change should move the project closer to something that could be shown to:

* Product Managers
* Engineering Managers
* Recruiters
* Technical Program Managers
* Business Analysts

Before finalizing any design decision, ask:

"Would this look believable in a real business application?"

If not, improve it.

---

# Current Priorities

Priority 1:

* AppShell adoption
* Sidebar navigation
* Information architecture redesign

Priority 2:

* Dashboard landing page

Priority 3:

* Inventory workflow consolidation

Priority 4:

* Reports redesign

Priority 5:

* Table modernization

Priority 6:

* Form consistency

Priority 7:

* Responsive design

---

# Important

Do not rewrite backend code unless required.

Do not modify the database schema unless required.

Preserve:

* Existing APIs
* Existing authentication
* Existing CRUD functionality

Focus primarily on frontend architecture, user experience, and product design.
