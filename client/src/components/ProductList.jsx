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
    refresh: loadProducts
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

  return (
    <div>
      <h2 style={inventoryTitle}>Inventory</h2>
      {products.length === 0 ? (
        <div style={{ opacity: 0.6, textAlign: "center" }}>
          No products yet. Add one above!
        </div>
      ) : (
        <div style={productGrid}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onDelete={deleteProduct} />
          ))}
        </div>
      )}
    </div>
  );
});

// 🧁 Expandable Product Card
function ProductCard({ product, onDelete }) {
  const [open, setOpen] = useState(false);

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

  return (
    <div style={card} onClick={() => setOpen(!open)}>
      <div style={topRow}>
        <div>
          <strong>{product.name}</strong> — ${product.price} ({product.stock} in stock)
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(product.id);
          }}
          style={delBtn}
        >
          Delete
        </button>
      </div>
      {open && product.description && (
        <div style={desc}>
          <strong>Description:</strong> {product.description}
        </div>
      )}
    </div>
  );
}

export default ProductList;

