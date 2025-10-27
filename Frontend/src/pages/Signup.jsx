import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
import { API_BASE_URL } from '../config';
import { useToast } from '../components/ToastProvider';
import logo from '../assets/logo.jpg';

const Signup = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        showError(data?.message || 'Signup failed');
        return;
      }

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      showSuccess('Account created successfully!');
      navigate('/dashboard'); 
    } catch (err) {
      showError('Network error. Please try again.');
    }
  };

  const handleBackToHome = () => {
    navigate('/'); 
  };

  const handleSignIn = () => { 
    navigate('/login');
  };

  return (
    <div className="split-auth-container">
      <div className="auth-left-panel signup-left">
        <button className="back-to-home-btn" onClick={handleBackToHome}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to home
        </button>
      </div>

      <div className="auth-right-panel signup-right">
        <div className="auth-form-section">
          <div className="logo-section">
            <div className="circular-logo">
              <img src={logo} alt="BudgetPal Logo" className="logo-img" />
            </div>
          </div>

          <h1 className="auth-page-title">
            BUDGETPAL<br />
            <span className="create-account-text">CREATE AN ACCOUNT</span>
          </h1>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-section">
              <label className="input-label">Username:</label>
              <input
                type="text"
                name="username"
                className="styled-input bordered"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="input-section">
              <label className="input-label">Email:</label>
              <div className="password-field">
                <input
                  type="email"
                  name="email"
                  className="styled-input bordered"
                  placeholder="Enter Your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <svg className="field-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 2L9 14L5 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <div className="input-section">
              <label className="input-label">Password:</label>
              <input
                type="password"
                name="password"
                className="styled-input bordered"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <button type="submit" className="primary-btn">
              Sign Up
            </button>

            <p className="switch-text">
              Already have an account? 
              <button type="button" className="link-btn" onClick={handleSignIn}>
                Sign In
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;