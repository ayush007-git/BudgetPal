import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Chat.css';
import { API_BASE_URL } from '../config';

export default function Chat() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchChatData();
    // Set up real-time updates (WebSocket or polling)
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatData = async () => {
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
      }

      // Fetch current user info
      const userRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (userRes.ok) {
        const userData = await userRes.json();
        setCurrentUser(userData.user);
      }

      // Fetch messages
      await fetchMessages();

    } catch (err) {
      console.error('Error fetching chat data:', err);
      // Fallback to mock data for testing
      setGroup({ 
        id: groupId, 
        name: 'Sample Group', 
        description: 'Test group for chat' 
      });
      setMembers([
        { id: 1, username: 'Alice', isOnline: true },
        { id: 2, username: 'Bob', isOnline: false },
        { id: 3, username: 'Charlie', isOnline: true }
      ]);
      setCurrentUser({ id: 1, username: 'Alice' });
      setMessages([
        {
          id: 1,
          content: 'Hey everyone! How are you doing?',
          senderId: 1,
          senderName: 'Alice',
          timestamp: new Date(Date.now() - 3600000),
          type: 'text'
        },
        {
          id: 2,
          content: 'Great! Just finished the project.',
          senderId: 2,
          senderName: 'Bob',
          timestamp: new Date(Date.now() - 3000000),
          type: 'text'
        },
        {
          id: 3,
          content: 'Awesome! 🎉',
          senderId: 3,
          senderName: 'Charlie',
          timestamp: new Date(Date.now() - 2400000),
          type: 'text'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/groups/${groupId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    const messageData = {
      content: newMessage.trim(),
      type: 'text',
      groupId: parseInt(groupId)
    };

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });

      if (res.ok) {
        setNewMessage('');
        // Add message to local state immediately for better UX
        const newMsg = {
          id: Date.now(),
          content: messageData.content,
          senderId: currentUser.id,
          senderName: currentUser.username,
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, newMsg]);
      } else {
        console.error('Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      // For demo purposes, add message to local state
      const newMsg = {
        id: Date.now(),
        content: messageData.content,
        senderId: currentUser.id,
        senderName: currentUser.username,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Simulate typing indicator
    if (e.target.value.length > 0 && !isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageTime.toLocaleDateString();
    }
  };

  const filteredMembers = members.filter(member =>
    member.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="chat-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(`/group/${groupId}`)}>
            ← Back
          </button>
          <div className="group-info">
            <h1 className="group-name">{group?.name}</h1>
            <p className="member-count">{members.length} members</p>
          </div>
        </div>
        <div className="header-right">
          <button className="settings-btn">
            ⚙️
          </button>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="chat-main">
        {/* Left Panel - Members */}
        <div className="members-panel">
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>

          <div className="members-list">
            <h3>Group Members</h3>
            {filteredMembers.map(member => (
              <div key={member.id} className="member-item">
                <div className="member-avatar">
                  {member.username.charAt(0).toUpperCase()}
                </div>
                <div className="member-info">
                  <span className="member-name">{member.username}</span>
                  <span className={`member-status ${member.isOnline ? 'online' : 'offline'}`}>
                    {member.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                {member.isOnline && <div className="online-indicator"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div className="chat-panel">
          {/* Messages Area */}
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <div className="empty-icon">💬</div>
                <h3>Start the conversation!</h3>
                <p>Send a message to begin chatting with your group.</p>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map((message, index) => {
                  const isOwnMessage = message.senderId === currentUser?.id;
                  const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
                  
                  return (
                    <div key={message.id} className={`message-wrapper ${isOwnMessage ? 'own' : 'other'}`}>
                      {!isOwnMessage && showAvatar && (
                        <div className="message-avatar">
                          {message.senderName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className={`message-bubble ${isOwnMessage ? 'own' : 'other'}`}>
                        {!isOwnMessage && showAvatar && (
                          <div className="sender-name">{message.senderName}</div>
                        )}
                        <div className="message-content">{message.content}</div>
                        <div className="message-time">{formatTime(message.timestamp)}</div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="typing-text">
                      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="message-input-container">
            <form onSubmit={sendMessage} className="message-form">
              <div className="input-group">
                <button type="button" className="attachment-btn">
                  📎
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="message-input"
                />
                <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                  ➤
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
