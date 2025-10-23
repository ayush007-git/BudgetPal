import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Landing.css';
import logo from '../assets/logo.jpg'; 
import Features from './Features';
import Pricing from './Pricing';
import About from './About';
import Contact from './Contact';
import Footer from './Footer';


const BudgetPalLanding = () => {
  return (
    <div className="landing-container">
      <nav className="navigation">
        <div className="nav-brand">
          <div className="logo-placeholder">
            <img src={logo} alt="BudgetPal Logo" className="logo-image" />
          </div>
          <span className="brand-text">BudgetPal</span>
        </div>
        
        <div className="nav-menu">
          <a href="#features" className="nav-link">Features</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#contact" className="nav-link">Contact</a>
        </div>
        
        <div className="nav-actions">
          <Link to="/signup" className="sign-up-btn">Sign Up</Link>
          <Link to="/login" className="get-started-btn">Get Started</Link>
        </div>
      </nav>
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Split Bills<br />
            <span className="hero-title-italic">Stress-Free</span>
          </h1>
          
          <p className="hero-description">
            BudgetPal makes group expense tracking simple, transparent, and hassle-free. 
            Perfect for roommates, trips, and team events.
          </p>
          
          <Link to="/login" className="cta-button">
            <span>Get Started here</span>
            <svg className="cta-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        <div className="hero-illustration">
          <div className="illustration-container">
            <div className="dashboard-card">
              <div className="dashboard-header">
                <div className="window-controls">
                  <div className="control-btn red"></div>
                  <div className="control-btn yellow"></div>
                  <div className="control-btn green"></div>
                </div>
                <span className="dashboard-amount">₹11.34 110%</span>
              </div>
              <div className="chart-section">
                <div className="bar-chart">
                  <div className="bar bar-1"></div>
                  <div className="bar bar-2"></div>
                  <div className="bar bar-3"></div>
                  <div className="bar bar-4"></div>
                  <div className="bar bar-5"></div>
                </div>
                
                <div className="chart-widget">
                  <svg className="trending-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <div className="mini-chart">
                    <div className="mini-bar mini-bar-1"></div>
                    <div className="mini-bar mini-bar-2"></div>
                    <div className="mini-bar mini-bar-3"></div>
                    <div className="mini-bar mini-bar-4"></div>
                    <div className="mini-bar mini-bar-5"></div>
                    <div className="mini-bar mini-bar-6"></div>
                  </div>
                </div>
              </div>
              <div className="stats-section">
                <div className="stat-item">
                  <span className="stat-label">Expenses</span>
                  <span className="stat-value">₹2,450</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Savings</span>
                  <span className="stat-value savings">₹1,220</span>
                </div>
              </div>
            </div>
            <div className="floating-element top-left">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            
            <div className="floating-element bottom-right">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="person left-person">
              <div className="person-head"></div>
              <div className="person-body"></div>
            </div>
            
            <div className="person right-person">
              <div className="person-head"></div>
              <div className="person-body"></div>
            </div>
            <div className="plant left-plant">
              <div className="plant-stem"></div>
              <div className="plant-leaves"></div>
            </div>
            
            <div className="plant right-plant">
              <div className="plant-stem"></div>
              <div className="plant-leaves"></div>
            </div>
          </div>
        </div>
      </div>
      <Features />
      <Pricing />
      <About />
      <Contact />
      <Footer />
      <div className="bg-circle circle-1"></div>
      <div className="bg-circle circle-2"></div>
      <div className="bg-circle circle-3"></div>
    </div>
  );
};

export default BudgetPalLanding;