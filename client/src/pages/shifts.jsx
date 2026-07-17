import { useState, useEffect } from "react";
import { X, Edit2, Trash2, Plus, User } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../components/ConfirmDialog";
import "./shifts.css";

// ── Constants ──────────────────────────────────────────────────────────────

const HOURS      = Array.from({ length: 15 }, (_, i) => i + 7); // [7..21]
const GRID_START = 7;
const SLOT_W     = 56;
const ROW_H      = 44;
const ROW_GAP    = 4;
const ROW_PAD    = 12;

// ── Helpers ────────────────────────────────────────────────────────────────

function parseHour(timeStr) {
  if (!timeStr) return null;
  return parseInt(timeStr.split(":")[0], 10);
}

function fmt(t) {
  if (!t) return "–";
  return t.slice(0, 5);
}

function duration(start, end) {
  if (!start || !end) return "";
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff <= 0) return "";
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function packShifts(shifts) {
  const sorted = [...shifts].sort(
    (a, b) => parseHour(a.start_time) - parseHour(b.start_time)
  );
  const rows = [];
  for (const shift of sorted) {
    let placed = false;
    for (const row of rows) {
      const last = row[row.length - 1];
      if (parseHour(last.end_time) <= parseHour(shift.start_time)) {
        row.push(shift);
        placed = true;
        break;
      }
    }
    if (!placed) rows.push([shift]);
  }
  return rows;
}

function coverageLevel(count) {
  if (count === 0) return "none";
  if (count <= 2)  return "critical";
  if (count <= 5)  return "low";
  if (count <= 9)  return "healthy";
  return "peak";
}

// ── Employee Detail Drawer ─────────────────────────────────────────────────

