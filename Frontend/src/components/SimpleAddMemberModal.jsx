import React, { useState } from 'react';
import '../styles/AddMemberModal.css';
import { API_BASE_URL } from '../config';

export default function SimpleAddMemberModal({ groupId, isOpen, onClose, onAdded, showError, showSuccess }) {
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!username.trim()) return;
    try {
      setSubmitting(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: username.trim() })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to add member');
      }
      showSuccess?.('Member added successfully');
      onAdded?.(data.data?.user);
      setUsername('');
      onClose?.();
    } catch (e) {
      setError(e.message);
      showError?.(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="amodal-overlay" onClick={onClose}>
      <div className="amodal" onClick={(e) => e.stopPropagation()}>
        <div className="amodal-header">
          <h3>Add Member</h3>
          <button className="amodal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="amodal-search" style={{ paddingTop: 18 }}>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoFocus
            />
          </div>
          {error && <div className="amodal-error" style={{ paddingTop: 0 }}>{error}</div>}
          <div className="amodal-body" style={{ paddingTop: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '10px 12px' }}>
              <button type="button" className="amodal-add" onClick={onClose} style={{ background: '#aaa' }}>Cancel</button>
              <button type="submit" className="amodal-add" disabled={!username.trim() || submitting}>
                {submitting ? 'Adding…' : 'Add'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


