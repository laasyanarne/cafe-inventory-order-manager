import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/Navbar.css";

function Navbar() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  const toggleMenu = () => setOpen((prev) => !prev);

  const closeMenu = () => setOpen(false);

  return (
    <nav className="nav-container">
      <div className="nav-left">
        <span className="nav-logo">Halwa Bakery</span>
      </div>

      <div className="nav-right">
        {/* Desktop menu */}
        <ul className="nav-links">
          <li>
            <Link to="/products">Menu</Link>
          </li>
          <li>
            <Link to="/employees">Employees</Link>
          </li>
          <li>
            <Link to="/ingredients">Ingredients</Link>
          </li>
          <li>
            <Link to="/transactions">Transactions</Link>
          </li>
          <li>
            <Link to="/reports">Reports</Link>
          </li>
          <li>
            <Link to="/customers">Customers</Link>
          </li>
          <li>
            <Link to="/shifts">Shifts</Link>
          </li>
          <li>
            <Link to="/inventory">Inventory</Link>
          </li>
          <li>
            <Link to="/stocks">Stocks</Link>
          </li>
          <li>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </li>
        </ul>

        {/* Hamburger icon */}
        <div className="hamburger" onClick={toggleMenu}>
          <div className={`line ${open ? "open" : ""}`}></div>
          <div className={`line ${open ? "open" : ""}`}></div>
          <div className={`line ${open ? "open" : ""}`}></div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <ul className="mobile-menu">
          <li>
            <Link to="/products" onClick={closeMenu}>
              Menu
            </Link>
          </li>
          <li>
            <Link to="/employees" onClick={closeMenu}>
              Employees
            </Link>
          </li>
          <li>
            <Link to="/ingredients" onClick={closeMenu}>
              Ingredients
            </Link>
          </li>
          <li>
            <Link to="/transactions" onClick={closeMenu}>
              Transactions
            </Link>
          </li>
          <li>
            <Link to="/reports" onClick={closeMenu}>
              Reports
            </Link>
          </li>
          <li>
            <Link to="/customers" onClick={closeMenu}>
              Customers
            </Link>
          </li>
          <li>
            <Link to="/shifts" onClick={closeMenu}>
              Shifts
            </Link>
          </li>
          <li>
            <Link to="/inventory" onClick={closeMenu}>
              Inventory
            </Link>
          </li>
          <li>
            <Link to="/stocks" onClick={closeMenu}>
              Stocks
            </Link>
          </li>
          <li>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
}

export default Navbar;
