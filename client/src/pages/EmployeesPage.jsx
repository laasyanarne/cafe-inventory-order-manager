import { useAuth } from "../context/AuthContext";
import EmployeeList from "../components/EmployeeList";
import "./EmployeePage.css";

function EmployeesPage() {
  const { user, logout } = useAuth();

  return (
    <div className="employees-page">
      <div className="employees-card">
        {/* Top bar */}
        <header className="employees-header">
          <h1 className="employees-title">👩‍🍳Employee Management👨‍🍳</h1>

          <div className="employees-header-right">
            <span className="employees-user">
              Welcome, {user?.name} ({user?.role})
            </span>

          </div>
        </header>

        {/* Employees list */}
        <section>
          <h2 className="employees-section-title">Employees</h2>
          {/* EmployeeList already does the data fetch / render */}
          <EmployeeList />
        </section>
      </div>
    </div>
  );
}

export default EmployeesPage;