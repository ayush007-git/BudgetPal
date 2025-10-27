import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import '../styles/CreateGroup.css';

const CreateGroup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#7C3AED',
    icon: '🎯'
  });
  const [loading, setLoading] = useState(false);

  const groupIcons = ['🎯', '🧩', '👥', '🏠', '🚗', '🍕', '🏋️', '✈️', '🎉', '💼'];
  const groupColors = [
    '#7C3AED', '#3B82F6', '#10B981', '#F59E0B', 
    '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIconSelect = (icon) => {
    setFormData(prev => ({
      ...prev,
      icon
    }));
  };

  const handleColorSelect = (color) => {
    setFormData(prev => ({
      ...prev,
      color
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
        body: JSON.stringify({
          name: formData.name,
          description: formData.description
        })
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
    <div className="create-group-page">
      {/* Header */}
      <div className="create-group-header">
        <button className="back-btn" onClick={handleBack}>
          ← Back to Dashboard
        </button>
        <div className="header-content">
          <h1 className="page-title">
            <span className="title-icon">🎯</span>
            Create a New Group
          </h1>
          <p className="page-subtitle">Start tracking shared expenses with your friends or family.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="create-group-content">
        {/* Left Panel - Illustration */}
        <div className="illustration-panel">
          <div className="illustration-content">
            <div className="illustration-icon">🧩</div>
            <h2 className="illustration-title">Organize your trips, dinners, and group spends effortlessly!</h2>
            <p className="illustration-subtitle">Create groups for any shared activity and track expenses with ease.</p>
            
            {/* Preview Card */}
            <div className="preview-card">
              <div className="preview-header" style={{ backgroundColor: formData.color }}>
                <span className="preview-icon">{formData.icon}</span>
                <div className="preview-info">
                  <h4>{formData.name || 'Group Name'}</h4>
                  <p>{formData.description || 'Group description...'}</p>
                </div>
              </div>
              <div className="preview-stats">
                <div className="stat-item">
                  <span className="stat-label">Members</span>
                  <span className="stat-value">1</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Expenses</span>
                  <span className="stat-value">0</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Balance</span>
                  <span className="stat-value">₹0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="form-panel">
          <div className="form-card">
            <div className="form-header">
              <h3>Group Details</h3>
              <p>Fill in the details to create your group</p>
            </div>

            <form onSubmit={handleSubmit} className="create-group-form">
              {/* Group Name */}
              <div className="form-group">
                <label className="form-label">Group Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g., Paris Trip 2024"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  placeholder="Describe what this group is for..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              {/* Group Icon */}
              <div className="form-group">
                <label className="form-label">Group Icon</label>
                <div className="icon-selector">
                  {groupIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                      onClick={() => handleIconSelect(icon)}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Group Color */}
              <div className="form-group">
                <label className="form-label">Group Theme Color</label>
                <div className="color-selector">
                  {groupColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${formData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect(color)}
                    />
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button type="button" onClick={handleBack} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
