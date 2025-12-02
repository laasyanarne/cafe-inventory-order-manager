import { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import ChangePasswordModal from "./ChangePasswordModal";

function EmployeeList() {
  // pull the logged in user so we know their role and id
  const { user } = useAuth();

  // full list of employees shown on the page
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // simple edit state for inline editing of one employee at a time
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    wages: "",
    time_off: "",
  });

  // controls the change password modal for the current user
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  // get the latest employees from the backend
  const loadEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  // manager can promote an employee to manager
  const handlePromote = async (employeeId) => {
    if (!window.confirm("Promote this employee to manager?")) return;

    try {
      await api.put(`/employees/${employeeId}/promote`);
      loadEmployees();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to promote employee");
    }
  };

  // manager can demote a manager back to employee
  const handleDemote = async (employeeId) => {
    if (!window.confirm("Demote this manager back to employee?")) return;

    try {
      await api.put(`/employees/${employeeId}/demote`);
      loadEmployees();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to demote employee");
    }
  };

  // delete an employee record 
  const handleDelete = async (employeeId) => {
    if (!window.confirm("Delete this employee? This cannot be undone.")) return;

    try {
      await api.delete(`/employees/${employeeId}`);
      loadEmployees();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete employee");
    }
  };

  // enter edit mode with the selected employee's current values
  const startEdit = (emp) => {
    setEditingId(emp.id);
    setEditForm({
      name: emp.name,
      email: emp.email,
      wages: emp.Wages ?? "",
      time_off: emp.Time_off ?? "",
    });
  };

  // leave edit mode and clear the form
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", email: "", wages: "", time_off: "" });
  };

  // submit updated employee info to the backend
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
      alert(err.response?.data?.error || "Failed to update employee");
    }
  };

  if (loading) return <div>Loading employees...</div>;

  const isManager = user?.role === "manager";

  // shared style objects for the employee cards and text
  const card = {
    background: "#fff",
    border: "1px solid #f1dfcf",
    borderRadius: "16px",
    padding: "1.25rem",
    marginBottom: "1rem",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const info = {
    display: "flex",
    flexDirection: "column",
    color: "#5d4037",
  };

  const nameStyle = {
    fontSize: "1.1rem",
    fontWeight: "700",
    marginBottom: "0.25rem",
  };

  const roleTag = (role) => ({
    padding: "0.2rem 0.5rem",
    background: role === "manager" ? "#64b5f6" : "#d7ccc8",
    color: "#fff",
    fontWeight: 600,
    borderRadius: "8px",
    fontSize: "0.8rem",
    display: "inline-block",
    marginTop: "0.25rem",
  });

  const btn = {
    padding: "0.4rem 0.8rem",
    border: "none",
    borderRadius: "10px",
    fontWeight: 600,
    cursor: "pointer",
    marginLeft: "0.4rem",
  };

  return (
    <div>
      {employees.map((emp) => (
        <div style={card} key={emp.id}>
          {editingId === emp.id ? (
            <form
              style={{ width: "100%", display: "flex", flexDirection: "column" }}
              onSubmit={submitEdit}
            >
              <input
                style={btn}
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                required
              />

              <input
                style={btn}
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                required
              />

              <input
                style={btn}
                type="number"
                step="0.01"
                value={editForm.wages}
                onChange={(e) =>
                  setEditForm({ ...editForm, wages: e.target.value })
                }
              />

              <input
                style={btn}
                type="number"
                value={editForm.time_off}
                onChange={(e) =>
                  setEditForm({ ...editForm, time_off: e.target.value })
                }
              />

              <div>
                <button
                  type="submit"
                  style={{ ...btn, background: "#81c784", color: "#fff" }}
                >
                  Save
                </button>

                <button
                  type="button"
                  style={{ ...btn, background: "#bdbdbd", color: "#fff" }}
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div style={info}>
                <span style={nameStyle}>{emp.name}</span>
                <span>{emp.email}</span>
                <span style={roleTag(emp.role)}>{emp.role}</span>
              </div>

              <div>
                {/* Promote button for managers, only on employees */}
                {isManager && emp.role === "employee" && (
                  <button
                    style={{ ...btn, background: "#64b5f6", color: "#fff" }}
                    onClick={() => handlePromote(emp.id)}
                  >
                    Promote
                  </button>
                )}

                {/* Demote button for managers, not on their own account */}
                {isManager && emp.role === "manager" && emp.id !== user.id && (
                  <button
                    style={{ ...btn, background: "#ba68c8", color: "#fff" }}
                    onClick={() => handleDemote(emp.id)}
                  >
                    Demote
                  </button>
                )}

                {/* Edit details for any employee, manager only */}
                {isManager && (
                  <button
                    style={{ ...btn, background: "#ffb74d", color: "#fff" }}
                    onClick={() => startEdit(emp)}
                  >
                    Edit
                  </button>
                )}

                {/* Delete other employees, but never yourself */}
                {isManager && emp.id !== user.id && (
                  <button
                    style={{ ...btn, background: "#e57373", color: "#fff" }}
                    onClick={() => handleDelete(emp.id)}
                  >
                    Delete
                  </button>
                )}

                {/* each user can open a password change modal for their own account */}
                {emp.id === user.id && (
                  <button
                    style={{ ...btn, background: "#9575cd", color: "#fff" }}
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Change Password
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      ))}

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}

export default EmployeeList;
