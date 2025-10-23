import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/GroupDetails.css';
import { API_BASE_URL } from '../config';

export default function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [balance, setBalance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    totalAmount: '',
    screenshotUrl: ''
  });
  const [newMember, setNewMember] = useState({
    username: ''
  });

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
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
        setExpenses(groupData.data.group.expenses || []);
      }

      // Fetch balance/settlement plan
      const balanceRes = await fetch(`${API_BASE_URL}/api/groups/${groupId}/balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBalance(balanceData);
      }

    } catch (err) {
      console.error('Error fetching group details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      const res = await fetch(`${API_BASE_URL}/api/groups/${groupId}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newExpense,
          totalAmount: parseFloat(newExpense.totalAmount),
          paidById: user.id
        })
      });

      if (res.ok) {
        setNewExpense({ description: '', totalAmount: '', screenshotUrl: '' });
        setShowAddExpense(false);
        fetchGroupDetails(); // Refresh data
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to add expense');
      }
    } catch (err) {
      alert('Error adding expense');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${API_BASE_URL}/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: newMember.username
        })
      });

      if (res.ok) {
        setNewMember({ username: '' });
        setShowAddMember(false);
        fetchGroupDetails(); // Refresh data
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to add member');
      }
    } catch (err) {
      alert('Error adding member');
    }
  };

  if (loading) {
    return <div className="loading">Loading group details...</div>;
  }

  if (!group) {
    return <div className="error">Group not found</div>;
  }

  return (
    <div className="group-details">
      {/* Header */}
      <div className="group-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>{group.name}</h1>
        <p>{group.description}</p>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          className="action-btn primary" 
          onClick={() => navigate(`/group/${groupId}/add-expense`)}
        >
          ➕ Add Expense
        </button>
        <button 
          className="action-btn secondary" 
          onClick={() => setShowAddMember(true)}
        >
          👥 Add Member
        </button>
        <button 
          className="action-btn tertiary" 
          onClick={() => navigate(`/settlement/${groupId}`)}
        >
          💲 View Settlement
        </button>
      </div>

      {/* Balance Summary */}
      {balance.length > 0 && (
        <div className="balance-summary">
          <h3>💰 Settlement Plan</h3>
          <div className="settlements">
            {balance.map((settlement, index) => (
              <div key={index} className="settlement-item">
                <span className="from">{settlement.from}</span>
                <span className="arrow">→</span>
                <span className="to">{settlement.to}</span>
                <span className="amount">₹{settlement.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      <div className="members-section">
        <h3>👥 Members</h3>
        <div className="members-list">
          {members.map((member, index) => (
            <div key={index} className="member-item">
              <span className="member-name">{member.username}</span>
              <span className="member-balance">
                {member.balance >= 0 ? `+₹${member.balance.toFixed(2)}` : `-₹${Math.abs(member.balance).toFixed(2)}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Expenses */}
      <div className="expenses-section">
        <h3>📊 Recent Expenses</h3>
        <div className="expenses-list">
          {expenses.length === 0 ? (
            <p className="no-expenses">No expenses yet. Add one to get started!</p>
          ) : (
            expenses.map((expense, index) => (
              <div key={index} className="expense-item">
                <div className="expense-info">
                  <h4>{expense.description}</h4>
                  <p>Paid by {expense.paidBy?.username}</p>
                  <p className="expense-date">{new Date(expense.date).toLocaleDateString()}</p>
                </div>
                <div className="expense-amount">
                  ₹{expense.totalAmount.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Expense</h3>
            <form onSubmit={handleAddExpense}>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={newExpense.totalAmount}
                  onChange={(e) => setNewExpense({...newExpense, totalAmount: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Receipt URL (optional)</label>
                <input
                  type="url"
                  value={newExpense.screenshotUrl}
                  onChange={(e) => setNewExpense({...newExpense, screenshotUrl: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddExpense(false)}>Cancel</button>
                <button type="submit">Add Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Member to Group</h3>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={newMember.username}
                  onChange={(e) => setNewMember({...newMember, username: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddMember(false)}>Cancel</button>
                <button type="submit">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
