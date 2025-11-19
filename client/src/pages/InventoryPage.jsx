import { useRef } from "react";
import { useAuth } from "../context/AuthContext";
import InventoryForm from "../components/InventoryForm";
import InventoryList from "../components/InventoryList";

function InventoryPage() {
  const { user } = useAuth();
  const listRef = useRef();

  const refresh = () => listRef.current?.refresh();

  const pageStyle = {
  minHeight: "100vh",
  width: "100vw",
  background: "linear-gradient(to bottom, #fae7d3, #f7c9b6)",
  fontFamily: "'Poppins', sans-serif",
  color: "#4e342e",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "6rem 1rem 2rem", // ✅ Add top padding to account for navbar
  boxSizing: "border-box",
  };


  const containerStyle = {
    width: "100%",
    maxWidth: "1400px",
    background: "#fffaf5",
    borderRadius: "24px",
    boxShadow: "0 12px 35px rgba(80, 50, 30, 0.15)",
    padding: "2rem clamp(1rem, 5vw, 3rem)",
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={{ textAlign: "center", color: "#5d4037" }}>📦 Inventory Management</h1>
        <InventoryForm onAdded={refresh} />
        <InventoryList ref={listRef} />
      </div>
    </div>
  );
}

export default InventoryPage;
