import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import api from "../utils/api";

const ProductList = forwardRef((props, ref) => {
  const [products, setProducts] = useState([]);

  const loadProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: loadProducts,
  }));

  const inventoryTitle = {
    marginBottom: "1.25rem",
    fontWeight: 700,
    color: "#8d6e63",
    fontSize: "1.6rem",
    textAlign: "center",
  };

  const productGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
    width: "100%",
    boxSizing: "border-box",
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete product");
    }
  };

  const updateProduct = async (id, updatedData) => {
    try {
      await api.put(`/products/${id}`, updatedData);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update product");
    }
  };

  return (
    <div>
      <h2 style={inventoryTitle}></h2>
      {products.length === 0 ? (
        <div style={{ opacity: 0.6, textAlign: "center" }}>
          No products yet. Add one above!
        </div>
      ) : (
        <div style={productGrid}>
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onDelete={deleteProduct}
              onSave={updateProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// 🧁 Expandable Product Card (NOW WITH EDIT MODE)
function ProductCard({ product, onDelete, onSave }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const [editData, setEditData] = useState({
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
  });

  const card = {
    background: "#fff",
    border: "1px solid #f1dfcf",
    borderRadius: "16px",
    boxShadow: open
      ? "0 6px 16px rgba(212,163,115,0.25)"
      : "0 4px 10px rgba(0,0,0,0.08)",
    padding: "1rem 1.25rem",
    transition: "all 0.3s ease",
    cursor: "pointer",
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

  const desc = {
    marginTop: "0.75rem",
    padding: "0.75rem 1rem",
    background: "#fffaf5",
    borderRadius: "12px",
    fontSize: "0.9rem",
    color: "#6d4c41",
    border: "1px dashed #e0cfc2",
  };

  const delBtn = {
    background: "#e57373",
    border: "none",
    color: "#fff",
    padding: "0.4rem 1rem",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
    flexShrink: 0,
  };

  const editBtn = {
    background: "#64b5f6",
    border: "none",
    color: "#fff",
    padding: "0.4rem 1rem",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
    flexShrink: 0,
  };

  const saveBtn = {
    background: "#81c784",
    border: "none",
    color: "#fff",
    padding: "0.4rem 1rem",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
    marginRight: "0.5rem",
  };

  const cancelBtn = {
    background: "#ffb74d",
    border: "none",
    color: "#fff",
    padding: "0.4rem 1rem",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
  };

  const input = {
    width: "100%",
    padding: "0.5rem",
    margin: "0.3rem 0",
    borderRadius: "8px",
    border: "1px solid #d7ccc8",
    fontSize: "0.95rem",
    boxSizing: "border-box",
  };

  const stop = (e) => e.stopPropagation();

  return (
    <div style={card} onClick={() => !editing && setOpen(!open)}>
      <div style={topRow}>
        {editing ? (
          <div style={{ width: "100%" }} onClick={stop}>
            <input
              style={input}
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            />
            <input
              style={input}
              value={editData.price}
              type="number"
              onChange={(e) => setEditData({ ...editData, price: e.target.value })}
            />
            <input
              style={input}
              value={editData.stock}
              type="number"
              onChange={(e) => setEditData({ ...editData, stock: e.target.value })}
            />
          </div>
        ) : (
          <div>
            <strong>{product.name}</strong> — ${product.price} ({product.stock} in stock)
          </div>
        )}

        {!editing ? (
          <>
            <button
              onClick={(e) => {
                stop(e);
                setEditing(true);
              }}
              style={editBtn}
            >
              Edit
            </button>

            <button
              onClick={(e) => {
                stop(e);
                onDelete(product.id);
              }}
              style={delBtn}
            >
              Delete
            </button>
          </>
        ) : (
          <>
            <button
              onClick={(e) => {
                stop(e);
                onSave(product.id, editData);
                setEditing(false);
              }}
              style={saveBtn}
            >
              Save
            </button>
            <button
              onClick={(e) => {
                stop(e);
                setEditing(false);
                setEditData({
                  name: product.name,
                  description: product.description,
                  price: product.price,
                  stock: product.stock,
                });
              }}
              style={cancelBtn}
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {open && !editing && product.description && (
        <div style={desc}>
          <strong>Description:</strong> {product.description}
        </div>
      )}

      {editing && (
        <div style={desc} onClick={stop}>
          <textarea
            style={{ ...input, height: "70px", resize: "vertical" }}
            value={editData.description}
            onChange={(e) =>
              setEditData({ ...editData, description: e.target.value })
            }
          />
        </div>
      )}
    </div>
  );
}

export default ProductList;
