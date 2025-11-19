import { useState } from "react"; 
import api from "../utils/api";

function EmployeeForm({ onClose, onAdded }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [wages, setWages] = useState("");
  const [timeOff, setTimeOff] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/employees", {
        name,
        email,
        password,
        wages,
        time_off: timeOff
      });

      alert("Employee added successfully!");
      onAdded();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to add employee");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="employee-form">
      
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Temporary Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <input
        type="number"
        step="0.01"
        placeholder="Hourly Wage"
        value={wages}
        onChange={(e) => setWages(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Time Off (days)"
        value={timeOff}
        onChange={(e) => setTimeOff(e.target.value)}
        required
      />

      <button type="submit">Add</button>
      <button type="button" onClick={onClose}>Cancel</button>

    </form>
  );
}

export default EmployeeForm;
