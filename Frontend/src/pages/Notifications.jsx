import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Notifications.css';
import { API_BASE_URL } from '../config';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/notifications/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data.notifications || []);
      } else {
        console.error('Failed to fetch notifications');
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setNotifications(prev => 
          prev.filter(notif => notif.id !== notificationId)
        );
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const clearAllNotifications = async () => {
    const confirmClear = window.confirm('Are you sure you want to delete all notifications?');
    if (confirmClear) {
      setNotifications([]);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'expense': return '💰';
      case 'settlement': return '✅';
      case 'member': return '👥';
      case 'payment': return '💸';
      case 'reminder': return '⏳';
      case 'goal': return '🎯';
      default: return '🔔';
    }
  };

  const getStatusDot = (notification) => {
    if (notification.read) return '⚪';
    if (notification.type === 'payment' || notification.type === 'settlement') return '🟢';
    if (notification.type === 'reminder') return '🟡';
    return '🔴';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Filter and sort notifications
  const filteredNotifications = notifications
    .filter(notif => {
      // Search filter
      if (searchQuery && !notif.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !notif.message.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filter === 'unread') return !notif.read;
      if (filter === 'read') return notif.read;
      if (filter === 'payment') return notif.type === 'payment' || notif.type === 'settlement';
      if (filter === 'reminder') return notif.type === 'reminder';
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.timestamp) - new Date(a.timestamp);
      } else {
        return new Date(a.timestamp) - new Date(b.timestamp);
      }
    });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      {/* Enhanced Header */}
      <div className="notifications-header-section">
        <div className="header-top">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            ⬅️ Back to Dashboard
          </button>
          <div className="header-center">
            <h1>🔔 Notifications</h1>
            {unreadCount > 0 && (
              <div className="unread-badge">{unreadCount} Unread</div>
            )}
          </div>
          <button 
            className="mark-all-btn" 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All as Read
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="filter-section">
          <div className="search-bar-container">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <div className="filter-buttons">
              {['all', 'unread', 'read', 'payment', 'reminder'].map((filterOption) => (
                <button
                  key={filterOption}
                  className={`filter-btn ${filter === filterOption ? 'active' : ''}`}
                  onClick={() => setFilter(filterOption)}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </button>
              ))}
            </div>

            <div className="sort-toggle">
              <button
                className="sort-btn"
                onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              >
                {sortOrder === 'newest' ? 'Newest ↕️' : 'Oldest ↕️'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <h3>You're all caught up!</h3>
            <p>No new notifications.</p>
          </div>
        ) : (
          filteredNotifications.map((notification, index) => (
            <div 
              key={notification.id} 
              className={`notification-card ${notification.read ? 'read' : 'unread'}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="notification-left">
                <div className="notification-icon-wrapper">
                  <span className="status-dot">{getStatusDot(notification)}</span>
                </div>
              </div>

              <div className="notification-main">
                <div className="notification-title-row">
                  <h4>{notification.title}</h4>
                  <span className="time-ago">{formatTimeAgo(notification.timestamp)}</span>
                </div>
                <p className="notification-description">{notification.message}</p>
                <div className="notification-footer">
                  {notification.groupName && (
                    <span className="group-tag">{notification.groupName}</span>
                  )}
                  <div className="notification-status">
                    <span className="status-label">
                      {notification.read ? 'Read' : 'Unread'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="notification-right">
                <div className="notification-actions">
                  {!notification.read && (
                    <button
                      className="action-icon-btn mark-read-btn"
                      onClick={() => markAsRead(notification.id)}
                      title="Mark as read"
                    >
                      ☑️
                    </button>
                  )}
                  <button
                    className="action-icon-btn delete-btn"
                    onClick={() => deleteNotification(notification.id)}
                    title="Delete"
                  >
                    ❌
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions Panel */}
      {notifications.length > 0 && (
        <div className="quick-actions-panel">
          <button className="quick-action-btn" onClick={clearAllNotifications}>
            🧹 Clear All Notifications
          </button>
          <button className="quick-action-btn" onClick={() => setFilter('read')}>
            🕓 View Notification History
          </button>
          <button className="quick-action-btn" onClick={fetchNotifications}>
            🔄 Refresh Notifications
          </button>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="footer-navigation">
        <button className="footer-btn primary" onClick={() => navigate('/dashboard')}>
          🏠 Dashboard
        </button>
        <button className="footer-btn secondary" onClick={() => navigate('/settings')}>
          ⚙️ Settings
        </button>
      </div>
    </div>
  );
}
