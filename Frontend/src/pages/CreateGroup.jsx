import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import '../styles/Dashboard.css';

const CreateGroup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/groups/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        alert(data?.message || 'Failed to create group');
        return;
      }

      alert('Group created successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="dashboard">
      <div className="navbar">
        <div className="logo-container">
          <h1 className="logo-text">Create Group</h1>
        </div>
        <div className="icons">
          <span onClick={handleBack}>← Back</span>
        </div>
      </div>

      <div className="welcome">
        <h2>Create a New Group</h2>
        <p>Start tracking shared expenses with friends or family.</p>
      </div>

      <div className="groups">
        <form onSubmit={handleSubmit} className="group-form">
          <div className="input-section">
            <label className="input-label">Group Name</label>
            <input
              type="text"
              name="name"
              className="styled-input"
              placeholder="e.g., Paris Trip 2024"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="input-section">
            <label className="input-label">Description (Optional)</label>
            <textarea
              name="description"
              className="styled-input"
              placeholder="Describe what this group is for..."
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleBack} className="secondary-btn">
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;
