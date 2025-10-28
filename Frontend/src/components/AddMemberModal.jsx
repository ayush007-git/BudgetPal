import React, { useEffect, useMemo, useState } from 'react';
import '../styles/AddMemberModal.css';
import { API_BASE_URL } from '../config';

export default function AddMemberModal({ groupId, isOpen, onClose, onAdded }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addingUserId, setAddingUserId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/auth/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok || !data?.success) {
          throw new Error(data?.message || 'Failed to fetch users');
        }
        if (!cancelled) setUsers(data.data.users || []);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchUsers();
    return () => { cancelled = true; };
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  }, [users, search]);

  const addUser = async (userId) => {
    try {
      setAddingUserId(userId);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to add member');
      }
      onAdded?.(data.data?.user);
      onClose?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setAddingUserId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="amodal-overlay" onClick={onClose}>
      <div className="amodal" onClick={(e) => e.stopPropagation()}>
        <div className="amodal-header">
          <h3>Add Members</h3>
          <button className="amodal-close" onClick={onClose}>✕</button>
        </div>
        <div className="amodal-search">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
          />
        </div>
        <div className="amodal-body">
          {loading && <div className="amodal-loading">Loading users…</div>}
          {error && <div className="amodal-error">{error}</div>}
          {!loading && !error && filtered.length === 0 && (
            <div className="amodal-empty">No users found</div>
          )}
          <div className="amodal-list">
            {filtered.map(u => (
              <div className="amodal-item" key={u.id}>
                <div className="amodal-avatar">{(u.username || 'U').charAt(0).toUpperCase()}</div>
                <div className="amodal-info">
                  <div className="amodal-name">{u.username}</div>
                  <div className="amodal-sub">{u.email || 'No email'}</div>
                </div>
                <button
                  className="amodal-add"
                  disabled={addingUserId === u.id}
                  onClick={() => addUser(u.id)}
                >{addingUserId === u.id ? 'Adding…' : 'Add'}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


