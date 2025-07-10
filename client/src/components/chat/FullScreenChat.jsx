import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { messageAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './FullScreenChat.css';

const FullScreenChat = ({ session, isOpen, onClose }) => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Get other user info
  const otherUser = session.student._id === user._id ? session.tutor : session.student;

  // Load messages when chat opens
  useEffect(() => {
    if (isOpen && session) {
      loadMessages();
      
      if (socket && isConnected) {
        // Join session room
        socket.emit('join_session', session._id);
        
        // Set up event listeners
        socket.on('new_message', handleNewMessage);
        socket.on('user_typing', handleUserTyping);
        socket.on('user_stopped_typing', handleUserStoppedTyping);
        socket.on('user_joined', handleUserJoined);
        socket.on('user_left', handleUserLeft);
        socket.on('error', handleSocketError);
      }
    }

    return () => {
      if (socket) {
        socket.emit('leave_session', session._id);
        socket.off('new_message', handleNewMessage);
        socket.off('user_typing', handleUserTyping);
        socket.off('user_stopped_typing', handleUserStoppedTyping);
        socket.off('user_joined', handleUserJoined);
        socket.off('user_left', handleUserLeft);
        socket.off('error', handleSocketError);
      }
    };
  }, [isOpen, session?._id, socket, isConnected]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getSessionMessages(session._id, { page: 1, limit: 100 });
      setMessages(response.data.data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      socket?.emit('typing_stop', { sessionId: session._id });
    }

    try {
      await messageAPI.sendMessage({
        sessionId: session._id,
        text: messageText
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleNewMessage = (message) => {
    if (message.sessionId === session._id) {
      setMessages(prev => [...prev, message]);
    }
  };

  const handleUserTyping = (data) => {
    if (data.sessionId === session._id && data.userId !== user._id) {
      setTypingUsers(prev => new Set([...prev, data.userId]));
    }
  };

  const handleUserStoppedTyping = (data) => {
    if (data.sessionId === session._id) {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    }
  };

  const handleUserJoined = (data) => {
    console.log(`${data.userName} joined the chat`);
  };

  const handleUserLeft = (data) => {
    console.log(`${data.userName} left the chat`);
  };

  const handleSocketError = (error) => {
    console.error('Socket error:', error);
    toast.error(error.message || 'Connection error');
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (socket && isConnected) {
      if (value.trim() && !isTyping) {
        setIsTyping(true);
        socket.emit('typing_start', { sessionId: session._id });
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          socket.emit('typing_stop', { sessionId: session._id });
        }
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  if (!isOpen) return null;

  const messageGroups = groupMessagesByDate(messages);

  // Render the chat modal using a portal to ensure it's on top
  return createPortal(
    <div className="fullscreen-chat-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fullscreen-chat-container">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="user-avatar">
              <img
                src={otherUser.avatar || `https://ui-avatars.com/api/?name=${otherUser.firstName}+${otherUser.lastName}&size=48&background=6366f1&color=ffffff`}
                alt={`${otherUser.firstName} ${otherUser.lastName}`}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${otherUser.firstName}+${otherUser.lastName}&size=48&background=6366f1&color=ffffff`;
                }}
              />
              <div className={`status-indicator ${isConnected ? 'online' : 'offline'}`}></div>
            </div>
            <div className="user-details">
              <h2>{otherUser.firstName} {otherUser.lastName}</h2>
              <p className="session-info">{session.subject} • {session.startTime} - {session.endTime}</p>
            </div>
          </div>
          
          <div className="chat-header-actions">
            <div className="connection-status">
              <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <button 
              onClick={onClose}
              className="close-button"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="chat-messages" ref={chatContainerRef}>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading messages...</p>
            </div>
          ) : (
            <>
              {Object.entries(messageGroups).map(([date, dateMessages]) => (
                <div key={date} className="message-group">
                  <div className="date-separator">
                    <span>{formatDate(date)}</span>
                  </div>
                  
                  {dateMessages.map((message) => (
                    <div 
                      key={message._id} 
                      className={`message ${message.senderId._id === user._id ? 'own-message' : 'other-message'}`}
                    >
                      <div className="message-content">
                        <div className="message-text">{message.text}</div>
                        <div className="message-time">{formatTime(message.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              
              {/* Typing Indicator */}
              {typingUsers.size > 0 && (
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-text">{otherUser.firstName} is typing...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <textarea
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${otherUser.firstName}...`}
              className="chat-input"
              disabled={sending || !isConnected}
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending || !isConnected}
              className="send-button"
            >
              {sending ? (
                <div className="button-spinner"></div>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              )}
            </button>
          </div>
          
          {!isConnected && (
            <div className="connection-warning">
              ⚠️ You're offline. Messages will be sent when connection is restored.
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FullScreenChat;
