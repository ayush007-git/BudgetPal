import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/AddExpense.css';
import { API_BASE_URL } from '../config';

export default function AddExpense() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    description: '',
    totalAmount: '',
    paidById: '',
    screenshotUrl: '',
    splitType: 'equal' // equal, custom
  });
  const [customSplits, setCustomSplits] = useState({});

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/groups/${groupId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setGroup(data.data.group);
        setMembers(data.data.group.members || []);
        
        // Set default payer to current user
        const user = JSON.parse(localStorage.getItem('user'));
        setFormData(prev => ({
          ...prev,
          paidById: user.id.toString()
        }));
      }
    } catch (err) {
      console.error('Error fetching group data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCustomSplitChange = (memberId, amount) => {
    setCustomSplits(prev => ({
      ...prev,
      [memberId]: parseFloat(amount) || 0
    }));
  };

  const calculateEqualSplit = () => {
    const amount = parseFloat(formData.totalAmount);
    const memberCount = members.length;
    return memberCount > 0 ? amount / memberCount : 0;
  };

  const calculateCustomSplitTotal = () => {
    return Object.values(customSplits).reduce((sum, amount) => sum + amount, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.totalAmount || !formData.paidById) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.splitType === 'custom') {
      const customTotal = calculateCustomSplitTotal();
      const expectedTotal = parseFloat(formData.totalAmount);
      if (Math.abs(customTotal - expectedTotal) > 0.01) {
        alert(`Custom split total (₹${customTotal.toFixed(2)}) must equal expense total (₹${expectedTotal.toFixed(2)})`);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      
      // Prepare request body
      const requestBody = {
        description: formData.description,
        totalAmount: parseFloat(formData.totalAmount),
        paidById: parseInt(formData.paidById),
        screenshotUrl: formData.screenshotUrl || null
      };

      // Add custom splits if applicable
      if (formData.splitType === 'custom' && Object.keys(customSplits).length > 0) {
        requestBody.customSplits = customSplits;
      }
      
      const res = await fetch(`${API_BASE_URL}/api/groups/${groupId}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (res.ok) {
        alert('Expense added successfully!');
        navigate(`/group/${groupId}`);
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to add expense');
      }
    } catch (err) {
      alert('Error adding expense');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!group) {
    return <div className="error">Group not found</div>;
  }

  return (
    <div className="add-expense-page">
      {/* Header */}
      <div className="add-expense-header">
        <button className="back-btn" onClick={() => navigate(`/group/${groupId}`)}>
          ← Back to Group
        </button>
        <h1>Add New Expense</h1>
        <p>for {group.name}</p>
      </div>

      {/* Form */}
      <div className="add-expense-form">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Expense Details</h3>
            
            <div className="form-group">
              <label>Description *</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="e.g., Dinner at restaurant"
                required
              />
            </div>

            <div className="form-group">
              <label>Total Amount *</label>
              <input
                type="number"
                step="0.01"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleInputChange}
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label>Paid By *</label>
              <select
                name="paidById"
                value={formData.paidById}
                onChange={handleInputChange}
                required
              >
                <option value="">Select who paid</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.username}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Receipt URL (optional)</label>
              <input
                type="url"
                name="screenshotUrl"
                value={formData.screenshotUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/receipt.jpg"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Split Options</h3>
            
            <div className="split-type-selection">
              <label className="radio-option">
                <input
                  type="radio"
                  name="splitType"
                  value="equal"
                  checked={formData.splitType === 'equal'}
                  onChange={handleInputChange}
                />
                <span>Split equally among all members</span>
              </label>
              
              <label className="radio-option">
                <input
                  type="radio"
                  name="splitType"
                  value="custom"
                  checked={formData.splitType === 'custom'}
                  onChange={handleInputChange}
                />
                <span>Custom split amounts</span>
              </label>
            </div>

            {formData.splitType === 'equal' && (
              <div className="equal-split-info">
                <p>Each member will pay: <strong>₹{calculateEqualSplit().toFixed(2)}</strong></p>
                <div className="member-splits">
                  {members.map(member => (
                    <div key={member.id} className="split-item">
                      <span className="member-name">{member.username}</span>
                      <span className="split-amount">₹{calculateEqualSplit().toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.splitType === 'custom' && (
              <div className="custom-split-section">
                <h4>Custom Split Amounts</h4>
                <p>Total must equal expense amount: <strong>₹{formData.totalAmount || '0.00'}</strong></p>
                <p>Current total: <strong>₹{calculateCustomSplitTotal().toFixed(2)}</strong></p>
                
                {members.map(member => (
                  <div key={member.id} className="custom-split-item">
                    <label>{member.username}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={customSplits[member.id] || ''}
                      onChange={(e) => handleCustomSplitChange(member.id, e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate(`/group/${groupId}`)}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



