import { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "../utils/api";
import { useToast } from "../context/ToastContext";

function TransactionForm({ mode = "create", initialData, onSaved, onCancel }) {
  const toast = useToast();
  const isEdit = mode === "edit";
  const [customerId, setCustomerId] = useState("");
  const [items,      setItems]      = useState([{ product_id: "", qty: 1 }]);
  const [orderNote,  setOrderNote]  = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [products,   setProducts]   = useState([]);
  const [customers,  setCustomers]  = useState([]);

  useEffect(() => {
    api.get("/products").then(res => setProducts(res.data || [])).catch(() => {});
    api.get("/customers").then(res => setCustomers(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialData) {
      setCustomerId(initialData.customer_id ?? "");
      setOrderNote(initialData.order_note || "");
      setItems(
        (initialData.items || []).map(it => ({
          product_id: String(it.product_id),
          qty: it.qty,
        }))
      );
    } else {
      setCustomerId("");
      setOrderNote("");
      setItems([{ product_id: "", qty: 1 }]);
    }
  }, [initialData]);

  const updateItemField = (index, field, value) => {
    setItems(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  const addRow = () => setItems(prev => [...prev, { product_id: "", qty: 1 }]);

  const removeRow = (index) => {
    setItems(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedItems = items
      .map(r => ({
        product_id: r.product_id ? Number(r.product_id) : null,
        qty: r.qty ? Number(r.qty) : null,
      }))
      .filter(r => r.product_id && r.qty);

    if (cleanedItems.length === 0) {
      toast.warning("Please add at least one item.");
      return;
    }

    const payload = {
      customer_id: customerId ? Number(customerId) : null,
      items:       cleanedItems,
      order_note:  orderNote.trim() || null,
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
      toast.error(err.response?.data?.error || "Failed to save transaction");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{isEdit ? "Edit Order" : "New Order"}</h2>
            <p className="modal-desc">{isEdit ? "Update items or customer" : "Record a new sale"}</p>
          </div>
          <button className="modal-close" onClick={onCancel} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label className="form-label">Customer</label>
              <select
                className="form-select"
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
              >
                {[
                  <option key="__walkin__" value="">Walk-in (no account)</option>,
                  ...customers.map(c => (
                    <option key={c.cid} value={c.cid}>{c.name}</option>
                  )),
                ]}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Order Note</label>
              <input
                className="form-input"
                placeholder="e.g. oat milk, extra shot, no whip"
                value={orderNote}
                onChange={e => setOrderNote(e.target.value)}
                maxLength={255}
              />
            </div>

            <div className="form-field">
              <label className="form-label form-label-required">Items</label>
              <div className="txn-line-items">
                {items.map((line, index) => (
                  <div key={index} className="txn-line-row">
                    <select
                      className="form-select"
                      value={String(line.product_id)}
                      onChange={e => updateItemField(index, "product_id", e.target.value)}
                      required
                    >
                      {[
                        <option key="__none__" value="">Select product…</option>,
                        ...products.map(p => (
                          <option key={p.id} value={String(p.id)}>
                            {p.name} — ${parseFloat(p.price || 0).toFixed(2)}
                          </option>
                        )),
                      ]}
                    </select>
                    <input
                      className="form-input txn-qty-input"
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={line.qty}
                      onChange={e => updateItemField(index, "qty", e.target.value)}
                      required
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        className="btn-icon btn-icon-danger"
                        onClick={() => removeRow(index)}
                        title="Remove item"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm txn-add-line"
                onClick={addRow}
              >
                + Add Item
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : isEdit ? "Save Changes" : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionForm;
