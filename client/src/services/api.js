import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Rate limiting tracker
const rateLimitTracker = {
  lastRequest: 0,
  requestCount: 0,
  resetTime: 0
};

// Request interceptor to add auth token and handle rate limiting
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add rate limiting delay for high-frequency requests
    const now = Date.now();
    if (rateLimitTracker.requestCount > 10 && now - rateLimitTracker.lastRequest < 1000) {
      // Add a small delay to prevent overwhelming the server
      return new Promise(resolve => {
        setTimeout(() => resolve(config), 100);
      });
    }

    rateLimitTracker.lastRequest = now;
    rateLimitTracker.requestCount++;

    // Reset counter every minute
    if (now - rateLimitTracker.resetTime > 60000) {
      rateLimitTracker.requestCount = 0;
      rateLimitTracker.resetTime = now;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 429) {
      // Rate limited - add exponential backoff
      const retryAfter = parseInt(error.response.headers['retry-after']) || 60;
      console.warn(`Rate limited. Retry after ${retryAfter} seconds`);

      // Update rate limit tracker
      rateLimitTracker.requestCount = 0;
      rateLimitTracker.resetTime = Date.now() + (retryAfter * 1000);

      // Add retry-after info to error
      error.retryAfter = retryAfter;
    } else if (error.response?.status === 500) {
      // Internal server error - treat similar to rate limiting
      console.warn('Internal server error - using fallback data');

      // Reset request counter to prevent further errors
      rateLimitTracker.requestCount = 0;
      rateLimitTracker.resetTime = Date.now() + (30 * 1000); // 30 second cooldown
    } else if (error.response?.status === 404) {
      // Not found - likely missing endpoint
      console.warn('API endpoint not found - using fallback data');
    } else if (error.response?.status === 400) {
      // Bad request - log for debugging
      console.warn('Bad request:', error.response?.data?.message || error.message);
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  updatePassword: (data) => api.put('/auth/update-password', data),
  verifyEmail: (token) => api.post('/auth/verify-email', { verificationToken: token }),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/upload-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  changePassword: (data) => api.put('/auth/update-password', data),
  deleteAccount: () => api.delete('/users/account'),
  getUserById: (id) => api.get(`/users/${id}`),
  getBookmarks: () => api.get('/users/bookmarks'),
  toggleBookmark: (tutorId) => api.post(`/users/bookmark/${tutorId}`),
};

// Tutor API calls
export const tutorAPI = {
  getAllTutors: (params) => api.get('/tutors', { params }),
  searchTutors: (params) => api.get('/tutors/search', { params }),
  getTutorById: (id) => api.get(`/tutors/${id}`),
  getTutorStats: (id) => api.get(`/tutors/${id}/stats`),
  updateAvailability: (data) => api.put('/tutors/availability', data),
};

// Session API calls
export const sessionAPI = {
  createSession: (data) => api.post('/sessions', data),
  getUserSessions: (params) => api.get('/sessions', { params }),
  getSessionById: (id) => api.get(`/sessions/${id}`),
  updateSession: (id, data) => api.put(`/sessions/${id}`, data),
  rescheduleSession: (id, data) => api.put(`/sessions/${id}/reschedule`, data),
  rateSession: (id, data) => api.post(`/sessions/${id}/rate`, data),
  getSessionStats: () => api.get('/sessions/stats'),
  getTutorAvailability: (tutorId, date) => api.get(`/sessions/availability/${tutorId}/${date}`),

  // Tutor-specific endpoints
  getTutorRequests: () => api.get('/sessions/tutor/requests'),
  getTutorSessions: (params = {}) => api.get('/sessions/tutor/sessions', { params }),
  getTutorStats: () => api.get('/sessions/tutor/stats'),
  updateSessionRequest: (requestId, updateData) => api.put(`/sessions/requests/${requestId}`, updateData),
};



// Video API calls
export const videoAPI = {
  createVideoRoom: (sessionId, options) => api.post(`/video/room/${sessionId}`, { options }),
  getVideoToken: (sessionId) => api.get(`/video/token/${sessionId}`),
  getVideoRoom: (sessionId) => api.get(`/video/room/${sessionId}`),
  deleteVideoRoom: (sessionId) => api.delete(`/video/room/${sessionId}`),
  getVideoStatus: () => api.get('/video/status')
};

// Rating API calls
export const ratingAPI = {
  createRating: (data) => api.post('/ratings', data),
  getTutorRatings: (tutorId, params) => api.get(`/ratings/tutor/${tutorId}`, { params }),
  getRatingById: (id) => api.get(`/ratings/${id}`),
  updateRating: (id, data) => api.put(`/ratings/${id}`, data),
  deleteRating: (id) => api.delete(`/ratings/${id}`),
  voteOnRating: (id, data) => api.post(`/ratings/${id}/vote`, data),
  removeVote: (id) => api.delete(`/ratings/${id}/vote`),
  addTutorResponse: (id, data) => api.post(`/ratings/${id}/response`, data),
  flagRating: (id, data) => api.post(`/ratings/${id}/flag`, data),
  getMyRatings: (params) => api.get('/ratings/my-ratings', { params })
};

// Admin API calls
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getPendingTutors: (params) => api.get('/admin/pending-tutors', { params }),
  approveTutor: (id, data) => api.put(`/admin/approve-tutor/${id}`, data),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getAllSessions: (params) => api.get('/admin/sessions', { params }),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data)
};

// Message API calls
export const messageAPI = {
  sendMessage: (data) => api.post('/messages', data),
  getSessionMessages: (sessionId, params) => api.get(`/messages/session/${sessionId}`, { params }),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
  getUnreadCount: () => api.get('/messages/unread-count')
};

// Notification API calls
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  getNotificationStats: () => api.get('/notifications/stats'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markMultipleAsRead: (data) => api.put('/notifications/mark-read', data),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  deleteMultipleNotifications: (data) => api.delete('/notifications/bulk-delete', { data }),
  createNotification: (data) => api.post('/notifications', data)
};




export default api;
