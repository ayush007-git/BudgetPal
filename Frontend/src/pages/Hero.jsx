import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-left">
          <h1 className="hero-heading">
            <span className="heading-line">Split Bills</span>
            <span className="heading-line">Stress-Free</span>
          </h1>
          
          <p className="hero-description">
            BudgetPal makes group expense tracking simple, transparent, and hassle-free. Perfect for roommates, trips, and team events.
          </p>
          
          <button className="hero-cta">
            <span>Get Started here</span>
            <span className="arrow-icon">→</span>
          </button>
        </div>
        
        <div className="hero-right">
          <div className="illustration-container">
            <div className="illustration">
              {/* People figures */}
              <div className="person person-1"></div>
              <div className="person person-2"></div>
              <div className="person person-3"></div>
              <div className="person person-4"></div>
              
              {/* Main screens */}
              <div className="screen screen-left">
                <div className="screen-content">
                  <div className="circular-chart">
                    <div className="chart-center">✓</div>
                  </div>
                  <div className="data-list">
                    <div className="data-item">511.34 105</div>
                  </div>
                  <div className="bar-chart">
                    <div className="bar bar-1"></div>
                    <div className="bar bar-2"></div>
                    <div className="bar bar-3"></div>
                  </div>
                </div>
              </div>
              
              <div className="screen screen-right">
                <div className="screen-content">
                  <div className="line-graph"></div>
                  <div className="data-text">Oo</div>
                  <div className="data-numbers">0.00 0.000.0001</div>
                  <div className="bar-chart">
                    <div className="bar bar-1"></div>
                    <div className="bar bar-2"></div>
                    <div className="bar bar-3"></div>
                  </div>
                </div>
              </div>
              
              {/* Plants */}
              <div className="plant plant-left"></div>
              <div className="plant plant-right"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
