import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "" });

  const loadProducts = async () => {
    const res = await axios.get("http://localhost:5000/api/products");
    setProducts(res.data);
  };

  const addProduct = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/products", form);
    setForm({ name: "", description: "", price: "", stock: "" });
    loadProducts();
  };

  useEffect(() => { loadProducts(); }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>SmallBiz Inventory</h1>
      <form onSubmit={addProduct}>
        <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/><br/>
        <input placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/><br/>
        <input placeholder="Price" type="number" value={form.price} onChange={e=>setForm({...form, price:e.target.value})}/><br/>
        <input placeholder="Stock" type="number" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})}/><br/>
        <button>Add Product</button>
      </form>

      <h2>Product List</h2>
      <ul>
        {products.map(p => (
          <li key={p.id}>{p.name} — ${p.price}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
