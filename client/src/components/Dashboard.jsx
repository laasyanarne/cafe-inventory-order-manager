import { useRef } from "react";
import { useAuth } from "../context/AuthContext";
import ProductForm from "./ProductForm";
import ProductList from "./ProductList";
import EmployeeList from "./EmployeeList";

function Dashboard() {
  const { user, logout } = useAuth();
  const productListRef = useRef();

  const handleProductAdded = () => {
    productListRef.current?.refresh();
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

      <ProductForm onProductAdded={handleProductAdded} />
      <div style={{ marginTop: "2rem" }}>
        <ProductList ref={productListRef} />
      </div>
      <div style={{ marginTop: "2rem" }}>
        <EmployeeList />
      </div>
    </div>
  );
}

export default Dashboard;

