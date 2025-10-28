import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import '../styles/Notifications.css'; // Import your CSS file

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setNotifications(data.data.notifications);
        } else {
          setError(data?.message || 'Failed to fetch notifications');
          console.error('Failed to fetch notifications:', data?.message);
        }
      } catch (err) {
        setError(err.message || 'An unexpected error occurred');
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Update the notification in the state
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      } else {
        setError(data?.message || 'Failed to mark as read');
        console.error('Failed to mark as read:', data?.message);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      console.error('Error marking as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Remove the notification from the state
        setNotifications(notifications.filter(n => n.id !== id));
      } else {
        setError(data?.message || 'Failed to delete notification');
        console.error('Failed to delete notification:', data?.message);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      console.error('Error deleting notification:', err);
    }
  };

  if (loading) return <div>Loading notifications...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <div>No notifications yet.</div>
      ) : (
        <ul className="notifications-list">
          {notifications.map((notification) => (
            <li key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <p className="notification-timestamp">{new Date(notification.created_at).toLocaleString()}</p>
              </div>
              <div className="notification-actions">
                {!notification.read && (
                  <button className="mark-read-button" onClick={() => markAsRead(notification.id)}>
                    Mark as Read
                  </button>
                )}
                <button className="delete-button" onClick={() => deleteNotification(notification.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notifications;
