// src/components/IngredientList.jsx
import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import api from "../utils/api";

const IngredientList = forwardRef((props, ref) => {
  const [ingredients, setIngredients] = useState([]);

  const loadIngredients = async () => {
    try {
      const res = await api.get("/ingredients");
      setIngredients(res.data);
    } catch (err) {
      console.error("Error loading ingredients:", err);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: loadIngredients,
  }));

  const pageTitle = {
    marginBottom: "1.25rem",
    fontWeight: 800,
    color: "#4b2b24",
    fontSize: "2rem",
    textAlign: "center",
  };

  const ingredientGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
    width: "100%",
    boxSizing: "border-box",
  };

  const deleteIngredient = async (id) => {
    const ok = window.confirm("Delete this ingredient?");
    if (!ok) return;

    try {
      await api.delete(`/ingredients/${id}`);
      await loadIngredients();
    } catch (err) {
      alert(
        err.response?.data?.error ||
          "Failed to delete ingredient (it may be referenced elsewhere)."
      );
    }
  };

  const updateIngredient = async (id, updatedName) => {
    try {
      await api.put(`/ingredients/${id}`, { name: updatedName });
      await loadIngredients();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update ingredient");
    }
  };

  return (
    <div>
      <h2 style={pageTitle}>Ingredients</h2>

      {ingredients.length === 0 ? (
        <div style={{ opacity: 0.6, textAlign: "center" }}>
          No ingredients in the database.
        </div>
      ) : (
        <div style={ingredientGrid}>
          {ingredients.map((ing) => (
            <IngredientCard
              key={ing.id}
              ingredient={ing}
              onDelete={deleteIngredient}
              onSave={updateIngredient}
            />
          ))}
        </div>
      )}
    </div>
  );
});


function IngredientCard({ ingredient, onDelete, onSave }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(ingredient.name);

  const card = {
    background: "#fff",
    border: "1px solid #f1dfcf",
    borderRadius: "16px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    padding: "1rem 1.25rem",
    transition: "all 0.3s ease",
    width: "100%",
    boxSizing: "border-box",
  };

  const topRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.5rem",
  };

  const pill = {
    background: "#fbe9e7",
    borderRadius: "999px",
    padding: "0.2rem 0.7rem",
    fontSize: "0.8rem",
    color: "#6d4c41",
  };

  const nameInput = {
    background: "#fff",
    border: "1px solid #e0cfc2",
    borderRadius: "10px",
    padding: "0.35rem 0.6rem",
    fontSize: "0.95rem",
    color: "#5d4037",
    minWidth: "140px",
  };

  const btnBase = {
    border: "none",
    borderRadius: "999px",
    padding: "0.35rem 0.9rem",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
  };

  const editBtn = {
    ...btnBase,
    background: "#64b5f6",
    color: "#fff",
    marginRight: "0.4rem",
  };

  const saveBtn = {
    ...btnBase,
    background: "#81c784",
    color: "#fff",
    marginRight: "0.4rem",
  };

  const cancelBtn = {
    ...btnBase,
    background: "#ffb74d",
    color: "#fff",
    marginRight: "0.4rem",
  };

  const deleteBtn = {
    ...btnBase,
    background: "#e57373",
    color: "#fff",
  };

  return (
    <div style={card}>
      <div style={topRow}>
        <div>
          {editing ? (
            <input
              style={nameInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          ) : (
            <strong>{ingredient.name}</strong>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span style={pill}>ID: {ingredient.id}</span>

          {!editing ? (
            <>
              <button
                style={editBtn}
                type="button"
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
              <button
                style={deleteBtn}
                type="button"
                onClick={() => onDelete(ingredient.id)}
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                style={saveBtn}
                type="button"
                onClick={() => {
                  if (!name.trim()) return;
                  onSave(ingredient.id, name.trim());
                  setEditing(false);
                }}
              >
                Save
              </button>
              <button
                style={cancelBtn}
                type="button"
                onClick={() => {
                  setName(ingredient.name);
                  setEditing(false);
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default IngredientList;
