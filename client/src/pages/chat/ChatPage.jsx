import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { sessionAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { MessageCircle, Clock, User, Calendar, Search } from 'lucide-react';
import FullScreenChat from '../../components/chat/FullScreenChat';
import './ChatPage.css';

const ChatPage = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadChatSessions();
  }, []);

  const loadChatSessions = async () => {
    try {
      setLoading(true);
      const response = await sessionAPI.getUserSessions();
      
      // Filter only approved sessions for chat
      const approvedSessions = response.data.sessions.filter(
        session => session.status === 'approved'
      );
      
      setSessions(approvedSessions);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      toast.error('Failed to load chat sessions');
    } finally {
      setLoading(false);
    }
  };

  const openChat = (session) => {
    setSelectedSession(session);
  };

  const closeChat = () => {
    setSelectedSession(null);
  };

  const getOtherUser = (session) => {
    return session.student._id === user._id ? session.tutor : session.student;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const filteredSessions = sessions.filter(session => {
    const otherUser = getOtherUser(session);
    const matchesSearch = searchTerm === '' || 
      otherUser.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      otherUser.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'recent' && new Date(session.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="chat-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="container">
        <div className="chat-header">
          <div className="header-content">
            <h1>
              <MessageCircle size={32} />
              Messages
            </h1>
            <p className="header-subtitle">
              Chat with your {user.role === 'tutor' ? 'students' : 'tutors'} from approved sessions
            </p>
          </div>
          
          <div className="connection-status">
            <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              <span className="status-dot"></span>
              {isConnected ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>

        <div className="chat-controls">
          <div className="search-container">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-buttons">
            <button
              onClick={() => setFilterStatus('all')}
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            >
              All Conversations
            </button>
            <button
              onClick={() => setFilterStatus('recent')}
              className={`filter-btn ${filterStatus === 'recent' ? 'active' : ''}`}
            >
              Recent
            </button>
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="empty-state">
            <MessageCircle size={64} />
            <h3>No conversations available</h3>
            <p>
              {sessions.length === 0 
                ? "You don't have any approved sessions yet. Book a session to start chatting!"
                : "No conversations match your search criteria."
              }
            </p>
            {sessions.length === 0 && (
              <a href="/tutors" className="btn btn-primary">
                Find Tutors
              </a>
            )}
          </div>
        ) : (
          <div className="conversations-list">
            {filteredSessions.map(session => {
              const otherUser = getOtherUser(session);
              return (
                <div
                  key={session._id}
                  className="conversation-card"
                  onClick={() => openChat(session)}
                >
                  <div className="conversation-avatar">
                    {otherUser.avatar ? (
                      <img
                        src={otherUser.avatar}
                        alt={`${otherUser.firstName} ${otherUser.lastName}`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="avatar-initials"
                      style={{ 
                        display: otherUser.avatar ? 'none' : 'flex',
                        backgroundColor: `hsl(${otherUser.firstName.charCodeAt(0) * 137.508}deg, 70%, 50%)`
                      }}
                    >
                      {otherUser.firstName[0]}{otherUser.lastName[0]}
                    </div>
                  </div>

                  <div className="conversation-info">
                    <div className="conversation-header">
                      <h3 className="user-name">
                        {otherUser.firstName} {otherUser.lastName}
                      </h3>
                      <span className="session-date">
                        {formatDate(session.date)}
                      </span>
                    </div>
                    
                    <div className="conversation-details">
                      <div className="session-subject">
                        <span className="subject-tag">{session.subject}</span>
                      </div>
                      <div className="session-time">
                        <Clock size={14} />
                        {session.startTime} - {session.endTime}
                      </div>
                    </div>
                  </div>

                  <div className="conversation-action">
                    <MessageCircle size={20} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedSession && (
          <FullScreenChat
            session={selectedSession}
            isOpen={true}
            onClose={closeChat}
          />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
