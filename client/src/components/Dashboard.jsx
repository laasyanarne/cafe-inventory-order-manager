import { useRef } from "react";
import { useAuth } from "../context/AuthContext";
import ProductForm from "./ProductForm";
import ProductList from "./ProductList";
import EmployeeList from "./EmployeeList";
import CustomerList from "./CustomerList";
import ShiftList from "./ShiftList";

function Dashboard() {
  const { user, logout } = useAuth();
  const productListRef = useRef();

  const handleProductAdded = () => {
    productListRef.current?.refresh();
  };

  const productsContainer = {
    background: "linear-gradient(to bottom, #fae7d3, #f7c9b6)",
    borderRadius: "24px",
    padding: "2rem clamp(1rem, 5vw, 3rem)",
    boxShadow: "0 12px 35px rgba(80, 50, 30, 0.15)",
    marginBottom: "2rem",
  };

  const productsHeader = {
    fontSize: "2.6rem",
    fontWeight: 800,
    marginBottom: "1.75rem",
    color: "#5d4037",
    textAlign: "center",
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>SmallBiz Inventory</h1>
        <div>
          <span>
            Welcome, {user.name} ({user.role})
          </span>
          <button onClick={logout} style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}>
            Logout
          </button>
        </div>
      </div>

      {/* 🎨 Styled products section */}
      <div style={productsContainer}>
        <h1 style={productsHeader}>🍰 Halwa Bakery & Cafe Inventory</h1>
        <ProductForm onProductAdded={handleProductAdded} />
        <ProductList ref={productListRef} />
      </div>

      <div style={{ marginTop: "2rem" }}>
        <EmployeeList />
      </div>

      <CustomerList />
      <ShiftList />
    </div>
  );
}

export default Dashboard;

