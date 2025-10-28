import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import logo from "../assets/logo.jpg";
import { API_BASE_URL } from "../config";
import UniversalSearch from "../components/UniversalSearch";
import { useToast } from "../components/ToastProvider";

export default function Dashboard() {
  const navigate = useNavigate();
  const { showError, showWarning, showInfo } = useToast();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const fetchUserGroups = useCallback(async () => {
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
  }, [navigate]);

  const fetchExpenses = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch expenses from all groups
      const allExpenses = [];
      for (const group of groups) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/groups/${group.id}/expenses`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (res.ok) {
            const data = await res.json();
            const groupExpenses = data.data?.expenses || [];
            // Add group info to each expense
            groupExpenses.forEach(expense => {
              expense.groupName = group.name;
              expense.groupId = group.id;
            });
            allExpenses.push(...groupExpenses);
          }
        } catch (err) {
          console.error(`Error fetching expenses for group ${group.id}:`, err);
        }
      }
      setExpenses(allExpenses);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  }, [groups]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setUserData(data.user);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  // useEffect hooks
  useEffect(() => {
    fetchUserGroups();
    fetchUserData();
    
    // Update date every minute
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, [fetchUserGroups]);

  // Refresh groups when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUserGroups();
        if (groups.length > 0) {
          fetchExpenses();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [groups, fetchUserGroups, fetchExpenses]);

  // Fetch expenses after groups are loaded
  useEffect(() => {
    if (groups.length > 0) {
      fetchExpenses();
    }
  }, [groups, fetchExpenses]);

  // Apply dark mode class
  /*useEffect(() => {
   if (darkMode) {
      document.body.classList.add('dark-mode');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [darkMode]);*/

  // Calculate summary data
  const totalBalance = groups.reduce((acc, g) => acc + g.balance, 0);
  const totalIncome = expenses
    .filter(e => e.type === 'income')
    .reduce((acc, e) => acc + parseFloat(e.amount), 0);
  const totalExpenses = expenses
    .filter(e => e.type === 'expense')
    .reduce((acc, e) => acc + parseFloat(e.amount), 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsGoal = 20000; // Placeholder
  const savingsProgress = Math.min(100, (totalBalance / savingsGoal) * 100);

  // Calculate expense breakdown by category
  const categoryBreakdown = expenses
    .filter(e => e.type === 'expense')
    .reduce((acc, e) => {
      const category = e.category || 'Others';
      acc[category] = (acc[category] || 0) + parseFloat(e.amount);
      return acc;
    }, {});

  const getTotalExpenseAmount = () => Object.values(categoryBreakdown).reduce((a, b) => a + b, 0);

  const formatDate = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const dayNum = date.getDate();
    const year = date.getFullYear();
    return `${day}, ${dayNum} ${month} ${year}`;
  };

  const getCurrentMonth = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[currentDate.getMonth()];
  };

  const handleNotifications = () => {
    navigate('/notifications');
  };

  const handleSettings = () => {
    navigate('/settings');
    setShowProfileDropdown(false);
  };

  const handleProfile = () => {
    navigate('/settings');
    setShowProfileDropdown(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleCreateGroup = () => {
    navigate('/create-group');
  };

  const handleViewGroupDetails = (groupId) => {
    navigate(`/group/${groupId}`);
  };

  const handleAddTransaction = () => {
    if (groups.length > 0) {
      navigate(`/group/${groups[0].id}/add-expense`);
    } else {
      showWarning('Create a group first to add transactions');
    }
  };

  const handleViewBalances = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('Please log in to view settlements');
        return;
      }

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
      showError(`Failed to fetch settlements: ${error.message}`);
    }
  };

  const handleViewReports = () => {
    showInfo('Reports feature coming soon!');
  };

  const handleAddGoal = () => {
    showInfo('Add Goal feature coming soon!');
  };

  const handleSearch = (searchResult) => {
    if (!searchResult) return;
    
    // Navigate based on search result type
    switch (searchResult.type) {
      case 'group':
        navigate(`/group/${searchResult.id}`);
        break;
      case 'user':
        // Could navigate to user profile or show user info
        console.log('User selected:', searchResult);
        break;
      case 'expense':
        // Navigate to the group containing the expense
        if (searchResult.metadata?.groupName) {
          const group = groups.find(g => g.name === searchResult.metadata.groupName);
          if (group) {
            navigate(`/group/${group.id}`);
          }
        }
        break;
      default:
        console.log('Unknown search result type:', searchResult);
    }
  };

  return (
    <div className="dashboard">
      {/* Enhanced Header */}
      <div className="navbar">
        <div className="navbar-left">
          <div className="logo-container">
            <img src={logo} alt="BudgetPal Logo" className="logo-image" />
            <h1 className="logo-text">BudgetPal</h1>
          </div>
        </div>
        
        <div className="navbar-center">
          <UniversalSearch
            onSearch={handleSearch}
            placeholder="Search groups, users, expenses..."
            searchTypes={['groups', 'users', 'expenses']}
            className="dashboard-search"
          />
        </div>
        
        <div className="navbar-right">
          <div className="navbar-actions">
            <span onClick={handleNotifications} title="Notifications" className="icon-btn">
              🔔
            </span>
            
           {/*<button onClick={toggleDarkMode} className="icon-btn dark-mode-toggle" title={darkMode ? 'Light Mode' : 'Dark Mode'}>
              {darkMode ? '☀️' : '🌙'}
            </button>*/}
            
            <div className="profile-container">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)} 
                className="profile-avatar"
                title="Profile"
              >
                {userData?.username?.[0]?.toUpperCase() || 'U'}
              </button>
              
              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="profile-name">{userData?.username || 'User'}</div>
                    <div className="profile-email">{userData?.email || ''}</div>
                  </div>
                  <div className="profile-dropdown-divider"></div>
                  <button onClick={handleProfile} className="dropdown-item">
                    👤 Profile
                  </button>
                  <button onClick={handleSettings} className="dropdown-item">
                    ⚙️ Settings
                  </button>
                  <div className="profile-dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="date-display-small">{formatDate(currentDate)}</div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="header-section">
        <div className="header-content">
          <div className="welcome-text">
            <h2>Welcome, {userData?.username || 'User'} 👋</h2>
            <p>Here's your {getCurrentMonth()} overview.</p>
          </div>
        </div>
      </div>

      {/* Summary Cards (5 cards) */}
      <div className="summary-cards">
        <div className="summary-card card-1">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <p className="card-label">Total Balance</p>
            <h3 className="card-value">₹{totalBalance.toFixed(2)}</h3>
          </div>
        </div>

        <div className="summary-card card-2">
          <div className="card-icon">💸</div>
          <div className="card-content">
            <p className="card-label">Total Income</p>
            <h3 className="card-value">₹{totalIncome.toFixed(2)}</h3>
          </div>
        </div>

        {/*<div className="summary-card card-3">
          <div className="card-icon">💳</div>
          <div className="card-content">
            <p className="card-label">Total Expenses</p>
            <h3 className="card-value">₹{totalExpenses.toFixed(2)}</h3>
          </div>
        </div>

        <div className="summary-card card-4">
          <div className="card-icon">🎯</div>
          <div className="card-content">
            <p className="card-label">Savings Goal</p>
            <h3 className="card-value">{savingsProgress.toFixed(0)}%</h3>
          </div>
        </div>

        <div className="summary-card card-5">
          <div className="card-icon">🏦</div>
          <div className="card-content">
            <p className="card-label">Net Savings</p>
            <h3 className="card-value">₹{netSavings.toFixed(2)}</h3>
          </div>
        </div>*/}
      </div>

      {/* Analytics Section */}
      <div className="analytics-section">
        <h3 className="section-title">Expense Breakdown by Category</h3>
        
        {Object.keys(categoryBreakdown).length > 0 ? (
          <>
            <div className="chart-container">
              <div className="chart-wrapper">
                <div className="pie-chart">
                  {Object.entries(categoryBreakdown).map(([category, amount], index) => {
                    const percentage = (amount / getTotalExpenseAmount()) * 100;
                    const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#06b6d4'];
                    return (
                      <div
                        key={category}
                        className="pie-segment"
                        style={{
                          '--percentage': percentage,
                          '--color': colors[index % colors.length],
                          '--start': Object.values(categoryBreakdown).slice(0, index).reduce((a, b) => a + (b / getTotalExpenseAmount()) * 100, 0)
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              
              <div className="chart-legend">
                {Object.entries(categoryBreakdown).map(([category, amount], index) => {
                  const percentage = (amount / getTotalExpenseAmount()) * 100;
                  const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#06b6d4'];
                  return (
                    <div key={category} className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: colors[index % colors.length] }}></div>
                      <div className="legend-info">
                        <span className="legend-label">{category}</span>
                        <span className="legend-amount">₹{amount.toFixed(2)} ({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="no-data-message">
            <p>No expense data available yet. Add some expenses to see your breakdown!</p>
          </div>
        )}
      </div>

      {/* Quick Actions Section */}
      <div className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          <button className="action-btn" onClick={handleAddTransaction}>
            <div className="action-icon">➕</div>
            <div className="action-label">Add Transaction</div>
          </button>

          <button className="action-btn" onClick={handleCreateGroup}>
            <div className="action-icon">👥</div>
            <div className="action-label">Create Group</div>
          </button>

          <button className="action-btn" onClick={handleViewBalances}>
            <div className="action-icon">💵</div>
            <div className="action-label">View Balances</div>
          </button>

          <button className="action-btn" onClick={handleViewReports}>
            <div className="action-icon">📜</div>
            <div className="action-label">Reports</div>
          </button>

          {/*<button className="action-btn" onClick={handleAddGoal}>
            <div className="action-icon">🎯</div>
            <div className="action-label">Add Goal</div>
          </button>*/}
        </div>
      </div>

      {/* Groups Section */}
      <div className="groups-section">
        <div className="groups-header">
          <h3 className="section-title">Your Groups</h3>
          <button className="create-group-fab" onClick={handleCreateGroup} title="Create New Group">
            <span>+</span>
          </button>
        </div>
        <div className="group-list">
          {loading ? (
            <div className="loading-message">Loading your groups...</div>
          ) : groups.length === 0 ? (
            <div className="no-groups-message">
              <p>You haven't created any groups yet.</p>
              <p>Click the + button to get started!</p>
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
    </div>
  );
}