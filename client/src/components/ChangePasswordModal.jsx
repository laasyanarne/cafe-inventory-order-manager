import { useState } from "react";
import { X } from "lucide-react";
import api from "../utils/api";
import { useToast } from "../context/ToastContext";

export default function ChangePasswordModal({ onClose }) {
  const toast = useToast();
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast.warning("New passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await api.put("/employees/me/password", {
        old_password: oldPw,
        new_password: newPw,
      });
      toast.success("Password updated successfully.");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update password");
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Change Password</h2>
            <p className="modal-desc">Enter your current password to confirm</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-field">
              <label className="form-label form-label-required">Current Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Your current password"
                value={oldPw}
                onChange={e => setOldPw(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-field">
              <label className="form-label form-label-required">New Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Minimum 8 characters"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label form-label-required">Confirm New Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Repeat new password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
