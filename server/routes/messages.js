const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  sendMessage,
  getSessionMessages,
  markMessageAsRead,
  getUnreadCount
} = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

// Validation middleware
const sendMessageValidation = [
  body('sessionId')
    .isMongoId()
    .withMessage('Valid session ID is required'),
  body('text')
    .notEmpty()
    .withMessage('Message text is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
    .trim()
];

const sessionIdValidation = [
  param('sessionId')
    .isMongoId()
    .withMessage('Valid session ID is required')
];

const messageIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid message ID is required')
];

// @route   POST /api/messages
// @desc    Send a message in a session
// @access  Private
router.post('/', auth, sendMessageValidation, sendMessage);

// @route   GET /api/messages/session/:sessionId
// @desc    Get messages for a session
// @access  Private
router.get('/session/:sessionId', auth, sessionIdValidation, getSessionMessages);

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', auth, messageIdValidation, markMessageAsRead);

// @route   GET /api/messages/unread-count
// @desc    Get unread message count for user
// @access  Private
router.get('/unread-count', auth, getUnreadCount);

module.exports = router;
