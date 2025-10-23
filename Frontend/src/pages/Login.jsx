import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css'; 
import { API_BASE_URL } from '../config';
import logo from '../assets/logo.jpg';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
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
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        alert(data?.message || 'Login failed');
        return;
      }

      // Store token and basic user info
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      navigate('/dashboard');
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleForgotPassword = () => {
    const username = prompt('Enter your username to get your emergency question:');
    if (username) {
      // Navigate to a forgot password page or show emergency question
      alert('Forgot password functionality - would redirect to emergency question page');
    }
  };

  return (
    <div className="split-auth-container">
      {/* Left Side - Blue Section */}
      <div className="auth-left-panel">
        <button className="back-to-home-btn" onClick={handleBackToHome}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to home
        </button>
      </div>

      {/* Right Side - Form Section */}
      <div className="auth-right-panel">
        <div className="auth-form-section">
          {/* Logo */}
          <div className="logo-section">
            <div className="circular-logo">
              <img src={logo} alt="BudgetPal Logo" className="logo-img" />
            </div>
          </div>

          {/* Title */}
          <h1 className="auth-page-title">BUDGETPAL LOGIN</h1>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-section">
              <label className="input-label">Username</label>
              <input
                type="text"
                name="username"
                className="styled-input"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="input-section">
              <label className="input-label">Password</label>
              <div className="password-field">
                <input
                  type="password"
                  name="password"
                  className="styled-input"
                  placeholder="Enter Your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <svg className="field-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 2L9 14L5 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <div className="forgot-link-section">
              <button type="button" className="forgot-link" onClick={handleForgotPassword}>
                Forget Password?
              </button>
            </div>

            <button type="submit" className="primary-btn">
              Sign In
            </button>

            <p className="switch-text">
              Don't have an account? 
              <button type="button" className="link-btn" onClick={handleSignUp}>
                Sign Up
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;