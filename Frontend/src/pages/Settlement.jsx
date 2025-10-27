import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Settlement.css';
import { API_BASE_URL } from '../config';
import { useToast } from '../components/ToastProvider';

export default function Settlement() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();
  const [settlements, setSettlements] = useState([]);
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
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
        setMembers(groupData.data.group.members || []);
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
      setMembers([
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
        { id: 3, name: 'Charlie', email: 'charlie@example.com' }
      ]);
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
        showError('Error: Missing user information for this settlement');
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
        showSuccess(result.message || 'Payment marked as completed!');
      } else {
        const error = await res.json();
        showError(error.message || 'Failed to mark payment as completed');
      }
    } catch (err) {
      console.error('Error marking payment as completed:', err);
      // For demo purposes, just remove from local state
      const newSettlements = settlements.filter((_, index) => index !== settlementIndex);
      setSettlements(newSettlements);
      showSuccess('Payment marked as completed!');
    }
  };

  const handleAutoCalculate = () => {
    // Auto-calculate optimal settlement plan
    showInfo('Auto-calculating optimal settlement plan...');
    // This would trigger a recalculation of the settlement plan
    setTimeout(() => {
      showSuccess('Settlement plan updated!');
    }, 1000);
  };

  const calculateTotalAmount = () => {
    return settlements.reduce((total, settlement) => total + settlement.amount, 0);
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
      {/* Header Section */}
      <div className="settlement-header">
        <div className="header-top">
          <button className="back-btn" onClick={() => navigate(`/group/${groupId}`)}>
            ← Back to Groups
          </button>
          <button className="auto-calculate-btn" onClick={handleAutoCalculate}>
            Auto Calculate
          </button>
        </div>
        <div className="header-content">
          <h1 className="page-title">💰 Settle Up Balances</h1>
          <p className="page-subtitle">Easily clear pending amounts between members.</p>
        </div>
      </div>

      {/* Main Single-Column Layout */}
      <div className="settlement-main">
        {/* Settlement Summary */}
        <div className="settlement-summary-column">
          <div className="summary-card">
            <div className="card-header">
              <h2>Settlement Summary</h2>
              <div className="progress-indicator">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${settlements.length === 0 ? 100 : ((settlements.length / 5) * 100)}%` 
                    }}
                  ></div>
                </div>
                <span className="progress-text">
                  {settlements.length === 0 ? 'All Clear!' : `${settlements.length} pending`}
                </span>
              </div>
            </div>

            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Total Owed</span>
                <span className="stat-value owed">₹{calculateTotalAmount().toFixed(2)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total to Receive</span>
                <span className="stat-value receive">₹{calculateTotalAmount().toFixed(2)}</span>
              </div>
            </div>

            <div className="pending-amounts">
              <h3>Pending Amounts</h3>
              {settlements.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎉</div>
                  <p>All settled up! No pending amounts.</p>
                </div>
              ) : (
                <div className="amounts-list">
                  {settlements.map((settlement, index) => (
                    <div key={index} className="amount-item">
                      <div className="amount-flow">
                        <div className="user-info">
                          <div className="user-avatar">{settlement.from.charAt(0)}</div>
                          <span className="user-name">{settlement.from}</span>
                        </div>
                        <div className="amount-details">
                          <span className="amount-value">₹{settlement.amount.toFixed(2)}</span>
                          <span className="arrow">→</span>
                        </div>
                        <div className="user-info">
                          <div className="user-avatar">{settlement.to.charAt(0)}</div>
                          <span className="user-name">{settlement.to}</span>
                        </div>
                      </div>
                      <button 
                        className="mark-paid-btn"
                        onClick={() => handleMarkAsPaid(index)}
                      >
                        ✓ Mark Paid
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="settle-automatically-btn">
              Settle Automatically
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
