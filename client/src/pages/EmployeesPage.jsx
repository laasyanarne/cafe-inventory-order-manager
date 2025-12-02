import { useAuth } from "../context/AuthContext";
import EmployeeList from "../components/EmployeeList";
import { useState } from "react";
import EmployeeForm from "../components/EmployeeForm";
import api from "../utils/api";

function EmployeesPage() {
  const { user, logout } = useAuth();
  const [adding, setAdding] = useState(false);
  const [newEmp, setNewEmp] = useState({
    name: "",
    email: "",
    password: ""
  });

  const isManager = user?.role === "manager";

  // Add employee API request
  const handleAddEmployee = async (e) => {
    e.preventDefault();

    try {
      await api.post("/employees", newEmp);
      alert("Employee added!");
      setAdding(false);
      setNewEmp({ name: "", email: "", password: "", wages: "", time_off: "" });
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add employee");
    }
  };

  //  Page container 
  const page = {
    minHeight: "100vh",
    width: "100vw",
    background: "linear-gradient(to bottom, #fae7d3, #f7c9b6)",
    fontFamily: "'Poppins', sans-serif",
    color: "#4e342e",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "2rem 1rem",
    boxSizing: "border-box",
  };

  const container = {
    width: "100%",
    maxWidth: "1200px",
    background: "#fffaf5",
    borderRadius: "24px",
    boxShadow: "0 12px 35px rgba(80, 50, 30, 0.15)",
    padding: "2rem clamp(1rem, 5vw, 3rem)",
    boxSizing: "border-box",
  };

  const header = {
    fontSize: "2.5rem",
    fontWeight: 800,
    marginBottom: "1rem",
    color: "#5d4037",
    textAlign: "center",
  };

  const topBar = {
    width: "100%",
    maxWidth: "1200px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    padding: "0 0.5rem",
  };

  const userLabel = {
    color: "#5d4037",
    fontWeight: 600,
    fontSize: "1rem",
  };

  const addBtn = {
    background: "#d4a373",
    border: "none",
    color: "#fff",
    padding: "0.6rem 1.2rem",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
    transition: "0.25s",
  };

  const formCard = {
    background: "#fff",
    borderRadius: "16px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
    border: "1px solid #f1dfcf",
  };

  const input = {
    width: "100%",
    padding: "0.75rem",
    margin: "0.4rem 0",
    borderRadius: "10px",
    border: "1px solid #d7ccc8",
    fontSize: "1rem",
    boxSizing: "border-box",
  };

  const submitBtn = {
    background: "#81c784",
    border: "none",
    padding: "0.7rem 1.4rem",
    borderRadius: "10px",
    color: "white",
    fontWeight: "700",
    marginRight: "0.5rem",
    cursor: "pointer",
  };

  const cancelBtn = {
    background: "#ffb74d",
    border: "none",
    padding: "0.7rem 1.4rem",
    borderRadius: "10px",
    color: "white",
    fontWeight: "700",
    cursor: "pointer",
  };

  return (
    <div style={page}>
      {/* Top bar */}
      <div style={topBar}>
        <span style={userLabel}>
          Welcome, {user?.name} ({user?.role})
        </span>
      </div>

      {/* Main card */}
      <div style={container}>
        <h1 style={header}>Employee Management</h1>

        {/* Manager-only Add Employee button */}
        {isManager && !adding && (
          <button style={addBtn} onClick={() => setAdding(true)}>
            ➕ Add Employee
          </button>
        )}

        {/* Add employee form */}
        {adding && (
          <div style={formCard}>
            <h3 style={{ marginBottom: "0.75rem", color: "#5d4037" }}>
              Add New Employee
            </h3>

            <form onSubmit={handleAddEmployee}>
              <input
                style={input}
                placeholder="Employee Name"
                value={newEmp.name}
                onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                required
              />
              <input
                style={input}
                placeholder="Email"
                value={newEmp.email}
                onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                required
              />
              <input
                style={input}
                type="password"
                placeholder="Temporary Password"
                value={newEmp.password}
                onChange={(e) =>
                  setNewEmp({ ...newEmp, password: e.target.value })
                }
                required
              />

              <button style={submitBtn} type="submit">
                Add
              </button>
              <button
                style={cancelBtn}
                type="button"
                onClick={() => setAdding(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Employee list */}
        <EmployeeList />
      </div>
    </div>
  );
}

export default EmployeesPage;
