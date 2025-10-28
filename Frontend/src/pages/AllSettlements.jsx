import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Settlement.css';
import UniversalSearch from '../components/UniversalSearch';

const AllSettlements = () => {
    const navigate = useNavigate();
    const [settlements, setSettlements] = useState({
        totalOwed: 0,
        totalToReceive: 0,
        settledGroups: 0,
        pendingGroups: 0,
        groups: []
    });

    useEffect(() => {
        fetchSettlements();
    }, []);

    const fetchSettlements = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/settlements', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setSettlements(data);
            } else {
                console.error('Failed to fetch settlements:', data.message);
            }
        } catch (error) {
            console.error('Error fetching settlements:', error);
        }
    };

    const handleSettleUp = async (groupId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/settlements/${groupId}/settle`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                // Refresh settlements data
                fetchSettlements();
            }
        } catch (error) {
            console.error('Error settling up:', error);
        }
    };

    // ... existing handleSearch function ...

    return (
        <div className="all-settlements-page">
            {/* ... existing header and search sections ... */}

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card card-1">
                    <div className="card-icon">💸</div>
                    <div className="card-content">
                        <h3>Total Owed</h3>
                        <p className="card-value">₹{settlements.totalOwed.toFixed(2)}</p>
                    </div>
                </div>
                <div className="summary-card card-2">
                    <div className="card-icon">💰</div>
                    <div className="card-content">
                        <h3>Total To Receive</h3>
                        <p className="card-value">₹{settlements.totalToReceive.toFixed(2)}</p>
                    </div>
                </div>
                <div className="summary-card card-3">
                    <div className="card-icon">✅</div>
                    <div className="card-content">
                        <h3>Settled Groups</h3>
                        <p className="card-value">{settlements.settledGroups}</p>
                    </div>
                </div>
                <div className="summary-card card-4">
                    <div className="card-icon">⏳</div>
                    <div className="card-content">
                        <h3>Pending Groups</h3>
                        <p className="card-value">{settlements.pendingGroups}</p>
                    </div>
                </div>
            </div>

            {/* Group Settlement Overview */}
            <div className="settlements-section">
                <h2 className="section-title">Group Balances</h2>
                <div className="groups-list">
                    {settlements.groups.map(group => (
                        <div key={group.id} className="group-card" 
                             style={{ borderLeftColor: group.balance > 0 ? '#00C853' : 
                                                     group.balance < 0 ? '#FF5252' : '#9E9E9E' }}>
                            <div className="group-info">
                                <div className="group-icon">{group.icon}</div>
                                <div className="group-details">
                                    <h4 className="group-name">{group.name}</h4>
                                    <p className="group-description">{group.description}</p>
                                </div>
                            </div>
                            <div className="balance-info">
                                <div className="balance-status" 
                                     style={{ color: group.balance > 0 ? '#00C853' : 
                                                    group.balance < 0 ? '#FF5252' : '#9E9E9E' }}>
                                    {group.balance > 0 ? "You're Owed" : 
                                     group.balance < 0 ? "You Owe" : "Settled"}
                                </div>
                                <div className="balance-amount" 
                                     style={{ color: group.balance > 0 ? '#00C853' : 
                                                    group.balance < 0 ? '#FF5252' : '#9E9E9E' }}>
                                    ₹{Math.abs(group.balance).toFixed(2)}
                                </div>
                            </div>
                            <div className="group-actions">
                                <button 
                                    className="settle-btn"
                                    onClick={() => handleSettleUp(group.id)}
                                    disabled={group.balance === 0}>
                                    Settle Up
                                </button>
                            </div>
                        </div>
                    ))}
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
                <p className="data-note">Data updated on {new Date().toLocaleDateString()}</p>
            </div>
        </div>
    );
};

export default AllSettlements;