import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Login({ onToggle }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Handle login form submission and call the auth helper
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Main background wrapper for the login screen
  const page = {
    minHeight: "100vh",
    width: "100vw",
    background: "linear-gradient(to bottom, #fae7d3, #f7c9b6)",
    fontFamily: "'Poppins', sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    boxSizing: "border-box",
  };

  // Card container that holds the login form content
  const card = {
    width: "100%",
    maxWidth: "420px",
    background: "#fffaf5",
    padding: "2.5rem",
    borderRadius: "24px",
    boxShadow: "0 12px 35px rgba(80, 50, 30, 0.15)",
    color: "#5d4037",
    textAlign: "center",
  };

  const title = {
    fontSize: "2.2rem",
    fontWeight: 700,
    marginBottom: "1.5rem",
  };

  //  styling for text inputs
  const input = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    border: "1px solid #e0cfc2",
    marginBottom: "1rem",
    fontSize: "1rem",
    background: "#fff",
    color: "#5d4037",
    outline: "none",
    transition: "0.2s ease",
  };

  const inputFocus = {
    border: "1px solid #d4a373",
    boxShadow: "0 0 8px rgba(212,163,115,0.5)",
  };

  const button = {
    width: "100%",
    padding: "0.8rem",
    borderRadius: "12px",
    border: "none",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    background: "#d4a373",
    color: "#fff",
    marginTop: "0.5rem",
    transition: "0.25s ease",
  };

  const linkButton = {
    background: "none",
    border: "none",
    color: "#6a4f4b",
    fontWeight: 600,
    textDecoration: "underline",
    cursor: "pointer",
    padding: 0,
    marginLeft: "0.25rem",
  };

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={title}>Halwa Cafe Login</h1>

        {/* email and password login form */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={input}
            onFocus={(e) => Object.assign(e.target.style, inputFocus)}
            onBlur={(e) => Object.assign(e.target.style, input)}
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            style={input}
            onFocus={(e) => Object.assign(e.target.style, inputFocus)}
            onBlur={(e) => Object.assign(e.target.style, input)}
          />

          <button type="submit" disabled={loading} style={button}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* signup view if the user does not have an account yet */}
        <p style={{ marginTop: "1rem", fontSize: "0.95rem" }}>
          Don't have an account?
          <button onClick={onToggle} style={linkButton}>
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
