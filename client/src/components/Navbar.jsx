import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/Navbar.css";

function Navbar() {
  const [open, setOpen] = useState(false);
  const { logout, user } = useAuth();

  const toggleMenu = () => setOpen((prev) => !prev);

  return (
    <nav className="nav-container">
      <div className="nav-left">
        <span className="nav-logo">Halwa Bakery</span>
      </div>

      <div className="nav-right">
        {/* Desktop menu */}
        <ul className="nav-links">
          <li>
            <Link to="/products">Products</Link>
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
            <Link to="/customers">Customers</Link>
          </li>
          <li>
            <Link to="/shifts">Shifts</Link>
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
            <Link to="/products" onClick={() => setOpen(false)}>
              Products
            </Link>
          </li>
          <li>
            <Link to="/employees" onClick={() => setOpen(false)}>
              Employees
            </Link>
          </li>
          <li>
            <Link to="/ingredients" onClick={() => setOpen(false)}>
              Ingredients
            </Link>
          </li>
          <li>
            <Link to="/transactions" onClick={() => setOpen(false)}>
              Transactions
            </Link>
          </li>
          <li>
            <Link to="/customers" onClick={() => setOpen(false)}>
              Customers
            </Link>
          </li>
          <li>
            <Link to="/shifts" onClick={() => setOpen(false)}>
              Shifts
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
