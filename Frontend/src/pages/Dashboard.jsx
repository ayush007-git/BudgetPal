import React from "react";
import "../styles/Dashboard.css";
import logo from "../assets/logo.jpg"; // logo like in landing page

const groups = [
  { name: "Paris Trip 2024", members: 4, balance: -150, lastActivity: "2 days ago", icon: "✈️" },
  { name: "Apartment 5B", members: 3, balance: 85.5, lastActivity: "1 week ago", icon: "🏠" },
  { name: "Office Lunch Group", members: 6, balance: -23.25, lastActivity: "3 days ago", icon: "🍴" },
  { name: "Weekend Getaway", members: 5, balance: 245.75, lastActivity: "5 days ago", icon: "🏖️" },
];

export default function Dashboard() {
  const totalBalance = groups.reduce((acc, g) => acc + g.balance, 0);

  // Function to open a blank page
  const openBlank = () => {
    window.open("about:blank", "_blank");
  };

  return (
    <div className="dashboard">
      {/* Navbar */}
      <div className="navbar">
        <div className="logo-container">
          <img src={logo} alt="BudgetPal Logo" className="logo-image" />
          <h1 className="logo-text">BudgetPal</h1>
        </div>
        <div className="icons">
          <span onClick={openBlank}>🔔</span>
          <span onClick={openBlank}>⚙️</span>
          <span onClick={openBlank}>👤</span>
        </div>
      </div>

      {/* Welcome */}
      <div className="welcome">
        <h2>Welcome back,</h2>
        <p>Here's your financial overview and recent group activity.</p>
      </div>

      {/* Financial Summary */}
      <div className="summary">
        <div>
          <h3>💲 Financial Summary</h3>
          <p>Total Balance</p>
          <p className={totalBalance >= 0 ? "positive" : "negative"}>
            {totalBalance >= 0 ? `+$${totalBalance.toFixed(2)}` : `-$${Math.abs(totalBalance).toFixed(2)}`}
          </p>
        </div>
        <button className="settle-btn" onClick={openBlank}>Settle Up</button>
      </div>

      {/* Groups */}
      <div className="groups">
        <div className="groups-header">
          <h3>Your Groups</h3>
          <button className="create-btn" onClick={openBlank}>+ Create group</button>
        </div>
        <div className="group-list">
          {groups.map((g, i) => (
            <div className="group-card" key={i}>
              <h4>{g.icon} {g.name}</h4>
              <p className="members">{g.members} Members</p>
              <p className={g.balance >= 0 ? "positive" : "negative"}>
                {g.balance >= 0
                  ? `You are owed $${g.balance.toFixed(2)}`
                  : `You owe $${Math.abs(g.balance).toFixed(2)}`}
              </p>
              <p className="last-activity">📅 Last activity {g.lastActivity}</p>
              <button onClick={openBlank}>View Details</button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="actions">
        <h3>Quick Actions</h3>
        <div className="action-list">
          <button onClick={openBlank}>➕ Add Expenses</button>
          <button onClick={openBlank}>👥 Invite Friends</button>
          <button onClick={openBlank}>💲 View all balances</button>
          <button onClick={openBlank}>📅 Recent activity</button>
        </div>
      </div>
    </div>
  );
}
