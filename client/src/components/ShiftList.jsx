import { useEffect, useState } from "react";
import api from "../utils/api";

function ShiftList() {
  // Track all shifts, employees, loading state, and the small add-shift form
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ employee_id: "", start_time: "", end_time: "" });

  useEffect(() => {
    // Get both shifts and employees so the dropdown has names
    loadShifts();
    loadEmployees();
  }, []);

  const loadShifts = async () => {
    try {
      const res = await api.get("/shifts");
      setShifts(res.data);
    } catch (err) {
      console.error("Error loading shifts:", err);
      alert(err.response?.data?.error || "Failed to load shifts");
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error("Error loading employees:", err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    // check for incomplete shift data
    if (!form.employee_id || !form.start_time || !form.end_time) {
      alert("All fields are required");
      return;
    }

    try {
      await api.post("/shifts", form);
      setForm({ employee_id: "", start_time: "", end_time: "" });
      loadShifts();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add shift");
    }
  };

  const handleDelete = async (employeeId, startTime, endTime) => {
    if (!window.confirm("Delete this shift?")) return;

    try {
      const encodedStart = encodeURIComponent(startTime);
      const encodedEnd = encodeURIComponent(endTime);
      await api.delete(`/shifts/${employeeId}/${encodedStart}/${encodedEnd}`);
      loadShifts();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete shift");
    }
  };

  if (loading) {
    return <div>Loading shifts...</div>;
  }

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Shifts</h2>
      
      {/* form to add a new shift for any employee */}
      <form
        onSubmit={handleAdd}
        style={{
          marginBottom: "1rem",
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <select
          value={form.employee_id}
          onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
          required
          style={{ padding: "0.5rem" }}
        >
          <option value="">Select Employee</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>
        <input
          type="time"
          placeholder="Start Time"
          value={form.start_time}
          onChange={(e) => setForm({ ...form, start_time: e.target.value })}
          required
          style={{ padding: "0.5rem" }}
        />
        <input
          type="time"
          placeholder="End Time"
          value={form.end_time}
          onChange={(e) => setForm({ ...form, end_time: e.target.value })}
          required
          style={{ padding: "0.5rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Add Shift
        </button>
      </form>

      {/* Simple list of existing shifts with a delete functionalith */}
      <div style={{ display: "grid", gap: "0.5rem" }}>
        {shifts.map((shift, index) => (
          <div
            key={`${shift.employee_id}-${shift.start_time}-${shift.end_time}-${index}`}
            style={{
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong>{shift.employee_name || `Employee ${shift.employee_id}`}</strong>
              {" — "}
              {shift.start_time} - {shift.end_time}
            </div>
            <button
              onClick={() =>
                handleDelete(shift.employee_id, shift.start_time, shift.end_time)
              }
              style={{
                padding: "0.25rem 0.5rem",
                backgroundColor: "#e57373",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShiftList;
