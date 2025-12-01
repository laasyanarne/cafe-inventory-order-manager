import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Shifts.css';

function Shifts() {
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    eid: '',
    start_time: '',
    end_time: ''
  });
  const [editingShift, setEditingShift] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShifts();
    fetchEmployees();
  }, []);

  const fetchShifts = async () => {
    try {
      const res = await api.get('/shifts');
      setShifts(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/shifts/employees');
      setEmployees(res.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.eid || !formData.start_time || !formData.end_time) {
      alert('Please fill in all fields');
      return;
    }

    if (new Date(formData.end_time) <= new Date(formData.start_time)) {
      alert('End time must be after start time');
      return;
    }

    try {
      if (editingShift) {
        await api.put(`/shifts/${editingShift.eid}`, {
          old_start_time: editingShift.start_time,
          start_time: formData.start_time,
          end_time: formData.end_time
        });
        alert('Shift updated successfully!');
        setEditingShift(null);
      } else {
        await api.post('/shifts', formData);
        alert('Shift added successfully!');
      }

      setFormData({ eid: '', start_time: '', end_time: '' });
      fetchShifts();
    } catch (error) {
      console.error('Error submitting shift:', error);
      alert(error.response?.data?.error || 'An error occurred');
    }
  };

  const handleEdit = (shift) => {
    const today = new Date().toISOString().split('T')[0];
    const startTime = shift.start_time ? `${today}T${shift.start_time.slice(0, 5)}` : '';
    const endTime = shift.end_time ? `${today}T${shift.end_time.slice(0, 5)}` : '';

    setFormData({
      eid: shift.eid,
      start_time: startTime,
      end_time: endTime
    });
    setEditingShift(shift);
  };

  const handleDelete = async (shift) => {
    if (!window.confirm(`Are you sure you want to delete this shift for ${shift.employee_name}?`)) return;

    try {
      await api.delete(`/shifts/${shift.eid}/${encodeURIComponent(shift.start_time)}`);
      alert('Shift deleted successfully!');
      fetchShifts();
    } catch (error) {
      console.error('Error deleting shift:', error);
      alert(error.response?.data?.error || 'An error occurred');
    }
  };

  const handleCancelEdit = () => {
    setEditingShift(null);
    setFormData({ eid: '', start_time: '', end_time: '' });
  };

  const formatDateTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.slice(0, 5); 
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return 'N/A';
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    const diffMinutes = endMinutes - startMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="shifts-page">
        <div className="shifts-card">
          <div className="loading">Loading shifts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="shifts-page">
      <div className="shifts-card">
        <header className="shifts-header">
          <h1 className="shifts-title">Shift Management</h1>
        </header>

        <div className="form-section">
          <h2>{editingShift ? 'Edit Shift' : 'Add New Shift'}</h2>

          <form onSubmit={handleSubmit} className="shift-form">
            <select
              name="eid"
              value={formData.eid}
              onChange={handleInputChange}
              required
              disabled={editingShift !== null}
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.eid} value={emp.eid}>
                  {emp.name} (ID: {emp.eid})
                </option>
              ))}
            </select>

            <div className="datetime-group">
              <div className="datetime-field">
                <label>Start Time</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="datetime-field">
                <label>End Time</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-submit">
                {editingShift ? 'Update Shift' : 'Add Shift'}
              </button>

              {editingShift && (
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="shifts-list">
          <h2>Scheduled Shifts</h2>

          {shifts.length === 0 ? (
            <p className="no-data">No shifts scheduled. Add your first shift!</p>
          ) : (
            <div className="shift-grid">
              {shifts.map((shift, index) => (
                <div
                  key={`${shift.eid}-${shift.start_time}-${index}`}
                  className="shift-card"
                >
                  <div className="shift-header">
                    <h3>{shift.employee_name}</h3>
                    <span className="employee-id">ID: {shift.eid}</span>
                  </div>

                  <div className="shift-details">
                    <div className="shift-time">
                      <strong>Start:</strong> {formatDateTime(shift.start_time)}
                    </div>
                    <div className="shift-time">
                      <strong>End:</strong> {formatDateTime(shift.end_time)}
                    </div>
                    <div className="shift-duration">
                      <strong>Duration:</strong>{' '}
                      {calculateDuration(shift.start_time, shift.end_time)}
                    </div>
                  </div>

                  <div className="shift-actions">
                    <button className="btn-edit" onClick={() => handleEdit(shift)}>
                      Edit
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(shift)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Shifts;