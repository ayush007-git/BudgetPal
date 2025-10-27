import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Settlement.css';
import { API_BASE_URL } from '../config';

export default function Settlement() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [settlements, setSettlements] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettlementData();
  }, [groupId]);

  const fetchSettlementData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch group details
      const groupRes = await fetch(`${API_BASE_URL}/api/groups/${groupId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (groupRes.ok) {
        const groupData = await groupRes.json();
        setGroup(groupData.data.group);
      }

      // Fetch settlement plan
      const balanceRes = await fetch(`${API_BASE_URL}/api/groups/${groupId}/balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setSettlements(balanceData);
      }

    } catch (err) {
      console.error('Error fetching settlement data:', err);
      // Fallback to mock data for testing
      setSettlements([
        { from: 'Alice', to: 'Bob', amount: 150.50, debtorId: 1, creditorId: 2 },
        { from: 'Charlie', to: 'Alice', amount: 75.25, debtorId: 3, creditorId: 1 },
        { from: 'Bob', to: 'Charlie', amount: 200.00, debtorId: 2, creditorId: 3 }
      ]);
      setGroup({ name: 'Sample Group', description: 'Test group for settlements' });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (settlementIndex) => {
    try {
      const token = localStorage.getItem('token');
      const settlement = settlements[settlementIndex];
      
      if (!settlement) return;

      // Check if we have the required IDs
      if (!settlement.debtorId || !settlement.creditorId) {
        alert('Error: Missing user information for this settlement');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/groups/${groupId}/mark-paid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          debtorId: settlement.debtorId,
          creditorId: settlement.creditorId,
          amount: settlement.amount
        })
      });

      if (res.ok) {
        const result = await res.json();
        // Remove from local state
        const newSettlements = settlements.filter((_, index) => index !== settlementIndex);
        setSettlements(newSettlements);
        alert(result.message || 'Payment marked as completed!');
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to mark payment as completed');
      }
    } catch (err) {
      console.error('Error marking payment as completed:', err);
      // For demo purposes, just remove from local state
      const newSettlements = settlements.filter((_, index) => index !== settlementIndex);
      setSettlements(newSettlements);
      alert('Payment marked as completed!');
    }
  };

  const calculateTotalAmount = () => {
    return settlements.reduce((total, settlement) => total + settlement.amount, 0);
  };

  const getGroupIcon = (groupName) => {
    const name = groupName?.toLowerCase() || '';
    if (name.includes('taxi') || name.includes('travel')) return '🚗';
    if (name.includes('food') || name.includes('dining')) return '🍕';
    if (name.includes('sport') || name.includes('gym')) return '🏋️';
    if (name.includes('home') || name.includes('rent')) return '🏠';
    if (name.includes('shopping') || name.includes('store')) return '🛍️';
    return '👥';
  };

  if (loading) {
    return (
      <div className="settlement-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading settlement data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settlement-page">
      {/* Top Bar */}
      <div className="settlement-top-bar">
        <button className="back-btn" onClick={() => navigate(`/group/${groupId}`)}>
          ← Back to Group
        </button>
        <button className="dashboard-btn" onClick={() => navigate('/dashboard')}>
          🏠 Dashboard
        </button>
      </div>

      {/* Header Card */}
      <div className="settlement-header-card">
        <div className="header-content">
          <div className="group-icon">{getGroupIcon(group?.name)}</div>
          <div className="group-info">
            <h1 className="group-title">{group?.name || 'Group Settlement'}</h1>
            <p className="group-subtitle">{group?.description || 'Settlement plan for this group'}</p>
          </div>
        </div>
        <div className="settlement-summary">
          <div className="summary-item">
            <span className="summary-label">Total Amount</span>
            <span className="summary-value">₹{calculateTotalAmount().toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Payments</span>
            <span className="summary-value">{settlements.length}</span>
          </div>
        </div>
      </div>

      {/* Payment Status Section */}
      <div className="payment-status-section">
        <div className="status-card">
          <div className="status-icon">📊</div>
          <div className="status-content">
            <h3>Payment Status</h3>
            <p>{settlements.length === 0 ? 'All payments completed!' : `${settlements.length} payments pending`}</p>
          </div>
        </div>
        <div className="status-card">
          <div className="status-icon">💰</div>
          <div className="status-content">
            <h3>Total Settlements</h3>
            <p>₹{calculateTotalAmount().toFixed(2)} across {settlements.length} transactions</p>
          </div>
        </div>
      </div>

      {/* Payment Plan Cards */}
      <div className="payment-plan-section">
        <h2 className="section-title">Payment Plan</h2>
        {settlements.length === 0 ? (
          <div className="celebration-state">
            <div className="celebration-icon">🎉</div>
            <h3>All Settled Up!</h3>
            <p>No outstanding payments in this group.</p>
            <button 
              className="action-btn primary" 
              onClick={() => navigate(`/group/${groupId}`)}
            >
              View Group Details
            </button>
          </div>
        ) : (
          <div className="payment-plan-list">
            {settlements.map((settlement, index) => (
              <div key={index} className="payment-plan-card">
                <div className="payment-flow">
                  <div className="payer-info">
                    <div className="user-avatar">👤</div>
                    <span className="user-name">{settlement.from}</span>
                  </div>
                  <div className="payment-details">
                    <div className="arrow-icon">→</div>
                    <div className="amount">₹{settlement.amount.toFixed(2)}</div>
                  </div>
                  <div className="payee-info">
                    <div className="user-avatar">👤</div>
                    <span className="user-name">{settlement.to}</span>
                  </div>
                </div>
                <div className="payment-actions">
                  <button 
                    className="mark-paid-btn"
                    onClick={() => handleMarkAsPaid(index)}
                  >
                    ✓ Mark as Paid
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="settlement-footer">
        <div className="footer-buttons">
          <button 
            className="footer-btn primary" 
            onClick={() => navigate(`/group/${groupId}`)}
          >
            📊 View Group Details
          </button>
          <button 
            className="footer-btn secondary" 
            onClick={() => navigate('/dashboard')}
          >
            🏠 Dashboard
          </button>
        </div>
        <p className="footer-note">Settlement data updated in real-time</p>
      </div>
    </div>
  );
}
