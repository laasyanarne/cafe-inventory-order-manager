import { useAuth } from "../context/AuthContext";
import EmployeeList from "../components/EmployeeList";
import { useState, useRef } from "react";
import { X } from "lucide-react";
import api from "../utils/api";
import { useToast } from "../context/ToastContext";
import "./EmployeesPage.css";

function AddEmployeeModal({ onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/employees", form);
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add employee");
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Add Employee</h2>
            <p className="modal-desc">Create a new team member account</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label className="form-label form-label-required">Full Name</label>
              <input
                className="form-input"
                placeholder="e.g. Alex Johnson"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div className="form-field">
              <label className="form-label form-label-required">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="alex@halwa.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label form-label-required">Temporary Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Adding…" : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmployeesPage() {
  const { user } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const listRef = useRef(null);

  const isManager = user?.role === "manager";

  const handleSaved = () => {
    setAddOpen(false);
    listRef.current?.refresh();
  };

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">Manage your team and account access</p>
        </div>
        {isManager && (
          <button className="btn btn-primary" onClick={() => setAddOpen(true)}>+ Add Employee</button>
        )}
      </header>

      <div className="card">
        <EmployeeList ref={listRef} />
      </div>

      {addOpen && (
        <AddEmployeeModal onClose={() => setAddOpen(false)} onSaved={handleSaved} />
      )}
    </div>
  );
}

export default EmployeesPage;
