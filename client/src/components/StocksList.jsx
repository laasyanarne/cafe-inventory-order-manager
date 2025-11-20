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
    console.error(" Delete failed:", err);
    alert(err.response?.data?.error || "Failed to delete stock");
  }
};

const updateStock = async (eid, ing_id, updated) => {
  try {
    const newEid = Number(updated.employee_id || eid);
    const newIng = Number(updated.ingredient_id || ing_id);

    const payload = {
      employee_id: newEid,
      ingredient_id: newIng,
    };
    await api.put(`/stocks/${eid}/${ing_id}`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    await load();
  } catch (err) {
    console.error(" Update failed:", err);
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
          {stocks.map((s, index) => (
            <StockCard
              key={`${s.employee_id}-${s.ingredient_id}-${index}`}   //added index to rerender
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

  //typing of inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //save click
  const handleSave = () => {
  onSave(editData);  //updated data
  setEditing(false);
  };


  const inputStyle = {
    width: "100%",
    padding: ".5rem",
    marginBottom: ".5rem",
    border: "1px solid #ccc",
    borderRadius: "8px",
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
    <div
      style={{
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "1rem",
        marginBottom: "1rem",
      }}
    >
      {editing ? (
        <>
          <input
            style={inputStyle}
            name="employee_id"
            type="number"
            value={editData.employee_id}
            onChange={handleChange}
          />
          <input
            style={inputStyle}
            name="ingredient_id"
            type="number"
            value={editData.ingredient_id}
            onChange={handleChange}
          />
          <button style={btn("#81c784")} onClick={handleSave}>Save</button>
          <button style={btn("#ffb74d")} onClick={() => setEditing(false)}>
            Cancel
          </button>
        </>
      ) : (
        <>
          <strong>Employee #{stock.employee_id}</strong> — Ingredient #
          {stock.ingredient_id}
          <br />
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
