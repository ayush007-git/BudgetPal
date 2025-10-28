import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import { API_BASE_URL } from "../config";
import { useToast } from "../components/ToastProvider";
import logo from "../assets/logo.jpg";
import loginImage1 from "../assets/login-image1.jpeg";
import loginImage2 from "../assets/login-image2.jpeg";
import loginImage3 from "../assets/login-image3.jpeg";

const Login = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useToast();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const images = [loginImage1, loginImage2, loginImage3];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Image fade slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        showError(data?.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      showSuccess("Login successful!");
      navigate("/dashboard");
    } catch {
      showError("Network error. Please try again.");
    }
  };

  return (
    <div className="split-auth-container">
      <div className="auth-left-panel">
        <button className="back-to-home-btn" onClick={() => navigate("/")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19L5 12L12 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to home
        </button>

        <div className="auth-fade-slider">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Slide ${index + 1}`}
              className={`auth-fade-slide ${
                index === currentIndex ? "active" : ""
              }`}
            />
          ))}


        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="auth-right-panel">
        <div className="auth-form-section">
          <div className="logo-section">
            <div className="circular-logo">
              <img src={logo} alt="BudgetPal Logo" className="logo-img" />
            </div>
          </div>

          <h1 className="auth-page-title">BUDGETPAL LOGIN</h1>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-section">
              <label className="input-label">Username</label>
              <input
                type="text"
                name="username"
                className="styled-input"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
            </div>

            <div className="input-section">
              <label className="input-label">Password</label>
              <input
                type="password"
                name="password"
                className="styled-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <div className="forgot-link-section">
              <button
                type="button"
                className="forgot-link"
                onClick={() => showInfo("Forgot password feature coming soon")}
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="primary-btn">
              SIGN IN
            </button>

            <p className="switch-text">
              Don’t have an account?{" "}
              <button
                type="button"
                className="link-btn"
                onClick={() => navigate("/signup")}
              >
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
