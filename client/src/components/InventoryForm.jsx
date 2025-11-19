import { useState } from "react";
import api from "../utils/api";

function InventoryForm({ onAdded }) {
  const [form, setForm] = useState({ name: "", description: "", location: "", stock_level: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/inventory", form);
      setForm({ name: "", description: "", location: "", stock_level: "" });
      if (onAdded) onAdded();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add inventory item");
    }
  };

  const row = { display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", marginBottom: "2rem" };
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
  };
  const btn = {
    background: "#d4a373",
    border: "none",
    color: "#fff",
    padding: ".7rem 1.2rem",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
  };

  return (
    <form onSubmit={handleSubmit} style={row}>
      <input style={input} placeholder="Name" value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input style={input} placeholder="Description" value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <input style={input} placeholder="Location" value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })} />
      <input style={input} type="number" placeholder="Stock Level" value={form.stock_level}
        onChange={(e) => setForm({ ...form, stock_level: e.target.value })} />
      <button type="submit" style={btn}>Add Item</button>
    </form>
  );
}

export default InventoryForm;
