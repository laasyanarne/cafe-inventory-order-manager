import { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

function EmployeeList() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error("Error loading employees:", err);
      alert(err.response?.data?.error || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (employeeId) => {
    if (!window.confirm("Are you sure you want to promote this employee to manager?")) {
      return;
    }

    try {
      await api.put(`/employees/${employeeId}/promote`);
      alert("Employee promoted successfully!");
      loadEmployees(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.error || "Failed to promote employee");
    }
  };

  if (loading) {
    return <div>Loading employees...</div>;
  }

  const isManager = user?.role === "manager";

  return (
    <div>
      <h2>Employees</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {employees.map((emp) => (
          <li
            key={emp.id}
            style={{
              padding: "0.5rem",
              marginBottom: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong>{emp.name}</strong> ({emp.email}) - Role: {emp.role}
            </div>
            {isManager && emp.role === "employee" && (
              <button
                onClick={() => handlePromote(emp.id)}
                style={{
                  padding: "0.25rem 0.5rem",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Promote to Manager
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EmployeeList;

