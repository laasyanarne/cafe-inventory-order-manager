import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Signup({ onToggle }) {
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const page = {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to bottom, #fae7d3, #f7c9b6)",
    padding: "2rem",
    boxSizing: "border-box",
  };

  const card = {
    width: "100%",
    maxWidth: "900px",
    background: "#fffaf5",
    padding: "clamp(2rem, 4vw, 4rem)",
    borderRadius: "25px",
    boxShadow: "0 12px 35px rgba(80, 50, 30, 0.15)",
    textAlign: "center",
    boxSizing: "border-box",
  };

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  };

  const input = {
    width: "100%",
    maxWidth: "550px",
    padding: "1rem",
    marginBottom: "1rem",
    borderRadius: "12px",
    border: "1px solid #e0cfc2",
    background: "#fff",
    fontSize: "1rem",
    color: "#4e342e",
    outline: "none",
  };

  const signupBtn = {
    width: "100%",
    maxWidth: "550px",
    background: "#d4a373",
    color: "white",
    border: "none",
    padding: "1rem",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "1rem",
    transition: "0.25s",
  };

  const linkBtn = {
    background: "none",
    border: "none",
    color: "#8d6e63",
    cursor: "pointer",
    fontWeight: "600",
    textDecoration: "underline",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={{ fontSize: "2.3rem", marginBottom: "1rem", color: "#5d4037" }}>
          Create Account
        </h1>

        <form onSubmit={handleSubmit} style={formStyle}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={input}
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={input}
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={input}
          />

          <button type="submit" disabled={loading} style={signupBtn}>
            {loading ? "Loading..." : "Sign Up"}
          </button>
        </form>

        <p style={{ marginTop: "1rem", color: "#5d4037" }}>
          Already have an account?{" "}
          <button onClick={onToggle} style={linkBtn}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;
