import React, { useState, useEffect } from 'react';
import api from './utils/api';
import './Customers.css';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({ name: '', contact: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setLoading(false);
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

    if (!formData.name || !formData.contact) {
      alert('Please fill in all fields');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, formData);
        alert('Customer updated successfully!');
        setEditingId(null);
      } else {
        await api.post('/customers', formData);
        alert('Customer added successfully!');
      }

      setFormData({ name: '', contact: '' });
      fetchCustomers();
    } catch (error) {
      console.error('Error submitting customer:', error);
      alert(error.response?.data?.error || 'An error occurred');
    }
  };

  const handleEdit = (customer) => {
    setFormData({
      name: customer.name,
      contact: customer.contact
    });
    setEditingId(customer.cid);
  };

  const handleDelete = async (cid) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;

    try {
      await api.delete(`/customers/${cid}`);
      alert('Customer deleted successfully!');
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert(error.response?.data?.error || 'An error occurred');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', contact: '' });
  };

  if (loading) {
    return <div className="loading">Loading customers...</div>;
  }

  return (
    <div className="customers-container">
      <h1 className="page-title">👥 Customer Management</h1>

      <div className="form-section">
        <h2>{editingId ? 'Edit Customer' : 'Add New Customer'}</h2>

        <form onSubmit={handleSubmit} className="customer-form">
          <input
            type="text"
            name="name"
            placeholder="Customer Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />

          <input
            type="text"
            name="contact"
            placeholder="Contact Info"
            value={formData.contact}
            onChange={handleInputChange}
            required
          />

          <div className="form-buttons">
            <button type="submit" className="btn-submit">
              {editingId ? 'Update Customer' : 'Add Customer'}
            </button>

            {editingId && (
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

      <div className="customers-list">
        <h2>Customer List</h2>

        <div className="customer-grid">
          {customers.map((customer) => (
            <div key={customer.cid} className="customer-card">
              <div className="customer-info">
                <h3>{customer.name}</h3>
                <p><strong>ID:</strong> {customer.cid}</p>
                <p><strong>Contact:</strong> {customer.contact}</p>
              </div>

              <div className="customer-actions">
                <button
                  className="btn-edit"
                  onClick={() => handleEdit(customer)}
                >
                  Edit
                </button>

                <button
                  className="btn-delete"
                  onClick={() => handleDelete(customer.cid)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {customers.length === 0 && (
          <p className="no-data">No customers found. Add your first customer!</p>
        )}
      </div>
    </div>
  );
}

export default Customers;