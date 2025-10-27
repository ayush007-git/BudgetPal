import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Settlement.css';

const AllSettlements = () => {
    const navigate = useNavigate();

    return (
        <div className="all-settlements-page">
            {/* Header Section */}
            <div className="settlements-header">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    ← Dashboard
                </button>
                <div className="header-content">
                    <h1 className="page-title">All Settlements</h1>
                    <p className="page-subtitle">Track outstanding balances across all your groups.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card card-1">
                    <div className="card-icon">💸</div>
                    <div className="card-content">
                        <h3>Total Owed</h3>
                        <p className="card-value">₹150.50</p>
                    </div>
                </div>
                <div className="summary-card card-2">
                    <div className="card-icon">💰</div>
                    <div className="card-content">
                        <h3>Total To Receive</h3>
                        <p className="card-value">₹75.25</p>
                    </div>
                </div>
                <div className="summary-card card-3">
                    <div className="card-icon">✅</div>
                    <div className="card-content">
                        <h3>Settled Groups</h3>
                        <p className="card-value">2</p>
                    </div>
                </div>
                <div className="summary-card card-4">
                    <div className="card-icon">⏳</div>
                    <div className="card-content">
                        <h3>Pending Groups</h3>
                        <p className="card-value">3</p>
                    </div>
                </div>
            </div>

            {/* Group Settlement Overview */}
            <div className="settlements-section">
                <h2 className="section-title">Group Balances</h2>
                <div className="groups-list">
                    <div className="group-card" style={{ borderLeftColor: '#FF5252' }}>
                        <div className="group-info">
                            <div className="group-icon">🚗</div>
                            <div className="group-details">
                                <h4 className="group-name">Taxi Group</h4>
                                <p className="group-description">Shared taxi rides</p>
                            </div>
                        </div>
                        <div className="balance-info">
                            <div className="balance-status" style={{ color: '#FF5252' }}>
                                You Owe
                            </div>
                            <div className="balance-amount" style={{ color: '#FF5252' }}>
                                ₹150.50
                            </div>
                        </div>
                        <div className="group-actions">
                            <button className="settle-btn">
                                Settle Up
                            </button>
                        </div>
                    </div>

                    <div className="group-card" style={{ borderLeftColor: '#00C853' }}>
                        <div className="group-info">
                            <div className="group-icon">🍕</div>
                            <div className="group-details">
                                <h4 className="group-name">Foodies</h4>
                                <p className="group-description">Dining out together</p>
                            </div>
                        </div>
                        <div className="balance-info">
                            <div className="balance-status" style={{ color: '#00C853' }}>
                                You're Owed
                            </div>
                            <div className="balance-amount" style={{ color: '#00C853' }}>
                                ₹75.25
                            </div>
                        </div>
                        <div className="group-actions">
                            <button className="settle-btn">
                                Settle Up
                            </button>
                        </div>
                    </div>

                    <div className="group-card" style={{ borderLeftColor: '#9E9E9E' }}>
                        <div className="group-info">
                            <div className="group-icon">🏋️</div>
                            <div className="group-details">
                                <h4 className="group-name">Sports Club</h4>
                                <p className="group-description">Gym and sports activities</p>
                            </div>
                        </div>
                        <div className="balance-info">
                            <div className="balance-status" style={{ color: '#9E9E9E' }}>
                                Settled
                            </div>
                            <div className="balance-amount" style={{ color: '#9E9E9E' }}>
                                ₹0.00
                            </div>
                        </div>
                        <div className="group-actions">
                            <button className="settle-btn">
                                Settle Up
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="footer-actions">
                <div className="action-buttons">
                    <button className="action-btn secondary" onClick={() => navigate('/dashboard')}>
                        📊 View Reports
                    </button>
                    <button className="action-btn secondary" onClick={() => window.print()}>
                        📄 Export Summary
                    </button>
                </div>
                <p className="data-note">Data updated on 27 Oct 2024</p>
            </div>
        </div>
    );
};

export default AllSettlements;