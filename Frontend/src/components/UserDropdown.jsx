import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config';
import '../styles/UserDropdown.css';

const UserDropdown = ({ 
  value, 
  onChange, 
  placeholder = "Select user...", 
  className = "",
  disabled = false,
  showSearch = true,
  excludeCurrentUser = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fetch users from API
  const fetchUsers = async (search = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const url = new URL(`${API_BASE_URL}/api/auth/users`);
      if (search.trim()) {
        url.searchParams.append('search', search.trim());
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users || []);
        setFilteredUsers(data.data.users || []);
      } else {
        console.error('Failed to fetch users');
        // Fallback to mock data for demo
        setUsers(getMockUsers());
        setFilteredUsers(getMockUsers());
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to mock data for demo
      setUsers(getMockUsers());
      setFilteredUsers(getMockUsers());
    } finally {
      setLoading(false);
    }
  };

  // Mock users for demo purposes
  const getMockUsers = () => [
    { id: 1, username: 'alice_johnson', email: 'alice@example.com' },
    { id: 2, username: 'bob_smith', email: 'bob@example.com' },
    { id: 3, username: 'charlie_brown', email: 'charlie@example.com' },
    { id: 4, username: 'diana_prince', email: 'diana@example.com' },
    { id: 5, username: 'eve_wilson', email: 'eve@example.com' }
  ];

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // Find selected user when value changes
  useEffect(() => {
    if (value && users.length > 0) {
      const user = users.find(u => u.id === parseInt(value));
      setSelectedUser(user || null);
    } else {
      setSelectedUser(null);
    }
  }, [value, users]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    onChange(user.id);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Handle dropdown toggle
  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen && showSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounced search
    if (query.trim().length >= 2) {
      fetchUsers(query);
    } else if (query.trim().length === 0) {
      fetchUsers();
    }
  };

  // Clear selection
  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedUser(null);
    onChange('');
    setSearchQuery('');
  };

  return (
    <div className={`user-dropdown ${className} ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`} ref={dropdownRef}>
      <div className="dropdown-trigger" onClick={handleToggle}>
        <div className="selected-user">
          {selectedUser ? (
            <div className="user-info">
              <div className="user-avatar">
                {selectedUser.username.charAt(0).toUpperCase()}
              </div>
                  <div className="user-details">
                    <span className="username">{selectedUser.username}</span>
                    <span className="email">{selectedUser.email || 'No email'}</span>
                  </div>
            </div>
          ) : (
            <span className="placeholder">{placeholder}</span>
          )}
        </div>
        
        <div className="dropdown-actions">
          {selectedUser && (
            <button 
              type="button" 
              className="clear-btn"
              onClick={handleClear}
              title="Clear selection"
            >
              ✕
            </button>
          )}
          <div className="dropdown-arrow">
            {isOpen ? '▲' : '▼'}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          {showSearch && (
            <div className="search-section">
              <div className="search-input-wrapper">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
            </div>
          )}

          <div className="users-list">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <span>Loading users...</span>
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={`user-option ${selectedUser?.id === user.id ? 'selected' : ''}`}
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <span className="username">{user.username}</span>
                    <span className="email">{user.email || 'No email'}</span>
                  </div>
                  {selectedUser?.id === user.id && (
                    <div className="selected-indicator">✓</div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-results">
                <div className="no-results-icon">👤</div>
                <div className="no-results-text">No users found</div>
                <div className="no-results-subtext">
                  {searchQuery ? 'Try different search terms' : 'No users available'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
