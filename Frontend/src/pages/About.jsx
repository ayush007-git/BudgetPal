import React from "react";
import "../styles/About.css";

const About = () => {
  return (
    <section id="about" className="about-section">
      {/* Centered Title */}
      <h2 className="about-main-title">About BudgetPal</h2>

      {/* Card Content */}
      <div className="about-card">
        <div className="about-text">
          <p>
            <strong>BudgetPal</strong> transforms the way you manage group
            expenses. Whether you’re splitting <em>travel costs</em>,
            <em>room rent</em>, or <em>event budgets</em>, our platform keeps
            everything transparent, simple, and smart — so you can focus on
            experiences, not numbers.
          </p>
          <button className="about-btn">Learn More</button>
        </div>

        <div className="about-illustration">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png"
            alt="Budget illustration"
          />
        </div>
      </div>
    </section>
  );
};

export default About;