function EmployeeDetailDrawer({ empId, empName, empShifts, allEmployeeData, isManager, onClose }) {
  const [fullEmp, setFullEmp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empId) return;
    setLoading(true);
    api.get("/employees")
      .then(res => {
        const found = (res.data || []).find(e => String(e.id) === String(empId));
        setFullEmp(found || null);
      })
      .catch(() => setFullEmp(null))
      .finally(() => setLoading(false));
  }, [empId]);

  const totalHours = empShifts.reduce((sum, s) => {
    const s0 = parseHour(s.start_time);
    const s1 = parseHour(s.end_time);
    return sum + (s0 !== null && s1 !== null ? Math.max(0, s1 - s0) : 0);
  }, 0);

  const estCost = isManager && fullEmp?.Wages
    ? totalHours * parseFloat(fullEmp.Wages)
    : null;

  const name  = fullEmp?.name  || empName || "Employee";
  const email = fullEmp?.email || "";
  const role  = fullEmp?.role  || "employee";
  const wage  = fullEmp?.Wages;

  return (
    <div className="emp-drawer-overlay" onClick={onClose}>
      <div className="emp-drawer" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="emp-drawer-header">
          <div className="emp-drawer-avatar">
            <span className="emp-drawer-initials">{initials(name)}</span>
          </div>
          <button className="emp-drawer-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <p className="loading-state" style={{ padding: "24px" }}>Loading…</p>
        ) : (
          <div className="emp-drawer-body">
            {/* Identity */}
            <div className="emp-drawer-identity">
              <h2 className="emp-drawer-name">{name}</h2>
              <span className={`badge ${role === "manager" ? "badge-info role-badge-manager" : "badge-neutral role-badge-employee"}`}>
                {role}
              </span>
            </div>

            {email && (
              <div className="emp-drawer-field">
                <span className="emp-drawer-field-label">Email</span>
                <span className="emp-drawer-field-value">{email}</span>
              </div>
            )}

            {/* Schedule stats */}
            <div className="emp-drawer-stats">
              <div className="emp-drawer-stat">
                <span className="emp-drawer-stat-value">{empShifts.length}</span>
                <span className="emp-drawer-stat-label">shifts</span>
              </div>
              <div className="emp-drawer-stat">
                <span className="emp-drawer-stat-value">{totalHours}h</span>
                <span className="emp-drawer-stat-label">scheduled</span>
              </div>
              {isManager && wage != null && (
                <div className="emp-drawer-stat">
                  <span className="emp-drawer-stat-value">${parseFloat(wage).toFixed(2)}/h</span>
                  <span className="emp-drawer-stat-label">hourly rate</span>
                </div>
              )}
            </div>

            {isManager && estCost !== null && (
              <div className="emp-drawer-cost-row">
                <span className="emp-drawer-cost-label">Est. payroll this schedule</span>
                <span className="emp-drawer-cost-value">${estCost.toFixed(2)}</span>
              </div>
            )}

            {/* Shift list */}
            {empShifts.length > 0 && (
              <div className="emp-drawer-section">
                <div className="emp-drawer-section-title">Shifts</div>
                <ul className="emp-drawer-shifts">
                  {[...empShifts]
                    .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""))
                    .map((s, i) => (
                      <li key={i} className="emp-drawer-shift-row">
                        <span className="emp-drawer-shift-time">
                          {fmt(s.start_time)} – {fmt(s.end_time)}
                        </span>
                        <span className="emp-drawer-shift-dur">
                          {duration(s.start_time, s.end_time)}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {empShifts.length === 0 && (
              <p className="emp-drawer-no-shifts">No shifts scheduled.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shift Modal ────────────────────────────────────────────────────────────

function ShiftModal({ employees, editingShift, onClose, onSaved }) {
  const toast = useToast();
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState(() => {
    if (editingShift) {
      return {
        eid: editingShift.eid,
        start_time: editingShift.start_time
          ? `${today}T${editingShift.start_time.slice(0, 5)}`
          : "",
        end_time: editingShift.end_time
          ? `${today}T${editingShift.end_time.slice(0, 5)}`
          : "",
      };
    }
    return { eid: "", start_time: "", end_time: "" };
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(form.end_time) <= new Date(form.start_time)) {
      toast.warning("End time must be after start time");
      return;
    }
    setSaving(true);
    try {
      if (editingShift) {
        await api.put(`/shifts/${editingShift.eid}`, {
          old_start_time: editingShift.start_time,
          start_time: form.start_time,
          end_time: form.end_time,
        });
      } else {
        await api.post("/shifts", form);
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save shift");
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{editingShift ? "Edit Shift" : "Add Shift"}</h2>
            <p className="modal-desc">Schedule an employee work period</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label className="form-label form-label-required">Employee</label>
              <select
                className="form-select"
                value={form.eid}
                onChange={e => setForm({ ...form, eid: e.target.value })}
                required
                disabled={!!editingShift}
              >
                <option value="">Select employee…</option>
                {employees.map(emp => (
                  <option key={emp.eid} value={emp.eid}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row-2">
              <div className="form-field">
                <label className="form-label form-label-required">Start Time</label>
                <input
                  className="form-input"
                  type="datetime-local"
                  value={form.start_time}
                  onChange={e => setForm({ ...form, start_time: e.target.value })}
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label form-label-required">End Time</label>
                <input
                  className="form-input"
                  type="datetime-local"
                  value={form.end_time}
                  onChange={e => setForm({ ...form, end_time: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : editingShift ? "Update Shift" : "Add Shift"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Shift Block Card ───────────────────────────────────────────────────────

function ShiftCard({ shift, rowIdx, onEdit, onDelete, isManager }) {
  const startH = parseHour(shift.start_time);
  const endH   = parseHour(shift.end_time);
  if (startH === null || endH === null || endH <= startH) return null;

  const left  = (startH - GRID_START) * SLOT_W + 3;
  const width = (endH - startH) * SLOT_W - 6;
  const top   = ROW_PAD / 2 + rowIdx * (ROW_H + ROW_GAP);
  const dur   = duration(shift.start_time, shift.end_time);

  return (
    <div
      className="sched-shift-card"
      style={{ left, width, top, height: ROW_H }}
      title={`${shift.employee_name}: ${fmt(shift.start_time)}–${fmt(shift.end_time)}`}
    >
      <div className="sched-shift-inner">
        <span className="sched-shift-time">
          {fmt(shift.start_time)}–{fmt(shift.end_time)}
        </span>
        {dur && <span className="sched-shift-dur">{dur}</span>}
      </div>
      {isManager && (
        <div className="sched-shift-actions">
          <button
            className="sched-shift-btn"
            title="Edit shift"
            onClick={e => { e.stopPropagation(); onEdit(shift); }}
          >
            <Edit2 size={10} />
          </button>
          <button
            className="sched-shift-btn sched-shift-btn-danger"
            title="Delete shift"
            onClick={e => { e.stopPropagation(); onDelete(shift); }}
          >
            <Trash2 size={10} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Employee Board Row ─────────────────────────────────────────────────────

function EmployeeRow({ emp, onEdit, onDelete, onAdd, onSelectEmp, isManager }) {
  const packed  = packShifts(emp.shifts);
  const numRows = Math.max(1, packed.length);
  const bandH   = numRows * (ROW_H + ROW_GAP) - ROW_GAP + ROW_PAD;

  return (
    <div className="sched-row" style={{ height: bandH }}>
      <div className="sched-emp-cell" style={{ height: bandH }}>
        <div
          className="sched-emp-info sched-emp-info--clickable"
          onClick={() => onSelectEmp(emp)}
          title={`View ${emp.name}'s details`}
        >
          <span className="sched-emp-name">{emp.name}</span>
          <span className="sched-emp-meta">
            {emp.shifts.length} shift{emp.shifts.length !== 1 ? "s" : ""}
          </span>
        </div>
        {isManager && (
          <button
            className="sched-emp-add"
            title={`Add shift for ${emp.name}`}
            onClick={onAdd}
          >
            <Plus size={11} />
          </button>
        )}
      </div>

      <div className="sched-timeline" style={{ height: bandH }}>
        {emp.shifts.length === 0 && (
          <span className="sched-unscheduled">Not scheduled</span>
        )}
        {packed.map((row, rowIdx) =>
          row.map(shift => (
            <ShiftCard
              key={`${shift.eid}-${shift.start_time}`}
              shift={shift}
              rowIdx={rowIdx}
              onEdit={onEdit}
              onDelete={onDelete}
              isManager={isManager}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── Hour Header ────────────────────────────────────────────────────────────

function HourHeader({ hours }) {
  return (
    <div className="sched-header-hours">
      {hours.map(h => (
        <div key={h} className="sched-header-hour">
          {String(h).padStart(2, "0")}:00
        </div>
      ))}
    </div>
  );
}

// ── Main Shifts Page ───────────────────────────────────────────────────────

function Shifts() {
  const { user } = useAuth();
  const isManager = user?.role === "manager";
  const toast = useToast();
  const confirm = useConfirm();

  const [shifts,         setShifts]         = useState([]);
  const [employees,      setEmployees]      = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [modalOpen,      setModalOpen]      = useState(false);
  const [editingShift,   setEditingShift]   = useState(null);
  const [selectedEmp,    setSelectedEmp]    = useState(null); // for drawer

  const fetchShifts = async () => {
    try {
      const res = await api.get("/shifts");
      setShifts(res.data);
    } catch (err) {
      console.error("Error fetching shifts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/shifts/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees for shifts:", err);
    }
  };

  useEffect(() => {
    fetchShifts();
    fetchEmployees();
  }, []);

  const handleDelete = async (shift) => {
    const ok = await confirm({
      title: "Delete Shift",
      message: `Delete the shift for ${shift.employee_name}? This cannot be undone.`,
      confirmLabel: "Delete",
    });
    if (!ok) return;
    try {
      await api.delete(`/shifts/${shift.eid}/${encodeURIComponent(shift.start_time)}`);
      fetchShifts();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete shift");
    }
  };

  const openAdd    = ()    => { setEditingShift(null); setModalOpen(true); };
  const openEdit   = shift => { setEditingShift(shift); setModalOpen(true); };
  const closeModal = ()    => { setModalOpen(false); setEditingShift(null); };
  const handleSaved = ()   => { closeModal(); fetchShifts(); };

  // ── Roster ──────────────────────────────────────────────────────────────

  const rosterMap = {};
  for (const emp of employees) {
    rosterMap[emp.eid] = { eid: emp.eid, name: emp.name, shifts: [] };
  }
  for (const shift of shifts) {
    if (rosterMap[shift.eid]) {
      rosterMap[shift.eid].shifts.push(shift);
    } else {
      rosterMap[shift.eid] = {
        eid: shift.eid,
        name: shift.employee_name,
        shifts: [shift],
      };
    }
  }
  const roster = Object.values(rosterMap).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // ── Coverage ─────────────────────────────────────────────────────────────

  const coverageByHour = {};
  for (const h of HOURS) {
    const workingEids = new Set(
      shifts
        .filter(s => {
          const s0 = parseHour(s.start_time);
          const s1 = parseHour(s.end_time);
          return s0 !== null && s1 !== null && s0 <= h && s1 > h;
        })
        .map(s => s.eid)
    );
    coverageByHour[h] = workingEids.size;
  }

  // ── Summary stats ─────────────────────────────────────────────────────────

  const scheduledCount = roster.filter(e => e.shifts.length > 0).length;
  const totalHours = shifts.reduce((sum, s) => {
    const s0 = parseHour(s.start_time);
    const s1 = parseHour(s.end_time);
    return sum + (s0 !== null && s1 !== null ? Math.max(0, s1 - s0) : 0);
  }, 0);
  const peakH = HOURS.reduce(
    (best, h) => (coverageByHour[h] > coverageByHour[best] ? h : best),
    HOURS[0]
  );
  const peakCount = coverageByHour[peakH] || 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Schedule</h1>
          <p className="page-subtitle">
            Daily shift board ·{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        {isManager && (
          <button className="btn btn-primary" onClick={openAdd}>
            + Add Shift
          </button>
        )}
      </header>

      {/* Summary bar */}
      <div className="sched-summary">
        <div className="sched-summary-stat">
          <span className="sched-summary-value">{scheduledCount}</span>
          <span className="sched-summary-label">staff scheduled</span>
        </div>
        <div className="sched-summary-divider" />
        <div className="sched-summary-stat">
          <span className="sched-summary-value">{shifts.length}</span>
          <span className="sched-summary-label">total shifts</span>
        </div>
        <div className="sched-summary-divider" />
        <div className="sched-summary-stat">
          <span className="sched-summary-value">{totalHours}h</span>
          <span className="sched-summary-label">scheduled hours</span>
        </div>
        <div className="sched-summary-divider" />
        <div className="sched-summary-stat">
          <span className="sched-summary-value">
            {peakCount > 0 ? `${peakCount} staff` : "—"}
          </span>
          <span className="sched-summary-label">
            peak at {String(peakH).padStart(2, "0")}:00
          </span>
        </div>
      </div>

      {loading ? (
        <p className="loading-state">Loading schedule…</p>
      ) : (
        <div className="sched-board-wrap">
          <div className="sched-board">
            <div className="sched-header-row">
              <div className="sched-emp-cell sched-header-name-cell">Staff</div>
              <HourHeader hours={HOURS} />
            </div>

            {roster.length === 0 ? (
              <div className="sched-empty">
                <User size={20} style={{ color: "var(--text-3)", margin: "0 auto 8px" }} />
                <p>No employees found. Add team members in the People section.</p>
              </div>
            ) : roster.map(emp => (
              <EmployeeRow
                key={emp.eid}
                emp={emp}
                onEdit={openEdit}
                onDelete={handleDelete}
                onAdd={openAdd}
                onSelectEmp={setSelectedEmp}
                isManager={isManager}
              />
            ))}

            <div className="sched-cov-row">
              <div className="sched-emp-cell sched-cov-label-cell">Coverage</div>
              <div className="sched-header-hours">
                {HOURS.map(h => {
                  const count = coverageByHour[h] || 0;
                  const level = coverageLevel(count);
                  return (
                    <div
                      key={h}
                      className={`sched-cov-cell sched-cov-${level}`}
                      title={`${String(h).padStart(2,"0")}:00 — ${count} staff`}
                    >
                      {count > 0 ? count : "—"}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee detail drawer */}
      {selectedEmp && (
        <EmployeeDetailDrawer
          empId={selectedEmp.eid}
          empName={selectedEmp.name}
          empShifts={selectedEmp.shifts}
          isManager={isManager}
          onClose={() => setSelectedEmp(null)}
        />
      )}

      {modalOpen && (
        <ShiftModal
          employees={employees}
          editingShift={editingShift}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

export default Shifts;
