import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <div className="wallet-icon">💼</div>
          <span className="logo-text">BudgetPal</span>
        </div>

        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="header-actions">
          <a href="#signup" className="sign-up">Sign Up</a>
          <button className="get-started-btn">Get Started</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
