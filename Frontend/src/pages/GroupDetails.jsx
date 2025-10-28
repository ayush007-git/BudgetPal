import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/GroupDetails.css';
import { API_BASE_URL } from '../config';
import UserDropdown from '../components/UserDropdown';
import SimpleAddMemberModal from '../components/SimpleAddMemberModal';
import { useToast } from '../components/ToastProvider';

export default function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [_balance, setBalance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);

  const fetchGroupDetails = useCallback(async () => {
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
  }, [groupId, navigate]);

  useEffect(() => {
    fetchGroupDetails();
  }, [fetchGroupDetails]);

  const handleMemberAdded = () => {
    fetchGroupDetails();
    showSuccess('Member added successfully!');
  };

  // Helper function to fetch user by ID
  const fetchUserById = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data.users.find(user => user.id === parseInt(userId));
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
    return null;
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${API_BASE_URL}/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        showSuccess('Group deleted successfully!');
        navigate('/dashboard');
      } else {
        const error = await res.json();
        showError(error.message || 'Failed to delete group');
      }
    } catch {
      showError('Error deleting group');
    }
  };

  // Calculate summary stats
  const calculateStats = () => {
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const userBalance = members.find(m => m.username === currentUser?.username)?.balance || 0;
    
    return {
      totalExpenses,
      membersCount: members.length,
      userBalance,
      totalBalance: members.reduce((sum, m) => sum + Math.abs(m.balance || 0), 0)
    };
  };

  const stats = calculateStats();

  if (loading) {
    return <div className="loading">Loading group details...</div>;
  }

  if (!group) {
    return <div className="error">Group not found</div>;
  }

  return (
    <div className="group-details-page">
      {/* Header Section */}
      <div className="group-header-section">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Dashboard
        </button>
        <div className="header-content">
          <h1 className="group-title">{group.name}</h1>
          <p className="group-subtitle">{group.description || 'Group shared expenses'}</p>
        </div>
        <div className="header-actions">
          <button 
            className="header-action-btn primary" 
            onClick={() => navigate(`/group/${groupId}/add-expense`)}
          >
            ➕ Add Expense
          </button>
          <button 
            className="header-action-btn secondary" 
            onClick={() => setShowAddMember(true)}
          >
            👥 Add Member
          </button>
          <button 
            className="header-action-btn tertiary" 
            onClick={() => navigate(`/settlement/${groupId}`)}
          >
            ⚖️ Settlement
          </button>
          <button 
            className="header-action-btn chat" 
            onClick={() => navigate(`/chat/${groupId}`)}
          >
            💬 Chat
          </button>
          <button 
            className="header-action-btn delete" 
            onClick={handleDeleteGroup}
          >
            🗑️ Delete Group
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card card-1">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total Balance</h3>
            <p className="card-value">₹{stats.totalBalance.toFixed(2)}</p>
          </div>
        </div>
        <div className="summary-card card-2">
          <div className="card-icon">👥</div>
          <div className="card-content">
            <h3>Members</h3>
            <p className="card-value">{stats.membersCount} Members</p>
          </div>
        </div>
        <div className="summary-card card-3">
          <div className="card-icon">📉</div>
          <div className="card-content">
            <h3>Total Expenses</h3>
            <p className="card-value">₹{stats.totalExpenses.toFixed(2)}</p>
          </div>
        </div>
        <div className="summary-card card-4">
          <div className="card-icon">💸</div>
          <div className="card-content">
            <h3>Your Balance</h3>
            <p className={`card-value ${stats.userBalance >= 0 ? 'positive' : 'negative'}`}>
              {stats.userBalance >= 0 ? '+' : ''}₹{Math.abs(stats.userBalance).toFixed(2)}
            </p>
            <p className="card-label">{stats.userBalance >= 0 ? 'You are owed' : 'You owe'}</p>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="members-section">
        <div className="section-header">
          <h2>👥 Group Members</h2>
        </div>
        <div className="members-grid">
          {members.map((member, index) => {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const isCurrentUser = member.username === currentUser?.username;
            return (
              <div key={index} className={`member-card ${isCurrentUser ? 'current-user' : ''}`}>
                <div className="member-avatar">
                  {member.username.charAt(0).toUpperCase()}
                </div>
                <div className="member-info">
                  <h4>{member.username} {isCurrentUser && <span className="you-badge">You</span>}</h4>
                  <p className={`member-balance ${member.balance >= 0 ? 'positive' : 'negative'}`}>
                    {member.balance >= 0 ? 'Owed' : 'Owes'} ₹{Math.abs(member.balance || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Expenses Section */}
      <div className="expenses-section">
        <div className="section-header">
          <h2>💸 Recent Expenses</h2>
        </div>
        <div className="expenses-list">
          {expenses.length === 0 ? (
            <div className="empty-state">
              <p>📭 No expenses yet. Add one to get started!</p>
            </div>
          ) : (
            expenses.slice(0, 10).map((expense, index) => (
              <div key={index} className="expense-card">
                <div className="expense-color-strip"></div>
                <div className="expense-content">
                  <h4>{expense.description}</h4>
                  <p className="expense-meta">
                    Paid by <strong>{expense.paidBy?.username || 'Unknown'}</strong> • {new Date(expense.date).toLocaleDateString()}
                  </p>
                  <div className="expense-members">
                    {expense.splits && expense.splits.length > 0 ? (
                      <span>{expense.splits.length} {expense.splits.length === 1 ? 'member' : 'members'} involved</span>
                    ) : (
                      <span>Equal split among all members</span>
                    )}
                  </div>
                </div>
                <div className="expense-amount">₹{expense.totalAmount.toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Member Modal - simplified by username */}
      <SimpleAddMemberModal
        groupId={groupId}
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onAdded={handleMemberAdded}
        showError={showError}
        showSuccess={showSuccess}
      />
    </div>
  );
}
