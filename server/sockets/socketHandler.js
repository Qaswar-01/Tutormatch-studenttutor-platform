const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');

// Store active connections
const activeUsers = new Map();

const socketHandler = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.user.firstName} ${socket.user.lastName} (${socket.userId})`);
    
    // Store user connection
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user,
      lastSeen: new Date()
    });

    // Join user to their personal room for notifications
    socket.join(`user_${socket.userId}`);

    // Handle joining session rooms with security checks
    socket.on('join_session', async (sessionId) => {
      try {
        // Verify session exists and user has access
        const session = await Session.findById(sessionId);
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // Check if user is participant
        const isParticipant =
          session.student.toString() === socket.userId ||
          session.tutor.toString() === socket.userId;

        if (!isParticipant) {
          socket.emit('error', { message: 'Access denied: Not a session participant' });
          return;
        }

        // Check if session is approved for chat
        if (session.status !== 'approved') {
          socket.emit('error', { message: 'Chat only available for approved sessions' });
          return;
        }

        socket.join(`session_${sessionId}`);
        console.log(`🏠 User ${socket.userId} joined session ${sessionId}`);

        // Notify other participants
        socket.to(`session_${sessionId}`).emit('user_joined', {
          userId: socket.userId,
          userName: `${socket.user.firstName} ${socket.user.lastName}`
        });
      } catch (error) {
        console.error('Error joining session:', error);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    // Handle leaving session rooms
    socket.on('leave_session', (sessionId) => {
      socket.leave(`session_${sessionId}`);
      console.log(`🚪 User ${socket.userId} left session ${sessionId}`);

      // Notify other participants
      socket.to(`session_${sessionId}`).emit('user_left', {
        userId: socket.userId,
        userName: `${socket.user.firstName} ${socket.user.lastName}`
      });
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { sessionId, content, type = 'text' } = data;
        
        // Emit message to all users in the session room
        socket.to(`session_${sessionId}`).emit('new_message', {
          sessionId,
          content,
          type,
          sender: {
            _id: socket.userId,
            firstName: socket.user.firstName,
            lastName: socket.user.lastName,
            avatar: socket.user.avatar
          },
          timestamp: new Date()
        });

        console.log(`💬 Message sent in session ${sessionId} by ${socket.userId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { sessionId } = data;
      socket.to(`session_${sessionId}`).emit('user_typing', {
        sessionId,
        userId: socket.userId,
        userName: `${socket.user.firstName} ${socket.user.lastName}`
      });
      console.log(`⌨️ User ${socket.userId} started typing in session ${sessionId}`);
    });

    socket.on('typing_stop', (data) => {
      const { sessionId } = data;
      socket.to(`session_${sessionId}`).emit('user_stopped_typing', {
        sessionId,
        userId: socket.userId
      });
      console.log(`⌨️ User ${socket.userId} stopped typing in session ${sessionId}`);
    });

    // Handle video call events
    socket.on('video_call_start', (data) => {
      const { sessionId, roomUrl } = data;
      socket.to(`session_${sessionId}`).emit('video_call_started', {
        roomUrl,
        initiator: {
          _id: socket.userId,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName
        }
      });
    });

    socket.on('video_call_end', (sessionId) => {
      socket.to(`session_${sessionId}`).emit('video_call_ended', {
        endedBy: {
          _id: socket.userId,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName
        }
      });
    });

    // Handle notifications
    socket.on('mark_notification_read', (notificationId) => {
      // Handle marking notifications as read
      console.log(`📬 Notification ${notificationId} marked as read by ${socket.userId}`);
    });

    // Handle user status updates
    socket.on('update_status', (status) => {
      if (activeUsers.has(socket.userId)) {
        activeUsers.get(socket.userId).status = status;
        activeUsers.get(socket.userId).lastSeen = new Date();
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`👤 User disconnected: ${socket.userId} (${reason})`);
      
      // Update last seen and remove from active users
      if (activeUsers.has(socket.userId)) {
        activeUsers.delete(socket.userId);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Helper function to send notification to specific user
  const sendNotificationToUser = (userId, notification) => {
    io.to(`user_${userId}`).emit('new_notification', notification);
  };

  // Helper function to send notification to session participants
  const sendNotificationToSession = (sessionId, notification) => {
    io.to(`session_${sessionId}`).emit('session_notification', notification);
  };

  // Helper function to get active users
  const getActiveUsers = () => {
    return Array.from(activeUsers.values()).map(user => ({
      userId: user.user._id,
      firstName: user.user.firstName,
      lastName: user.user.lastName,
      status: user.status || 'online',
      lastSeen: user.lastSeen
    }));
  };

  // Attach helper functions to io object for use in routes
  io.sendNotificationToUser = sendNotificationToUser;
  io.sendNotificationToSession = sendNotificationToSession;
  io.getActiveUsers = getActiveUsers;
};

module.exports = socketHandler;
