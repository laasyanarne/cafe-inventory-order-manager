import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "./ConfirmDialog";
import ChangePasswordModal from "./ChangePasswordModal";

const EmployeeList = forwardRef(function EmployeeList(_, ref) {
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", wages: "", time_off: "" });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => { loadEmployees(); }, []);

  const loadEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({ refresh: loadEmployees }));

  const handlePromote = async (id) => {
    const ok = await confirm({
      title: "Promote Employee",
      message: "Grant this employee manager access?",
      confirmLabel: "Promote",
      variant: "primary",
    });
    if (!ok) return;
    try { await api.put(`/employees/${id}/promote`); loadEmployees(); }
    catch (err) { toast.error(err.response?.data?.error || "Failed to promote"); }
  };

  const handleDemote = async (id) => {
    const ok = await confirm({
      title: "Demote Manager",
      message: "Remove manager access and return to employee?",
      confirmLabel: "Demote",
    });
    if (!ok) return;
    try { await api.put(`/employees/${id}/demote`); loadEmployees(); }
    catch (err) { toast.error(err.response?.data?.error || "Failed to demote"); }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Delete Employee",
      message: "Permanently remove this employee? This cannot be undone.",
      confirmLabel: "Delete",
    });
    if (!ok) return;
    try { await api.delete(`/employees/${id}`); loadEmployees(); }
    catch (err) { toast.error(err.response?.data?.error || "Failed to delete employee"); }
  };

  const startEdit = (emp) => {
    setEditingId(emp.id);
    setEditForm({ name: emp.name, email: emp.email, wages: emp.Wages ?? "", time_off: emp.Time_off ?? "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", email: "", wages: "", time_off: "" });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/employees/${editingId}`, {
        ...editForm,
        wages: Number(editForm.wages),
        time_off: Number(editForm.time_off),
      });
      cancelEdit();
      loadEmployees();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update employee");
    }
  };

  if (loading) return <p className="loading-state">Loading employees…</p>;

  const isManager = user?.role === "manager";

  if (employees.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state-title">No employees yet</p>
        <p className="empty-state-desc">Add your first team member using the button above.</p>
      </div>
    );
  }

  return (
    <>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              {isManager && <th className="th-right">Wages</th>}
              <th className="th-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              editingId === emp.id ? (
                <EmpEditRow
                  key={emp.id}
                  emp={emp}
                  form={editForm}
                  setForm={setEditForm}
                  onSubmit={submitEdit}
                  onCancel={cancelEdit}
                />
              ) : (
                <EmpRow
                  key={emp.id}
                  emp={emp}
                  currentUser={user}
                  isManager={isManager}
                  onEdit={startEdit}
                  onDelete={handleDelete}
                  onPromote={handlePromote}
                  onDemote={handleDemote}
                  onPasswordModal={() => setShowPasswordModal(true)}
                />
              )
            ))}
          </tbody>
        </table>
      </div>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </>
  );
});

function EmpRow({ emp, currentUser, isManager, onEdit, onDelete, onPromote, onDemote, onPasswordModal }) {
  return (
    <tr>
      <td style={{ fontWeight: 600 }}>{emp.name}</td>
      <td className="td-muted">{emp.email}</td>
      <td>
        <span className={`badge ${emp.role === "manager" ? "badge-info role-badge-manager" : "badge-neutral role-badge-employee"}`}>
          {emp.role}
        </span>
      </td>
      {isManager && (
        <td className="td-right td-muted">
          {emp.Wages != null && emp.Wages !== "" ? `$${parseFloat(emp.Wages).toFixed(2)}` : "—"}
        </td>
      )}
      <td className="td-actions">
        {isManager && emp.role === "employee" && (
          <button className="btn btn-sm btn-secondary" onClick={() => onPromote(emp.id)} style={{ marginRight: 4 }}>
            Promote
          </button>
        )}
        {isManager && emp.role === "manager" && emp.id !== currentUser.id && (
          <button className="btn btn-sm btn-secondary" onClick={() => onDemote(emp.id)} style={{ marginRight: 4 }}>
            Demote
          </button>
        )}
        {isManager && (
          <button className="btn-icon" title="Edit" onClick={() => onEdit(emp)} style={{ marginRight: 2 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        )}
        {isManager && emp.id !== currentUser.id && (
          <button className="btn-icon btn-icon-danger" title="Delete" onClick={() => onDelete(emp.id)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
          </button>
        )}
        {emp.id === currentUser.id && (
          <button className="btn btn-sm btn-secondary" onClick={onPasswordModal}>
            Change Password
          </button>
        )}
      </td>
    </tr>
  );
}

function EmpEditRow({ emp, form, setForm, onSubmit, onCancel }) {
  return (
    <tr>
      <td>
        <input
          className="inline-edit-input"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="Name"
          required
        />
      </td>
      <td>
        <input
          className="inline-edit-input"
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          required
        />
      </td>
      <td>
        <span className={`badge ${emp.role === "manager" ? "badge-info role-badge-manager" : "badge-neutral role-badge-employee"}`}>
          {emp.role}
        </span>
      </td>
      <td>
        <input
          className="inline-edit-input"
          type="number"
          step="0.01"
          min="0"
          value={form.wages}
          onChange={e => setForm({ ...form, wages: e.target.value })}
          placeholder="0.00"
          style={{ maxWidth: 90 }}
        />
      </td>
      <td className="td-actions">
        <button className="btn btn-sm btn-primary" onClick={onSubmit}>Save</button>
        <button className="btn btn-sm btn-secondary" onClick={onCancel} style={{ marginLeft: 6 }}>Cancel</button>
      </td>
    </tr>
  );
}

export default EmployeeList;
