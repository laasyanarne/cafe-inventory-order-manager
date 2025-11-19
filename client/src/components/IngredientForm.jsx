import { useState } from "react";
import api from "../utils/api";

function IngredientForm({ onIngredientAdded }) {
  const [form, setForm] = useState({ name: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Ingredient name is required");
      return;
    }

    try {
      await api.post("/ingredients", { name: form.name });
      setForm({ name: "" });
      if (onIngredientAdded) onIngredientAdded();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add ingredient");
    }
  };

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
    flex: "1 1 220px",
    minWidth: "180px",
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
        placeholder="Ingredient name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <button type="submit" style={btn}>
        Add Ingredient
      </button>
    </form>
  );
}

export default IngredientForm;
