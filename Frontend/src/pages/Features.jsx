import React from "react";
import "../styles/Features.css";

const Features = () => {
  const features = [
    { icon: "💰", title: "Split bills instantly", desc: "Divide expenses quickly with friends." },
    { icon: "📊", title: "View spending insights", desc: "Analyze your spending patterns easily." },
    { icon: "🤝", title: "Share with friends", desc: "Collaborate and manage group expenses." },
    { icon: "🔔", title: "Smart notifications", desc: "Get reminders for pending payments." },
    { icon: "📱", title: "Mobile friendly", desc: "Access your data anytime, anywhere." },
    { icon: "🔒", title: "Secure data", desc: "Your personal and financial data is fully encrypted." },
    { icon: "⚡", title: "Quick settlements", desc: "Settle debts instantly with a few clicks." },
    { icon: "🌐", title: "Multi-currency support", desc: "Handle expenses across different currencies effortlessly." },
  ];

  return (
    <section id="features" className="features-section">
      <div className="features-header">
        <h2>Our Features</h2>
        <p>Track expenses, visualize data, and simplify settlements effortlessly.</p>
      </div>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-desc">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
