import { useEffect, useState } from "react";
import api from "../utils/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

function EmployeeReport() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get("/reports/employee/shifts");
      setReports(res.data);
    };
    fetchData();
  }, []);

  return (
    <div style={{ background: "#fff8f1", padding: "2rem", borderRadius: "16px" }}>
      <h2 style={{ color: "#4e342e", marginBottom: "1rem" }}>
        Employee Shift Summary
      </h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "2rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <thead style={{ backgroundColor: "#ffecb3" }}>
          <tr>
            <th>Employee ID</th>
            <th>Total Shifts</th>
            <th>Total Hours</th>
            <th>Shortest Shift</th>
            <th>Longest Shift</th>
            <th>Average Shift</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.employee_id} style={{ textAlign: "center" }}>
              <td>{r.employee_id}</td>
              <td>{r.total_shifts}</td>
              <td>{r.total_hours}</td>
              <td>{r.shortest_shift}</td>
              <td>{r.longest_shift}</td>
              <td>{Number(r.avg_shift).toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 📊 Bar Chart */}
      <h3 style={{ color: "#4e342e" }}>Average Shift Length (Hours)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={reports} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="employee_id" label={{ value: "Employee ID", position: "insideBottom", dy: 10 }} />
          <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="avg_shift" fill="#ffb74d" name="Avg Shift (hrs)" />
          <Bar dataKey="total_hours" fill="#81c784" name="Total Hours" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EmployeeReport;
