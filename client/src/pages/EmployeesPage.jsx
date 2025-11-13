import { useAuth } from "../context/AuthContext";
import EmployeeList from "../components/EmployeeList";

function EmployeesPage() {
  const { user, logout } = useAuth();

  const pageStyle = {
    padding: "2rem",
    minHeight: "100vh",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    paddingBottom: "1rem",
    borderBottom: "2px solid #e0e0e0",
  };

  const logoutBtn = {
    padding: "0.5rem 1rem",
    background: "#d4a373",
    border: "none",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1>Employee Management</h1>
        <div>
          <span>
            Welcome, {user.name} ({user.role})
          </span>
          <button onClick={logout} style={logoutBtn}>
            Logout
          </button>
        </div>
      </div>
      <EmployeeList />
    </div>
  );
}

export default EmployeesPage;

