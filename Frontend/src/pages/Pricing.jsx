import React from "react";
import "../styles/Pricing.css";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "$0 / month",
      features: [
        { text: "Basic expense tracking", icon: "✔️" },
        { text: "Up to 5 groups", icon: "✔️" },
        { text: "Limited reports", icon: "✔️" },
      ],
      highlight: false,
      badge: "Starter",
    },
    {
      name: "Pro",
      price: "$4.99 / month",
      features: [
        { text: "Unlimited groups", icon: "✔️" },
        { text: "Advanced analytics", icon: "✔️" },
        { text: "Priority support", icon: "✔️" },
        { text: "Custom notifications", icon: "✔️" },
      ],
      highlight: true,
      badge: "Most Popular",
    },
    {
      name: "Enterprise",
      price: "$19.99 / month",
      features: [
        { text: "Team management", icon: "✔️" },
        { text: "Custom integrations", icon: "✔️" },
        { text: "Dedicated support", icon: "✔️" },
        { text: "Multi-currency support", icon: "✔️" },
      ],
      highlight: false,
      badge: "Advanced",
    },
  ];

  return (
    <section id="pricing" className="pricing-section">
      <div className="pricing-header">
        <h2>Pricing Plans</h2>
        <p>Choose a plan that fits your needs. Simple, transparent, and flexible.</p>
      </div>
      <div className="pricing-grid">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`pricing-card ${plan.highlight ? "highlight" : ""}`}
          >
            {plan.highlight && <div className="ribbon">{plan.badge}</div>}
            <h3 className="plan-name">{plan.name}</h3>
            <p className="plan-price">{plan.price}</p>
            <ul className="plan-features">
              {plan.features.map((feature, idx) => (
                <li key={idx}>
                  <span className="feature-icon">{feature.icon}</span>
                  {feature.text}
                </li>
              ))}
            </ul>
            <button className="select-plan-btn">
              {plan.highlight ? "Get Started" : "Choose Plan"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;
