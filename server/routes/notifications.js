const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markMultipleAsRead,
  markAllAsRead,
  deleteNotification,
  deleteMultipleNotifications,
  createNotification,
  getNotificationStats
} = require('../controllers/notificationController');
const { auth, adminAuth } = require('../middleware/auth');

// Validation middleware
const createNotificationValidation = [
  body('recipient').isMongoId().withMessage('Valid recipient ID is required'),
  body('title').notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('message').notEmpty().withMessage('Message is required')
    .isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters'),
  body('type').isIn([
    'session_request',
    'session_approved',
    'session_rejected',
    'session_cancelled',
    'session_reminder',
    'session_started',
    'session_completed',
    'new_message',
    'tutor_approved',
    'tutor_rejected',
    'rating_received',
    'payment_received',
    'payment_failed',
    'profile_updated',
    'system_announcement',
    'account_warning',
    'general'
  ]).withMessage('Invalid notification type'),
  body('category').isIn(['session', 'message', 'account', 'payment', 'system'])
    .withMessage('Invalid notification category'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('actionUrl').optional().isURL().withMessage('Action URL must be valid'),
  body('actionText').optional().isLength({ max: 50 })
    .withMessage('Action text cannot exceed 50 characters')
];

const notificationIdValidation = [
  param('id').isMongoId().withMessage('Valid notification ID is required')
];

const bulkOperationValidation = [
  body('notificationIds').isArray({ min: 1 })
    .withMessage('Notification IDs array is required and must not be empty'),
  body('notificationIds.*').isMongoId()
    .withMessage('All notification IDs must be valid')
];

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('unreadOnly').optional().isBoolean()
    .withMessage('unreadOnly must be a boolean'),
  query('category').optional().isIn(['session', 'message', 'account', 'payment', 'system'])
    .withMessage('Invalid category filter'),
  query('type').optional().isIn([
    'session_request',
    'session_approved',
    'session_rejected',
    'session_cancelled',
    'session_reminder',
    'session_started',
    'session_completed',
    'new_message',
    'tutor_approved',
    'tutor_rejected',
    'rating_received',
    'payment_received',
    'payment_failed',
    'profile_updated',
    'system_announcement',
    'account_warning',
    'general'
  ]).withMessage('Invalid type filter')
];

// @route   GET /api/notifications
// @desc    Get user notifications with pagination and filtering
// @access  Private
router.get('/', 
  auth, 
  paginationValidation, 
  getNotifications
);

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', 
  auth, 
  getUnreadCount
);

// @route   GET /api/notifications/stats
// @desc    Get notification statistics
// @access  Private
router.get('/stats', 
  auth, 
  getNotificationStats
);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', 
  auth, 
  notificationIdValidation, 
  markAsRead
);

// @route   PUT /api/notifications/mark-read
// @desc    Mark multiple notifications as read
// @access  Private
router.put('/mark-read', 
  auth, 
  bulkOperationValidation, 
  markMultipleAsRead
);

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', 
  auth, 
  markAllAsRead
);

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', 
  auth, 
  notificationIdValidation, 
  deleteNotification
);

// @route   DELETE /api/notifications/bulk-delete
// @desc    Delete multiple notifications
// @access  Private
router.delete('/bulk-delete', 
  auth, 
  bulkOperationValidation, 
  deleteMultipleNotifications
);

// @route   POST /api/notifications
// @desc    Create notification (Admin only)
// @access  Private (Admin)
router.post('/', 
  auth, 
  adminAuth, 
  createNotificationValidation, 
  createNotification
);

module.exports = router;
