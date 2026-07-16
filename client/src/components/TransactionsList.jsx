import {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import api from "../utils/api";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "./ConfirmDialog";

const TransactionsList = forwardRef(function TransactionsList({ onEdit, statusFilter }, ref) {
  const toast = useToast();
  const confirm = useConfirm();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null); // expanded transaction id

  const loadTransactions = async () => {
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data || []);
    } catch (err) {
      console.error("Error loading transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTransactions(); }, []);
  useImperativeHandle(ref, () => ({ refresh: loadTransactions }));

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Delete Transaction",
      message: `Permanently delete transaction #${id}? This cannot be undone.`,
      confirmLabel: "Delete",
    });
    if (!ok) return;
    try {
      await api.delete(`/transactions/${id}`);
      loadTransactions();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete transaction");
    }
  };

  if (loading) return <p className="loading-state">Loading transactions…</p>;

  const base = statusFilter
    ? transactions.filter(t => t.status === statusFilter)
    : transactions;

  const totalRevenue = base.reduce((s, t) => s + Number(t.total || 0), 0);
  const term = search.toLowerCase();
  const filtered = base.filter(t => {
    if (!term) return true;
    const customer = (t.customer || "").toLowerCase();
    return customer.includes(term) || String(t.id).includes(term);
  });

  return (
    <>
      {/* Toolbar */}
      <div className="txn-toolbar">
        <div className="search-wrap">
          <span className="search-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input
            className="search-input"
            placeholder="Search by customer or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="txn-summary">
          <span className="txn-summary-item">
            <span className="txn-summary-val">{base.length}</span>
            <span className="txn-summary-label">
              {statusFilter === "completed" ? "completed orders" : "transactions"}
            </span>
          </span>
          <span className="txn-summary-divider" />
          <span className="txn-summary-item">
            <span className="txn-summary-val">${totalRevenue.toFixed(2)}</span>
            <span className="txn-summary-label">total revenue</span>
          </span>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">{search ? "No matching transactions" : "No transactions yet"}</p>
          <p className="empty-state-desc">
            {search ? "Try a different search term." : "Place your first order using the button above."}
          </p>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }} />
                <th>ID</th>
                <th>Customer</th>
                <th className="th-right">Items</th>
                <th className="th-right">Total</th>
                <th className="th-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <TransactionRow
                  key={t.id}
                  txn={t}
                  expanded={expanded === t.id}
                  onExpand={() => setExpanded(expanded === t.id ? null : t.id)}
                  onEdit={onEdit}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
});

function TransactionRow({ txn, expanded, onExpand, onEdit, onDelete }) {
  const { id, customer, total, items = [], total_items } = txn;
  const displayName = customer && customer.trim() && customer !== "Walk-in customer"
    ? customer : "Walk-in";
  const itemCount = total_items ?? items.length;

  return (
    <>
      <tr className={expanded ? "txn-row-expanded" : ""}>
        <td style={{ width: 40, paddingRight: 0 }}>
          <button
            className="btn-icon txn-expand-btn"
            title={expanded ? "Collapse" : "Expand items"}
            onClick={onExpand}
            aria-expanded={expanded}
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 150ms ease" }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </td>
        <td className="td-muted">#{id}</td>
        <td style={{ fontWeight: 500 }}>{displayName}</td>
        <td className="td-right td-muted">{itemCount}</td>
        <td className="td-right" style={{ fontWeight: 600 }}>
          ${Number(total || 0).toFixed(2)}
        </td>
        <td className="td-actions">
          <button className="btn-icon" title="Edit" onClick={() => onEdit && onEdit(txn)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button className="btn-icon btn-icon-danger" title="Delete" onClick={() => onDelete && onDelete(id)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
          </button>
        </td>
      </tr>
      {expanded && items.length > 0 && (
        <tr className="txn-items-row">
          <td colSpan={6} style={{ padding: "0 16px 12px 56px" }}>
            <div className="txn-items-list">
              {items.map(item => (
                <div key={item.product_id ?? item.name} className="txn-item">
                  <span className="txn-item-name">{item.qty} × {item.name}</span>
                  <span className="txn-item-price">${Number(item.line_total || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default TransactionsList;
