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

function EmployeeShiftSummary() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/reports/employee/shifts");
        if (!isMounted) return;
        setReports(res.data || []);
        setError("");
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setError(
          err.response?.data?.error || "Failed to load employee shift data"
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };


    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading)
    return <p style={{ textAlign: "center", color: "#7b4b32" }}>Loading...</p>;
  if (error)
    return (
      <p style={{ color: "#c62828", fontSize: "0.9rem", textAlign: "center" }}>
        {error}
      </p>
    );

  return (
    <div className="employee-report-section">
      <h3 className="employee-report-title">Employee Shift Summary</h3>

      {/* table view of the summary metrics for each employee */}
      <div className="employee-table-wrapper">
        <table className="employee-table">
          <thead>
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
              <tr key={r.employee_id}>
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
      </div>

      {/* visual summary of average and total hours per employee */}
      <h4 className="chart-subtitle">Average Shift Length (Hours)</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={reports}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0ddd0" />
          <XAxis
            dataKey="employee_id"
            label={{ value: "Employee ID", position: "insideBottom", dy: 10 }}
            stroke="#7b4b32"
          />
          <YAxis
            label={{ value: "Hours", angle: -90, position: "insideLeft" }}
            stroke="#7b4b32"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff7f0",
              border: "1px solid #f0ddd0",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar dataKey="avg_shift" fill="#d88946" name="Avg Shift (hrs)" />
          <Bar dataKey="total_hours" fill="#81c784" name="Total Hours" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EmployeeShiftSummary;
