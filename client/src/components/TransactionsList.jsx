import {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import api from "../utils/api";

const TransactionsList = forwardRef(({ onEdit }, ref) => {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");

  const loadTransactions = async () => {
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data || []);
    } catch (err) {
      console.error("Error loading transactions:", err);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: loadTransactions,
  }));

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete transaction #${id}?`)) return;
    try {
      await api.delete(`/transactions/${id}`);
      loadTransactions();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to delete transaction");
    }
  };

  const txnCount = transactions.length;
  const totalRevenue = transactions.reduce(
    (sum, t) => sum + Number(t.total || 0),
    0
  );

  const term = search.toLowerCase();
  const filtered = transactions.filter((t) => {
    if (!term) return true;
    const customer = (t.customer || "").toLowerCase();
    const idStr = String(t.id);
    return customer.includes(term) || idStr.includes(term);
  });

  return (
    <div>
      <div className="transactions-summary">
        {txnCount} transaction{txnCount !== 1 ? "s" : ""} – $
        {totalRevenue.toFixed(2)} total revenue
      </div>

      <div className="transactions-search">
        <input
          className="transactions-search-input"
          placeholder="Search by customer or transaction ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.map((t) => (
        <TransactionCard
          key={t.id}
          txn={t}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", opacity: 0.6, marginTop: "1rem" }}>
          No transactions match your search.
        </div>
      )}
    </div>
  );
});

function TransactionCard({ txn, onEdit, onDelete }) {
  const { id, customer, total, items = [], total_items, total_qty } = txn;

  const metaItems = total_items ?? items.length;
  const metaQty =
    total_qty ??
    items.reduce((sum, item) => sum + Number(item.qty || 0), 0);

  const headerRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.6rem",
  };

  const title = {
    fontWeight: 800,
    fontSize: "1.05rem",
    color: "#4b2b24",
  };

  const actions = {
    display: "flex",
    gap: "0.4rem",
    alignItems: "center",
  };

  const pillBtn = {
    borderRadius: "999px",
    padding: "0.35rem 0.9rem",
    border: "none",
    fontSize: "0.8rem",
    cursor: "pointer",
    fontWeight: 600,
    color: "#fff",
  };

  const editBtn = {
    ...pillBtn,
    background: "#64b5f6",
  };

  const deleteBtn = {
    ...pillBtn,
    background: "#ef5350",
  };

  return (
    <div className="transaction-card">
      <div className="transaction-card-header" style={headerRow}>
        <div style={title}>
          Transaction #{id} —{" "}
          {customer && customer.trim() ? customer : "Walk-in customer"}
        </div>

        <div style={actions}>
          <div className="transaction-card-total">
            ${Number(total || 0).toFixed(2)}
          </div>
          <button
            style={editBtn}
            type="button"
            onClick={() => onEdit && onEdit(txn)}
          >
            Edit
          </button>
          <button
            style={deleteBtn}
            type="button"
            onClick={() => onDelete && onDelete(id)}
          >
            Delete
          </button>
        </div>
      </div>

      <ul className="transaction-items">
        {items.map((item) => (
          <li key={item.menu_id} className="transaction-item-row">
            <div className="transaction-item-left">
              <span>{item.qty} ×</span>
              <span>{item.name}</span>
            </div>
            <span>${Number(item.line_total || 0).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className="transaction-meta">
        Items: {metaItems} • Qty: {metaQty}
      </div>
    </div>
  );
}

export default TransactionsList;
