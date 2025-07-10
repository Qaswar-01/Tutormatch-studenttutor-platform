import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { messageAPI } from '../../services/api';
import FullScreenChat from './FullScreenChat';
import './ChatButton.css';

const ChatButton = ({ session, className = '' }) => {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Only show chat button for approved sessions
  const canChat = session.status === 'approved';

  // Check if user is participant in this session
  const isParticipant = 
    session.student._id === user._id || 
    session.tutor._id === user._id;

  useEffect(() => {
    if (canChat && isParticipant) {
      // Load unread message count
      loadUnreadCount();
    }
  }, [canChat, isParticipant]);

  const loadUnreadCount = async () => {
    try {
      const response = await messageAPI.getUnreadCount();
      setUnreadCount(response.data.data.unreadCount || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleOpenChat = () => {
    if (!canChat) {
      return;
    }
    setIsChatOpen(true);
    setUnreadCount(0); // Reset unread count when opening chat
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  // Don't render if user can't chat
  if (!canChat || !isParticipant) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleOpenChat}
        className={`chat-button ${className}`}
        title="Open chat"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          className="chat-icon"
        >
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
        <span>Chat</span>
        {unreadCount > 0 && (
          <span className="unread-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <FullScreenChat
        session={session}
        isOpen={isChatOpen}
        onClose={handleCloseChat}
      />
    </>
  );
};

export default ChatButton;
