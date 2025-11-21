import { useState } from "react";
import api from "../utils/api";

function InventoryForm({ onAdded }) {
  const [form, setForm] = useState({ temperature: "", location: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/inventory", form);
      setForm({ temperature: "", location: "" });
      if (onAdded) onAdded();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add inventory item");
    }
  };

  const row = { display: "flex", gap: "12px", justifyContent: "center", marginBottom: "2rem" };
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
      <input
        style={input}
        type="number"
        step="0.01"
        placeholder="Temperature"
        value={form.temperature}
        onChange={(e) => setForm({ ...form, temperature: e.target.value })}
      />
      <input
        style={input}
        placeholder="Storage Location"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
      />
      <button type="submit" style={btn}>Add Inventory</button>
    </form>
  );
}

export default InventoryForm;
