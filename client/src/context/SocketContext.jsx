import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && token && !socketRef.current) {
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: token
        },
        autoConnect: true,
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('🔌 Connected to server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from server:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('🔌 Connection error:', error);
        setIsConnected(false);
      });

      // Message event handlers
      newSocket.on('new_message', (message) => {
        console.log('💬 New message received:', message);
        // Handle new message (will be used in chat components)
      });

      newSocket.on('user_typing', (data) => {
        console.log('⌨️ User typing:', data);
        // Handle typing indicator
      });

      newSocket.on('user_stopped_typing', (data) => {
        console.log('⌨️ User stopped typing:', data);
        // Handle stop typing indicator
      });

      // Video call event handlers
      newSocket.on('video_call_started', (data) => {
        console.log('📹 Video call started:', data);
        toast.info(`${data.initiator.firstName} started a video call`);
      });

      newSocket.on('video_call_ended', (data) => {
        console.log('📹 Video call ended:', data);
        toast.info(`Video call ended by ${data.endedBy.firstName}`);
      });

      // Notification event handlers
      newSocket.on('new_notification', (notification) => {
        console.log('🔔 New notification:', notification);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        toast.info(notification.title, {
          onClick: () => {
            if (notification.actionUrl) {
              window.location.href = notification.actionUrl;
            }
          }
        });
      });

      newSocket.on('session_notification', (notification) => {
        console.log('📚 Session notification:', notification);
        toast.info(notification.message);
      });

      // Real-time session status updates
      newSocket.on('session_status_updated', (sessionData) => {
        console.log('📚 Session status updated:', sessionData);

        const statusMessages = {
          approved: `🎉 Your session with ${sessionData.tutorName} has been approved!`,
          rejected: `❌ Your session request with ${sessionData.tutorName} was declined.`,
          cancelled: `🚫 Session with ${sessionData.tutorName} has been cancelled.`,
          'in-progress': `🔴 Your session with ${sessionData.tutorName} is now live!`,
          completed: `✅ Session with ${sessionData.tutorName} has been completed.`
        };

        if (statusMessages[sessionData.status]) {
          toast.success(statusMessages[sessionData.status], {
            onClick: () => {
              window.location.href = `/sessions/${sessionData.sessionId}`;
            }
          });
        }
      });

      // Real-time session messages
      newSocket.on('session_message_received', (messageData) => {
        console.log('💬 New session message:', messageData);
        toast.info(`${messageData.senderName}: ${messageData.message.substring(0, 50)}...`, {
          onClick: () => {
            window.location.href = `/sessions/${messageData.sessionId}`;
          }
        });
      });

      // Online users handler
      newSocket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
          setSocket(null);
          setIsConnected(false);
        }
      };
    }
  }, [isAuthenticated, token]);

  // Cleanup on logout
  useEffect(() => {
    if (!isAuthenticated && socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers([]);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // Socket utility functions
  const joinSession = (sessionId) => {
    if (socket) {
      socket.emit('join_session', sessionId);
    }
  };

  const leaveSession = (sessionId) => {
    if (socket) {
      socket.emit('leave_session', sessionId);
    }
  };

  const sendMessage = (messageData) => {
    if (socket) {
      socket.emit('send_message', messageData);
    }
  };

  const startTyping = (sessionId) => {
    if (socket) {
      socket.emit('typing_start', sessionId);
    }
  };

  const stopTyping = (sessionId) => {
    if (socket) {
      socket.emit('typing_stop', sessionId);
    }
  };

  const startVideoCall = (sessionId, roomUrl) => {
    if (socket) {
      socket.emit('video_call_start', { sessionId, roomUrl });
    }
  };

  const endVideoCall = (sessionId) => {
    if (socket) {
      socket.emit('video_call_end', sessionId);
    }
  };

  const markNotificationAsRead = (notificationId) => {
    if (socket) {
      socket.emit('mark_notification_read', notificationId);
    }
    
    // Update local state
    setNotifications(prev => 
      prev.map(notif => 
        notif._id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const updateStatus = (status) => {
    if (socket) {
      socket.emit('update_status', status);
    }
  };

  // Session request functions
  const sendSessionRequest = (sessionData) => {
    if (socket) {
      socket.emit('new_session_request', sessionData);
    }
  };

  const updateSessionStatus = (sessionId, status) => {
    if (socket) {
      socket.emit('session_status_update', { sessionId, status });
    }
  };

  const joinSessionRoom = (sessionId) => {
    if (socket) {
      socket.emit('join_session_room', sessionId);
    }
  };

  const leaveSessionRoom = (sessionId) => {
    if (socket) {
      socket.emit('leave_session_room', sessionId);
    }
  };

  // Check if user is online
  const isUserOnline = (userId) => {
    return onlineUsers.some(user => user.userId === userId);
  };

  // Get unread notifications
  const getUnreadNotifications = () => {
    return notifications.filter(notif => !notif.isRead);
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    notifications,
    unreadCount,
    joinSession,
    leaveSession,
    sendMessage,
    startTyping,
    stopTyping,
    startVideoCall,
    endVideoCall,
    markNotificationAsRead,
    updateStatus,
    isUserOnline,
    getUnreadNotifications,
    sendSessionRequest,
    updateSessionStatus,
    joinSessionRoom,
    leaveSessionRoom,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
