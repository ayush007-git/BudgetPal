import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import '../styles/Chat.css'; // Import your CSS file

function Chat() {
  const { groupId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/groups/${groupId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setMessages(data.messages);
        } else {
          setError(data?.message || 'Failed to fetch messages');
          console.error('Failed to fetch messages:', data?.message);
        }
      } catch (err) {
        setError(err.message || 'An unexpected error occurred');
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [groupId]);

  const sendMessage = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Add the new message to the state
        setMessages([...messages, data.data.message]);
        setNewMessage('');
      } else {
        setError(data?.message || 'Failed to send message');
        console.error('Failed to send message:', data?.message);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      console.error('Error sending message:', err);
    }
  };

  if (loading) return <div>Loading messages...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="chat-container">
      <h2>Chat</h2>
      <div className="messages-list">
        {messages.map((message) => (
          <div key={message.id} className="message-item">
            <span className="message-sender">{message.senderName}:</span>
            <p className="message-content">{message.content}</p>
            <span className="message-timestamp">{new Date(message.timestamp).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="message-input">
        <input
          type="text"
          placeholder="Enter your message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={sendMessage} disabled={!newMessage.trim()}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
