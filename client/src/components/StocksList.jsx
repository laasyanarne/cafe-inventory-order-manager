import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import api from "../utils/api";

const StocksList = forwardRef((props, ref) => {
  const [stocks, setStocks] = useState([]);

  const load = async () => {
    try {
      const res = await api.get("/stocks");
      setStocks(res.data);
    } catch (err) {
      console.error("Error loading stocks:", err);
    }
  };

  useEffect(() => { load(); }, []);
  useImperativeHandle(ref, () => ({ refresh: load }));

const deleteStock = async (eid, ing_id) => {
  if (!confirm("Delete this stock record?")) return;
  try {
    await api.delete(`/stocks/${eid}/${ing_id}`, {
      headers: { "Content-Type": "application/json" }
    });
    load();
  } catch (err) {
    console.error("❌ Delete failed:", err);
    alert(err.response?.data?.error || "Failed to delete stock");
  }
};

const updateStock = async (eid, ing_id, updated) => {
  console.log("🧪 SAVING:", eid, ing_id, updated);
  try {
    const payload = {
      employee_id: parseInt(updated.employee_id) || eid,
      ingredient_id: parseInt(updated.ingredient_id) || ing_id,
    };
    await api.put(`/stocks/${eid}/${ing_id}`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    load();
  } catch (err) {
    console.error("❌ Update failed:", err);
    alert(err.response?.data?.error || "Failed to update stock");
  }
};

  return (
    <div>
      {stocks.length === 0 ? (
        <div style={{ opacity: 0.6, textAlign: "center" }}>No stocks yet. Add one above!</div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px"
        }}>
          {stocks.map((s) => (
            <StockCard
              key={`${s.employee_id}-${s.ingredient_id}`}
              stock={s}
              onDelete={() => deleteStock(s.employee_id, s.ingredient_id)}
              onSave={(data) => updateStock(s.employee_id, s.ingredient_id, data)}
            />
          ))}
        </div>
      )}
    </div>
  );
});


function StockCard({ stock, onDelete, onSave }) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    employee_id: stock.employee_id,
    ingredient_id: stock.ingredient_id,
  });

  const card = {
    background: "#fff",
    border: "1px solid #f1dfcf",
    borderRadius: "16px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    padding: "1rem",
  };

  const input = {
    width: "100%",
    padding: ".5rem",
    borderRadius: "8px",
    border: "1px solid #d7ccc8",
    fontSize: "0.95rem",
  };

  const btn = (color) => ({
    background: color,
    border: "none",
    color: "#fff",
    padding: ".4rem 1rem",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
    margin: "0 .25rem",
  });

  return (
    <div style={card}>
      {editing ? (
        <>
          <input
            style={input}
            type="number"
            value={editData.employee_id}
            onChange={(e) => setEditData({ ...editData, employee_id: e.target.value })}
          />
          <input
            style={input}
            type="number"
            value={editData.ingredient_id}
            onChange={(e) => setEditData({ ...editData, ingredient_id: e.target.value })}
          />
          <button
            style={btn("#81c784")}
            onClick={() => {
              console.log("🧪 SAVING:", stock.employee_id, stock.ingredient_id, editData);
              onSave(stock.employee_id, stock.ingredient_id, editData);
              setEditing(false);
            }}
          >
            Save
          </button>

          <button style={btn("#ffb74d")} onClick={() => setEditing(false)}>
            Cancel
          </button>
        </>
      ) : (
        <>
          <strong>Employee #{stock.employee_id}</strong> — Ingredient #{stock.ingredient_id}
          <button style={btn("#64b5f6")} onClick={() => setEditing(true)}>
            Edit
          </button>
          <button
            style={btn("#e57373")}
            onClick={() => onDelete(stock.employee_id, stock.ingredient_id)}
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
}

export default StocksList;
