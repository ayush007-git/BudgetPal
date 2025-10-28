import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Settings.css';
import { API_BASE_URL } from '../config';
import { useToast } from '../components/ToastProvider';

export default function Settings() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    username: '',
    emergencyQuestion: '',
    emergencyAnswer: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
      setFormData(prev => ({
        ...prev,
        username: userData.username || '',
        emergencyQuestion: userData.emergencyQuestion || ''
      }));
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${API_BASE_URL}/api/auth/set-emergency-question`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: formData.username,
          emergencyQuestion: formData.emergencyQuestion,
          emergencyAnswer: formData.emergencyAnswer
        })
      });

      if (res.ok) {
        showSuccess('Profile updated successfully!');
        fetchUserData();
      } else {
        const error = await res.json();
        showError(error.message || 'Failed to update profile');
      }
    } catch (err) {
      showError('Error updating profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      showError('New password must be at least 6 characters');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showSuccess('Password changed successfully!');
        // Reset password form
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        showError(data.message || 'Failed to change password');
      }
    } catch (err) {
      showError('Error changing password. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        
        const res = await fetch(`${API_BASE_URL}/api/auth/delete-account`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          showSuccess('Account deleted successfully');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          const error = await res.json();
          showError(error.message || 'Failed to delete account');
        }
      } catch (err) {
        showError('Error deleting account. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Settings</h1>
      </div>

      <div className="settings-container">
        {/* Sidebar */}
        <div className="settings-sidebar">
          <nav className="settings-nav">
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              👤 Profile
            </button>
            <button 
              className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              🔒 Security
            </button>
            <button 
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              🔔 Notifications
            </button>
            <button 
              className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              ⚙️ Account
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile Information</h2>
              <form onSubmit={handleUpdateProfile} className="settings-form">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled
                    className="disabled-input"
                  />
                  <small>Username cannot be changed</small>
                </div>
                
                <div className="form-group">
                  <label>Emergency Question</label>
                  <input
                    type="text"
                    name="emergencyQuestion"
                    value={formData.emergencyQuestion}
                    onChange={handleInputChange}
                    placeholder="e.g., What is your mother's maiden name?"
                  />
                </div>
                
                <div className="form-group">
                  <label>Emergency Answer</label>
                  <input
                    type="text"
                    name="emergencyAnswer"
                    value={formData.emergencyAnswer}
                    onChange={handleInputChange}
                    placeholder="Your answer"
                  />
                </div>
                
                <button type="submit" className="save-btn">Save Changes</button>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Change Password</h2>
              <form onSubmit={handleChangePassword} className="settings-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <button type="submit" className="save-btn">Change Password</button>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              <div className="notification-settings">
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>New Expenses</h4>
                    <p>Get notified when someone adds an expense to your groups</p>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Payment Reminders</h4>
                    <p>Receive reminders about outstanding payments</p>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Group Updates</h4>
                    <p>Notifications when members join or leave your groups</p>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="settings-section">
              <h2>Account Management</h2>
              <div className="account-actions">
                <div className="action-item">
                  <div className="action-info">
                    <h4>Export Data</h4>
                    <p>Download a copy of your data</p>
                  </div>
                  <button className="action-btn secondary">Export</button>
                </div>
                
                <div className="action-item">
                  <div className="action-info">
                    <h4>Logout</h4>
                    <p>Sign out of your account</p>
                  </div>
                  <button className="action-btn warning" onClick={handleLogout}>Logout</button>
                </div>
                
                <div className="action-item danger">
                  <div className="action-info">
                    <h4>Delete Account</h4>
                    <p>Permanently delete your account and all data</p>
                  </div>
                  <button className="action-btn danger" onClick={handleDeleteAccount}>Delete Account</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
