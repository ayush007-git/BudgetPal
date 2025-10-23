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
      alert('Error marking payment as completed');
    }
  };

  if (loading) {
    return <div className="loading">Loading settlement data...</div>;
  }

  return (
    <div className="settlement-page">
      {/* Header */}
      <div className="settlement-header">
        <button className="back-btn" onClick={() => navigate(`/group/${groupId}`)}>
          ← Back to Group
        </button>
        <h1>Settlement Plan</h1>
        {group && <p>for {group.name}</p>}
      </div>

      {/* Settlement Summary */}
      <div className="settlement-summary">
        <div className="summary-card">
          <h3>💰 Total Settlements</h3>
          <p className="settlement-count">{settlements.length} payments needed</p>
        </div>
        <div className="summary-card">
          <h3>📊 Status</h3>
          <p className="settlement-status">
            {settlements.length === 0 ? 'All settled!' : 'Pending payments'}
          </p>
        </div>
      </div>

      {/* Settlements List */}
      <div className="settlements-section">
        <h2>Payment Plan</h2>
        {settlements.length === 0 ? (
          <div className="no-settlements">
            <div className="success-icon">✅</div>
            <h3>All settled up!</h3>
            <p>No outstanding payments in this group.</p>
            <button 
              className="action-btn" 
              onClick={() => navigate(`/group/${groupId}`)}
            >
              Back to Group
            </button>
          </div>
        ) : (
          <div className="settlements-list">
            {settlements.map((settlement, index) => (
              <div key={index} className="settlement-item">
                <div className="settlement-info">
                  <div className="payment-flow">
                    <span className="payer">{settlement.from}</span>
                    <div className="arrow-container">
                      <div className="arrow">→</div>
                      <div className="amount">₹{settlement.amount.toFixed(2)}</div>
                    </div>
                    <span className="payee">{settlement.to}</span>
                  </div>
                </div>
                <div className="settlement-actions">
                  <button 
                    className="mark-paid-btn"
                    onClick={() => handleMarkAsPaid(index)}
                  >
                    Mark as Paid
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          className="action-btn primary" 
          onClick={() => navigate(`/group/${groupId}`)}
        >
          📊 View Group Details
        </button>
        <button 
          className="action-btn secondary" 
          onClick={() => navigate('/dashboard')}
        >
          🏠 Dashboard
        </button>
      </div>
    </div>
  );
}
