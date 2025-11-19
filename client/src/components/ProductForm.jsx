import { useState } from "react";
import api from "../utils/api";

function ProductForm({ onProductAdded }) {
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/products", form);
      setForm({ name: "", description: "", price: "", stock: "" });
      if (onProductAdded) onProductAdded();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add product");
    }
  };

  // 🎨 Form styles
  const formRow = {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    justifyContent: "center",
    marginBottom: "2rem",
  };

  const input = {
    background: "#fff",
    border: "1px solid #e0cfc2",
    borderRadius: "12px",
    padding: ".7rem .9rem",
    fontSize: "1rem",
    color: "#5d4037",
    outlineColor: "#d4a373",
    flex: "1 1 180px",
    minWidth: "140px",
    boxSizing: "border-box",
  };

  const btn = {
    background: "#d4a373",
    border: "none",
    color: "#fff",
    padding: ".7rem 1.2rem",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
    transition: "0.25s ease",
    flex: "0 0 auto",
  };

  return (
    <form onSubmit={handleSubmit} style={formRow}>
      <input
        style={input}
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        style={input}
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <input
        style={input}
        type="number"
        placeholder="Price"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
      />
      <input
        style={input}
        type="number"
        placeholder="Stock"
        value={form.stock}
        onChange={(e) => setForm({ ...form, stock: e.target.value })}
      />
      <button type="submit" style={btn}>Add Product</button>
    </form>
  );
}

export default ProductForm;



