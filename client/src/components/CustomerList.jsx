import { useEffect, useState } from "react";
import api from "../utils/api";

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", contact: "" });

  useEffect(() => {
    loadCustomers(); 
  }, []);

  // retreive all customers from the API
  const loadCustomers = async () => {
    try {
      const res = await api.get("/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error("Error loading customers:", err);
      alert(err.response?.data?.error || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  // add a new customer using the form
  const handleAdd = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Name is required");
      return;
    }

    try {
      await api.post("/customers", form);
      setForm({ name: "", contact: "" });
      loadCustomers(); 
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add customer");
    }
  };

  // delete a customer by id
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;

    try {
      await api.delete(`/customers/${id}`);
      loadCustomers(); 
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete customer");
    }
  };

  if (loading) {
    return <div>Loading customers...</div>;
  }

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Customers</h2>

      {/* add-customer form */}
      <form
        onSubmit={handleAdd}
        style={{
          marginBottom: "1rem",
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <input
          placeholder="Name *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={{ padding: "0.5rem" }}
        />

        <input
          placeholder="Contact (email/phone)"
          value={form.contact}
          onChange={(e) => setForm({ ...form, contact: e.target.value })}
          style={{ padding: "0.5rem" }}
        />

        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Add Customer
        </button>
      </form>

      {/* list of customers */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {customers.map((customer) => (
          <li
            key={customer.id}
            style={{
              padding: "0.75rem",
              marginBottom: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong>{customer.name}</strong>
              {customer.contact && <span> — {customer.contact}</span>}
            </div>

            <button
              onClick={() => handleDelete(customer.id)}
              style={{
                padding: "0.25rem 0.5rem",
                backgroundColor: "#e57373",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CustomerList;
