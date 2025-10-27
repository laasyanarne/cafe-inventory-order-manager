import { useEffect, useState } from "react";

export default function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "" });

  const fetchProducts = async () => {
    const res = await fetch("http://localhost:5001/api/products");
    setProducts(await res.json());
  };

  const addProduct = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:5001/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", description: "", price: "", stock: "" });
    fetchProducts();
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`http://localhost:5001/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  useEffect(() => { fetchProducts(); }, []);

  // 🎨 Styles
  const page = {
    minHeight: "100vh",
    width: "100vw",
    background: "linear-gradient(to bottom, #fae7d3, #f7c9b6)",
    fontFamily: "'Poppins', sans-serif",
    color: "#4e342e",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "2rem 1rem",
    boxSizing: "border-box",
    overflowX: "hidden",
  };

  const container = {
    width: "100%",
    background: "#fffaf5",
    borderRadius: "24px",
    boxShadow: "0 12px 35px rgba(80, 50, 30, 0.15)",
    padding: "2rem clamp(1rem, 5vw, 3rem)", // auto adjusts for viewport width
    boxSizing: "border-box",
  };

  const header = {
    fontSize: "2.6rem",
    fontWeight: 800,
    marginBottom: "1.75rem",
    color: "#5d4037",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    flexWrap: "wrap",
    gap: "0.75rem",
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
    flex: "1 1 180px",
    minWidth: "140px",
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

  const inventoryTitle = {
    marginBottom: "1.25rem",
    fontWeight: 700,
    color: "#8d6e63",
    fontSize: "1.6rem",
    textAlign: "center",
  };

  // 🧁 Fix: cards now flow properly in all window sizes
  const productGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", // <-- key fix
    gap: "20px",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div style={page}>
      <div style={container}>
        <h1 style={header}>🍰 Halwa Bakery & Cafe Inventory</h1>

        <form onSubmit={addProduct} style={formRow}>
          <input style={input} placeholder="Name"
                 value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
          <input style={input} placeholder="Description"
                 value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
          <input style={input} type="number" placeholder="Price"
                 value={form.price} onChange={e=>setForm({...form, price:e.target.value})}/>
          <input style={input} type="number" placeholder="Stock"
                 value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})}/>
          <button type="submit" style={btn}>Add Product</button>
        </form>

        <h2 style={inventoryTitle}>Inventory</h2>

        {products.length === 0 ? (
          <div style={{ opacity: 0.6, textAlign: "center" }}>
            No products yet. Add one above!
          </div>
        ) : (
          <div style={productGrid}>
            {products.map(p => (
              <ProductCard key={p.id} product={p} onDelete={deleteProduct} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
