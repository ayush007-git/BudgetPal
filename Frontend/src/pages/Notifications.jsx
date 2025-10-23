import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Notifications.css';
import { API_BASE_URL } from '../config';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'expense': return '💰';
      case 'settlement': return '⚖️';
      case 'member': return '👥';
      case 'payment': return '✅';
      default: return '🔔';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="notifications-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <div className="unread-badge">{unreadCount} unread</div>
        )}
      </div>

      {/* Actions */}
      <div className="notifications-actions">
        <button 
          className="action-btn" 
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          Mark All as Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <div className="no-notifications-icon">🔔</div>
            <h3>No notifications yet</h3>
            <p>You'll see updates about your groups and expenses here.</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <div className="notification-header">
                  <h4>{notification.title}</h4>
                  <span className="timestamp">{getTimeAgo(notification.timestamp)}</span>
                </div>
                <p className="notification-message">{notification.message}</p>
                <div className="notification-meta">
                  <span className="group-name">{notification.groupName}</span>
                  {!notification.read && <span className="unread-dot"></span>}
                </div>
              </div>
              <div className="notification-actions">
                <button 
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          className="action-btn primary" 
          onClick={() => navigate('/dashboard')}
        >
          🏠 Dashboard
        </button>
        <button 
          className="action-btn secondary" 
          onClick={() => navigate('/settings')}
        >
          ⚙️ Settings
        </button>
      </div>
    </div>
  );
}
