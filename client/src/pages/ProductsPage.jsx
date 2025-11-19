import { useRef } from "react";
import { useAuth } from "../context/AuthContext";
import ProductForm from "../components/ProductForm";
import ProductList from "../components/ProductList";

function ProductsPage() {
  const { user, logout } = useAuth();
  const productListRef = useRef();

  const handleProductAdded = () => {
    productListRef.current?.refresh();
  };

  // 🎨 Full page styled container
  const page = {
    minHeight: "100vh",
    width: "100vw",
    background: "linear-gradient(to bottom, #fae7d3, #f7c9b6)",
    fontFamily: "'Poppins', sans-serif",
    color: "#4e342e",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "2rem 1rem",
    boxSizing: "border-box",
    overflowX: "hidden",
  };

  const container = {
    width: "100%",
    maxWidth: "1400px",
    background: "#fffaf5",
    borderRadius: "24px",
    boxShadow: "0 12px 35px rgba(80, 50, 30, 0.15)",
    padding: "2rem clamp(1rem, 5vw, 3rem)",
    boxSizing: "border-box",
  };

  const header = {
    fontSize: "2.6rem",
    fontWeight: 800,
    marginBottom: "1.75rem",
    color: "#5d4037",
    textAlign: "center",
  };

  const topBar = {
    width: "100%",
    maxWidth: "1400px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    padding: "0 1rem",
  };

  const logoutBtn = {
    background: "#d4a373",
    border: "none",
    color: "#fff",
    padding: "0.6rem 1.2rem",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
    transition: "0.25s ease",
  };

  return (
    <div style={page}>
      <div style={topBar}>
        <div style={{ color: "#5d4037", fontWeight: 600 }}>
          Welcome, {user.name} ({user.role})
        </div>
      </div>
      <div style={container}>
        <h1 style={header}>📖 Menu</h1>
        <ProductForm onProductAdded={handleProductAdded} />
        <ProductList ref={productListRef} />
      </div>
    </div>
  );
}

export default ProductsPage;

