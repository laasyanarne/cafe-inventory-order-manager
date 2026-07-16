import { useState, useEffect } from "react";
import { X } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../components/ConfirmDialog";
import "./Customers.css";

function AddCustomerModal({ onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: "", contact: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/customers", form);
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add customer");
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Add Customer</h2>
            <p className="modal-desc">Add a new customer record</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label className="form-label form-label-required">Name</label>
              <input
                className="form-input"
                placeholder="e.g. Jane Smith"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div className="form-field">
              <label className="form-label form-label-required">Contact</label>
              <input
                className="form-input"
                placeholder="Phone or email"
                value={form.contact}
                onChange={e => setForm({ ...form, contact: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Adding…" : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CustomerRow({ customer, onEdit, onDelete, isManager }) {
  return (
    <tr>
      <td className="td-muted">#{customer.cid}</td>
      <td style={{ fontWeight: 600 }}>{customer.name}</td>
      <td className="td-muted">{customer.contact}</td>
      <td className="td-actions">
        {isManager && (
          <>
            <button className="btn-icon" title="Edit" onClick={() => onEdit(customer)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button className="btn-icon btn-icon-danger" title="Delete" onClick={() => onDelete(customer.cid)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </button>
          </>
        )}
      </td>
    </tr>
  );
}

function CustomerEditRow({ customer, onSave, onCancel }) {
  const [form, setForm] = useState({ name: customer.name, contact: customer.contact });

  const handleSave = async (e) => {
    e.preventDefault();
    onSave(customer.cid, form);
  };

  return (
    <tr>
      <td className="td-muted">#{customer.cid}</td>
      <td>
        <input
          className="inline-edit-input"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
          autoFocus
        />
      </td>
      <td>
        <input
          className="inline-edit-input"
          value={form.contact}
          onChange={e => setForm({ ...form, contact: e.target.value })}
          required
        />
      </td>
      <td className="td-actions">
        <button className="btn btn-sm btn-primary" onClick={handleSave}>Save</button>
        <button className="btn btn-sm btn-secondary" onClick={onCancel} style={{ marginLeft: 6 }}>Cancel</button>
      </td>
    </tr>
  );
}

function Customers() {
  const { user } = useAuth();
  const isManager = user?.role === "manager";
  const toast = useToast();
  const confirm = useConfirm();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleDelete = async (cid) => {
    const ok = await confirm({
      title: "Delete Customer",
      message: "Remove this customer record? This cannot be undone.",
      confirmLabel: "Delete",
    });
    if (!ok) return;
    try {
      await api.delete(`/customers/${cid}`);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete customer");
    }
  };

  const handleSaveEdit = async (cid, form) => {
    try {
      await api.put(`/customers/${cid}`, form);
      setEditingId(null);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update customer");
    }
  };

  const q = search.toLowerCase();
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(q) || c.contact.toLowerCase().includes(q)
  );

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Customer directory and contact records</p>
        </div>
        {isManager && (
          <button className="btn btn-primary" onClick={() => setAddOpen(true)}>+ Add Customer</button>
        )}
      </header>

      <div className="card">
        <div className="card-header">
          <div className="search-wrap" style={{ maxWidth: 280 }}>
            <span className="search-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input
              className="search-input"
              placeholder="Search customers…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span className="count-chip">{filtered.length}</span>
        </div>

        {loading ? (
          <p className="loading-state">Loading customers…</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">{search ? "No matching customers" : "No customers yet"}</p>
            <p className="empty-state-desc">
              {search ? "Try a different search term." : "Click \"Add Customer\" to get started."}
            </p>
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>ID</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th className="th-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  editingId === c.cid ? (
                    <CustomerEditRow
                      key={c.cid}
                      customer={c}
                      onSave={handleSaveEdit}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <CustomerRow
                      key={c.cid}
                      customer={c}
                      onEdit={c => setEditingId(c.cid)}
                      onDelete={handleDelete}
                      isManager={isManager}
                    />
                  )
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {addOpen && (
        <AddCustomerModal onClose={() => setAddOpen(false)} onSaved={fetchCustomers} />
      )}
    </div>
  );
}

export default Customers;
