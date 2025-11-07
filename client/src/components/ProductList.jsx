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

  return (
    <div>
      <h2>Product List</h2>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} — ${p.price}
          </li>
        ))}
      </ul>
    </div>
  );
});

export default ProductList;

