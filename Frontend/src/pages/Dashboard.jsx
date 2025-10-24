import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import logo from "../assets/logo.jpg";
import { API_BASE_URL } from "../config";

export default function Dashboard() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserGroups();
  }, []);

  // Refresh groups when component becomes visible (e.g., returning from create group)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUserGroups();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchUserGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/groups/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setGroups(data.data.groups);
      } else {
        console.error('Failed to fetch groups:', data.message);
        setGroups([]);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = groups.reduce((acc, g) => acc + g.balance, 0);

  const handleNotifications = () => {
    navigate('/notifications');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleProfile = () => {
    navigate('/settings');
  };

  const handleSettleUp = () => {
    // For now, show the first group's settlement
    if (groups.length > 0) {
      navigate(`/settlement/${groups[0].id}`);
    } else {
      alert('No groups available for settlement');
    }
  };

  const handleViewGroupDetails = (groupId) => {
    navigate(`/group/${groupId}`);
  };

  const handleAddExpenses = () => {
    if (groups.length > 0) {
      navigate(`/group/${groups[0].id}/add-expense`);
    } else {
      alert('Create a group first to add expenses');
    }
  };

  const handleInviteFriends = () => {
    if (groups.length > 0) {
      navigate(`/group/${groups[0].id}`);
    } else {
      alert('Create a group first to invite friends');
    }
  };

  const handleViewAllBalances = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to view settlements');
        return;
      }

      // Get all user's groups first
      const groupsResponse = await fetch(`${API_BASE_URL}/api/groups`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!groupsResponse.ok) {
        throw new Error('Failed to fetch groups');
      }

      const groupsData = await groupsResponse.json();
      const userGroups = groupsData.data?.groups || [];

      if (userGroups.length === 0) {
        navigate('/all-settlements', { state: { settlements: [] } });
        return;
      }

      // Get settlements for each group
      const allSettlements = [];
      
      for (const group of userGroups) {
        try {
          const balanceResponse = await fetch(`${API_BASE_URL}/api/groups/${group.id}/balance`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (balanceResponse.ok) {
            const balanceData = await balanceResponse.json();
            const groupSettlements = balanceData.map(settlement => ({
              ...settlement,
              groupName: group.name,
              groupId: group.id
            }));
            allSettlements.push(...groupSettlements);
          }
        } catch (groupError) {
          console.error(`Error fetching balance for group ${group.id}:`, groupError);
        }
      }

      navigate('/all-settlements', { state: { settlements: allSettlements } });

    } catch (error) {
      console.error('Error fetching settlements:', error);
      alert(`Failed to fetch settlements: ${error.message}`);
    }
  };

  const handleRecentActivity = () => {
    navigate('/notifications');
  };

  const handleCreateGroup = () => {
    navigate('/create-group');
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
          <span onClick={handleNotifications} title="Notifications">🔔</span>
          <span onClick={handleProfile} title="Profile">👤</span>
        </div>
      </div>

      {/* Welcome */}
      <div className="welcome">
        <h2>Welcome back,</h2>
        <p>Here's your financial overview and recent group activity.</p>
      </div>

      {/* Financial Summary */}
      

      {/* Groups */}
      <div className="groups">
        <div className="groups-header">
          <h3>Your Groups</h3>
          <button className="create-btn" onClick={handleCreateGroup}>+ Create group</button>
        </div>
        <div className="group-list">
          {loading ? (
            <div className="loading-message">Loading your groups...</div>
          ) : groups.length === 0 ? (
            <div className="no-groups-message">
              <p>You haven't created any groups yet.</p>
              <p>Click "Create group" to get started!</p>
            </div>
          ) : (
            groups.map((g, i) => (
              <div className="group-card" key={g.id || i}>
                <h4>{g.icon} {g.name}</h4>
                <p className="members">{g.members} Members</p>
                <p className={g.balance >= 0 ? "positive" : "negative"}>
                  {g.balance >= 0
                    ? `You are owed ₹${g.balance.toFixed(2)}`
                    : `You owe ₹${Math.abs(g.balance).toFixed(2)}`}
                </p>
                <button onClick={() => handleViewGroupDetails(g.id)}>View Details</button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="actions">
        <h3>Quick Actions</h3>
        <div className="action-list">
          <button onClick={handleViewAllBalances}>💲 View all balances</button>
          <button onClick={handleRecentActivity}>📅 Recent activity</button>
        </div>
      </div>
    </div>
  );
}