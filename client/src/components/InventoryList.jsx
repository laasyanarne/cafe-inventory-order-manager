import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import api from "../utils/api";

const InventoryList = forwardRef((props, ref) => {
  const [items, setItems] = useState([]);

  const loadItems = async () => {
    try {
      const res = await api.get("/inventory")
      setItems(res.data);
    } catch (err) {
      console.error("Error loading inventory:", err);
    }
  };

  useEffect(() => { loadItems(); }, []);
  useImperativeHandle(ref, () => ({ refresh: loadItems }));

  const deleteItem = async (id) => {
  if (!confirm("Delete this item?")) return;
  try {
    await api.delete(`/inventory/${id}`);
    loadItems();
  } catch (err) {
    alert(err.response?.data?.error || "Failed to delete item");
  }
};

const updateItem = async (id, updated) => {
  try {
    await api.put(`/inventory/${id}`, updated);
    loadItems();
  } catch (err) {
    alert(err.response?.data?.error || "Failed to update item");
  }
};

  return (
    <div>
      {items.length === 0 ? (
        <div style={{ opacity: 0.6, textAlign: "center" }}>No inventory yet. Add one above!</div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px"
        }}>
          {items.map((it) => (
            <InventoryCard
              key={it.id}
              item={it}
              onDelete={deleteItem}
              onSave={updateItem}
            />
          ))}
        </div>
      )}
    </div>
  );
});

function InventoryCard({ item, onDelete, onSave }) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    temperature: item.temperature,
    location: item.location,
  });

  const input = { width: "100%", padding: ".5rem", borderRadius: "8px", border: "1px solid #d7ccc8", fontSize: "0.95rem" };
  const btn = (color) => ({
    background: color, border: "none", color: "#fff", padding: ".4rem 1rem",
    borderRadius: "10px", cursor: "pointer", fontWeight: 600, margin: "0 .25rem"
  });

  return (
    <div style={{
      background: "#fff", border: "1px solid #f1dfcf", borderRadius: "16px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.08)", padding: "1rem"
    }}>
      {editing ? (
        <>
          <input style={input} value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
          <input style={input} value={editData.location} onChange={(e) => setEditData({ ...editData, location: e.target.value })} />
          <input style={input} type="number" value={editData.stock_level}
            onChange={(e) => setEditData({ ...editData, stock_level: e.target.value })} />
          <textarea style={{ ...input, height: "60px" }} value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })} />
          <button style={btn("#81c784")} onClick={() => { onSave(item.id, editData); setEditing(false); }}>Save</button>
          <button style={btn("#ffb74d")} onClick={() => setEditing(false)}>Cancel</button>
        </>
      ) : (
        <>
          <strong>{item.name}</strong> — {item.stock_level} in stock ({item.location})
          <p style={{ fontSize: "0.9rem", color: "#6d4c41" }}>{item.description}</p>
          <button style={btn("#64b5f6")} onClick={() => setEditing(true)}>Edit</button>
          <button style={btn("#e57373")} onClick={() => onDelete(item.id)}>Delete</button>
        </>
      )}
    </div>
  );
}

export default InventoryList;
