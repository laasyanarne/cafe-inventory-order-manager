import { useEffect, useState } from "react";
import api from "../utils/api";

function TransactionForm({ mode = "create", initialData, onSaved, onCancel }) {
  const isEdit = mode === "edit";
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([{ product_id: "", qty: 1 }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCustomerId(initialData.customer_id ?? "");
      setItems(
        (initialData.items || []).map((it) => ({
          // backend returns product_id
          product_id: it.product_id,
          qty: it.qty,
        }))
      );
    } else {
      setCustomerId("");
      setItems([{ product_id: "", qty: 1 }]);
    }
  }, [initialData]);

  const updateItemField = (index, field, value) => {
    setItems((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );
  };

  const addRow = () => {
    setItems((prev) => [...prev, { product_id: "", qty: 1 }]);
  };

  const removeRow = (index) => {
    setItems((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedItems = items
      .map((r) => ({
        product_id: r.product_id ? Number(r.product_id) : null,
        qty: r.qty ? Number(r.qty) : null,
      }))
      .filter((r) => r.product_id && r.qty);

    if (cleanedItems.length === 0) {
      alert("Please add at least one valid line item (product ID + quantity).");
      return;
    }

    const payload = {
      customer_id: customerId ? Number(customerId) : null,
      items: cleanedItems,
    };

    try {
      setSubmitting(true);
      if (isEdit && initialData?.id != null) {
        await api.put(`/transactions/${initialData.id}`, payload);
      } else {
        await api.post("/transactions", payload);
      }

      if (!isEdit) {
        setCustomerId("");
        setItems([{ product_id: "", qty: 1 }]);
      }

      onSaved && onSaved();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to save transaction");
    } finally {
      setSubmitting(false);
    }
  };

  // --- styles ---
  const wrapper = {
    marginBottom: "1.75rem",
    padding: "1.25rem 1.5rem",
    borderRadius: "18px",
    background: "#fffaf5",
    border: "1px solid #f0ddd0",
  };

  const row = {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
    alignItems: "center",
    marginBottom: "0.75rem",
  };

  const label = {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#6d4c41",
    marginRight: "0.4rem",
  };

  const input = {
    background: "#fff",
    border: "1px solid #e0cfc2",
    borderRadius: "10px",
    padding: "0.45rem 0.7rem",
    fontSize: "0.9rem",
    minWidth: "100px",
  };

  const smallBtn = {
    borderRadius: "999px",
    padding: "0.35rem 0.7rem",
    fontSize: "0.8rem",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  };

  const addLineBtn = {
    ...smallBtn,
    background: "#d4a373",
    color: "#fff",
  };

  const removeLineBtn = {
    ...smallBtn,
    background: "#ef5350",
    color: "#fff",
  };

  const submitRow = {
    display: "flex",
    gap: "0.6rem",
    marginTop: "0.75rem",
  };

  const primaryBtn = {
    ...smallBtn,
    background: "#81c784",
    color: "#fff",
    padding: "0.5rem 1.2rem",
  };

  const cancelBtn = {
    ...smallBtn,
    background: "#b0bec5",
    color: "#fff",
    padding: "0.5rem 1.0rem",
  };

  return (
    <form onSubmit={handleSubmit} style={wrapper}>
      {/* Customer row */}
      <div style={row}>
        <span style={label}>Customer ID (optional)</span>
        <input
          style={input}
          type="number"
          min="1"
          placeholder="e.g. 3"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        />
      </div>

      {/* Line items */}
      {items.map((line, index) => (
        <div key={index} style={row}>
          <span style={label}>Line {index + 1}</span>
          <input
            style={input}
            type="number"
            min="1"
            placeholder="Product ID"
            value={line.product_id}
            onChange={(e) =>
              updateItemField(index, "product_id", e.target.value)
            }
          />
          <input
            style={input}
            type="number"
            min="1"
            placeholder="Qty"
            value={line.qty}
            onChange={(e) =>
              updateItemField(index, "qty", e.target.value)
            }
          />
          <button
            type="button"
            style={removeLineBtn}
            onClick={() => removeRow(index)}
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        style={addLineBtn}
        onClick={addRow}
      >
        + Add Line Item
      </button>

      <div style={submitRow}>
        <button type="submit" style={primaryBtn} disabled={submitting}>
          {isEdit ? "Save Changes" : "Add Transaction"}
        </button>
        {onCancel && (
          <button
            type="button"
            style={cancelBtn}
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default TransactionForm;
