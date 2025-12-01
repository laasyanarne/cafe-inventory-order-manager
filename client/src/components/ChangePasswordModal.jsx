import { useState } from "react";
import api from "../utils/api";

export default function ChangePasswordModal({ onClose }) {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    if (newPw !== confirmPw) {
      alert("New passwords do not match");
      return;
    }

    try {
      await api.put("/employees/me/password", {
        old_password: oldPw,
        new_password: newPw,
      });

      alert("Password updated!");
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update password");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "12px",
          minWidth: "350px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>Change Password</h2>

        <form onSubmit={submit}>

          <input
            type="password"
            placeholder="Current Password"
            value={oldPw}
            onChange={(e) => setOldPw(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            required
            style={inputStyle}
          />

          <div style={{ marginTop: "1rem" }}>
            <button
              type="submit"
              style={{
                padding: "0.5rem 1rem",
                background: "#81c784",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                marginRight: "0.5rem",
              }}
            >
              Save
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0.5rem 1rem",
                background: "#e57373",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  marginBottom: "0.6rem",
  padding: "0.5rem",
  borderRadius: "6px",
  border: "1px solid #ccc",
};
