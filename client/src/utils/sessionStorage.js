// Local session storage management for development/demo purposes
// This simulates a backend database using localStorage

const STORAGE_KEYS = {
  SESSIONS: 'quickmentor_sessions',
  SESSION_REQUESTS: 'quickmentor_session_requests',
  NOTIFICATIONS: 'quickmentor_notifications'
};

// Initialize storage if not exists
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SESSION_REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.SESSION_REQUESTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  }
};

// Session Request Management
export const sessionRequestStorage = {
  // Create a new session request
  create: (sessionData) => {
    initializeStorage();
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_REQUESTS));
    
    const newRequest = {
      ...sessionData,
      _id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    requests.push(newRequest);
    localStorage.setItem(STORAGE_KEYS.SESSION_REQUESTS, JSON.stringify(requests));
    
    // Also create a notification for the tutor
    notificationStorage.create({
      userId: sessionData.tutor._id,
      type: 'session_request',
      title: 'New Session Request',
      message: `${sessionData.student.firstName} ${sessionData.student.lastName} has requested a ${sessionData.subject} session`,
      data: { sessionRequestId: newRequest._id },
      isRead: false
    });
    
    return newRequest;
  },

  // Get requests for a specific tutor
  getByTutorId: (tutorId) => {
    initializeStorage();
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_REQUESTS));
    return requests.filter(req => req.tutor._id === tutorId && req.status === 'pending');
  },

  // Get requests for a specific student
  getByStudentId: (studentId) => {
    initializeStorage();
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_REQUESTS));
    return requests.filter(req => req.student._id === studentId);
  },

  // Update request status (approve/reject)
  updateStatus: (requestId, status, updatedBy) => {
    initializeStorage();
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_REQUESTS));
    const requestIndex = requests.findIndex(req => req._id === requestId);
    
    if (requestIndex !== -1) {
      requests[requestIndex].status = status;
      requests[requestIndex].updatedAt = new Date().toISOString();
      requests[requestIndex].updatedBy = updatedBy;
      
      localStorage.setItem(STORAGE_KEYS.SESSION_REQUESTS, JSON.stringify(requests));
      
      // If approved, create a session
      if (status === 'approved') {
        const request = requests[requestIndex];
        sessionStorage.create({
          ...request,
          status: 'approved'
        });
        
        // Notify student of approval
        notificationStorage.create({
          userId: request.student._id,
          type: 'session_approved',
          title: 'Session Approved! 🎉',
          message: `Your ${request.subject} session with ${request.tutor.firstName} ${request.tutor.lastName} has been approved`,
          data: { sessionId: request._id },
          isRead: false
        });
      } else if (status === 'rejected') {
        // Notify student of rejection
        notificationStorage.create({
          userId: requests[requestIndex].student._id,
          type: 'session_rejected',
          title: 'Session Request Declined',
          message: `Your ${requests[requestIndex].subject} session request has been declined`,
          data: { sessionRequestId: requestId },
          isRead: false
        });
      }
      
      return requests[requestIndex];
    }
    
    return null;
  },

  // Get all requests
  getAll: () => {
    initializeStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_REQUESTS));
  }
};

// Session Management
export const sessionStorage = {
  // Create a new session (from approved request)
  create: (sessionData) => {
    initializeStorage();
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS));
    
    const newSession = {
      ...sessionData,
      _id: sessionData._id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: sessionData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    sessions.push(newSession);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    
    return newSession;
  },

  // Get sessions for a user (student or tutor)
  getByUserId: (userId, role) => {
    initializeStorage();
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS));
    
    if (role === 'student') {
      return sessions.filter(session => session.student._id === userId);
    } else if (role === 'tutor') {
      return sessions.filter(session => session.tutor._id === userId);
    }
    
    return [];
  },

  // Get session by ID
  getById: (sessionId) => {
    initializeStorage();
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS));
    return sessions.find(session => session._id === sessionId);
  },

  // Update session
  update: (sessionId, updateData) => {
    initializeStorage();
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS));
    const sessionIndex = sessions.findIndex(session => session._id === sessionId);
    
    if (sessionIndex !== -1) {
      sessions[sessionIndex] = {
        ...sessions[sessionIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      return sessions[sessionIndex];
    }
    
    return null;
  },

  // Get all sessions
  getAll: () => {
    initializeStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS));
  }
};

// Notification Management
export const notificationStorage = {
  // Create a new notification
  create: (notificationData) => {
    initializeStorage();
    const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS));
    
    const newNotification = {
      ...notificationData,
      _id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    notifications.push(newNotification);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    
    return newNotification;
  },

  // Get notifications for a user
  getByUserId: (userId) => {
    initializeStorage();
    const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS));
    return notifications
      .filter(notif => notif.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // Get unread count for a user
  getUnreadCount: (userId) => {
    const userNotifications = notificationStorage.getByUserId(userId);
    return userNotifications.filter(notif => !notif.isRead).length;
  },

  // Mark notification as read
  markAsRead: (notificationId) => {
    initializeStorage();
    const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS));
    const notifIndex = notifications.findIndex(notif => notif._id === notificationId);
    
    if (notifIndex !== -1) {
      notifications[notifIndex].isRead = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      return notifications[notifIndex];
    }
    
    return null;
  }
};

// Clear all data (for testing)
export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.SESSIONS);
  localStorage.removeItem(STORAGE_KEYS.SESSION_REQUESTS);
  localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
};

// Debug function to check session statuses
export const debugSessionData = () => {
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]');
  const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_REQUESTS) || '[]');

  console.log('=== SESSION DEBUG INFO ===');
  console.log('Sessions:', sessions.map(s => ({ id: s._id, status: s.status, subject: s.subject })));
  console.log('Requests:', requests.map(r => ({ id: r._id, status: r.status, subject: r.subject })));
  console.log('========================');

  return { sessions, requests };
};

// Fix corrupted session data
export const fixSessionData = () => {
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]');
  const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_REQUESTS) || '[]');

  // Fix any sessions that have incorrect status
  const fixedSessions = sessions.map(session => {
    if (session.status === 'cancelled' && !session.cancelledAt) {
      // If marked as cancelled but no cancellation timestamp, reset to approved
      console.log(`Fixing session ${session._id} - resetting from cancelled to approved`);
      return { ...session, status: 'approved' };
    }
    return session;
  });

  // Fix any requests that have incorrect status
  const fixedRequests = requests.map(request => {
    if (request.status === 'cancelled' && !request.cancelledAt) {
      // If marked as cancelled but no cancellation timestamp, reset to pending
      console.log(`Fixing request ${request._id} - resetting from cancelled to pending`);
      return { ...request, status: 'pending' };
    }
    return request;
  });

  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(fixedSessions));
  localStorage.setItem(STORAGE_KEYS.SESSION_REQUESTS, JSON.stringify(fixedRequests));

  console.log('Session data fixed!');
  return { fixedSessions, fixedRequests };
};

// Initialize storage on import
initializeStorage();
