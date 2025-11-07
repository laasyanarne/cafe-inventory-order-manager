import { useState } from "react";
import api from "../utils/api";

function ProductForm({ onProductAdded }) {
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/products", form);
      setForm({ name: "", description: "", price: "", stock: "" });
      if (onProductAdded) onProductAdded();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add product");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
      />
      <br />
      <input
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
      />
      <br />
      <input
        placeholder="Price"
        type="number"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
      />
      <br />
      <input
        placeholder="Stock"
        type="number"
        value={form.stock}
        onChange={(e) => setForm({ ...form, stock: e.target.value })}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
      />
      <br />
      <button style={{ padding: "0.5rem 1rem", marginTop: "0.5rem" }}>Add Product</button>
    </form>
  );
}

export default ProductForm;


