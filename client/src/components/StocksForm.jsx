import { useState } from "react";
import api from "../utils/api";

function StocksForm({ onAdded }) {
  // include employee_id field
  const [form, setForm] = useState({ employee_id: "", ingredient_id: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/stocks", form);
      setForm({ employee_id: "", ingredient_id: "" });
      if (onAdded) onAdded();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add stock");
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
        placeholder="Employee ID"
        value={form.employee_id}
        onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
      />
      <input
        style={input}
        type="number"
        placeholder="Ingredient ID"
        value={form.ingredient_id}
        onChange={(e) => setForm({ ...form, ingredient_id: e.target.value })}
      />
      <button type="submit" style={btn}>Add Stock</button>
    </form>
  );
}

export default StocksForm;
