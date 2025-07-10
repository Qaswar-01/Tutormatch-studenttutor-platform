const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createSession,
  getUserSessions,
  getSessionById,
  updateSession,
  rateSession,
  getTutorAvailability,
  getSessionStats,
  rescheduleSession,
  getTutorRequests,
  getTutorSessions,
  getTutorStats,
  updateSessionRequest
} = require('../controllers/sessionController');
const { auth, studentAuth, tutorAuth } = require('../middleware/auth');

// Validation middleware
const createSessionValidation = [
  body('tutor').isMongoId().withMessage('Valid tutor ID is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('sessionDate').isISO8601().withMessage('Valid session date is required'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required (HH:MM)'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required (HH:MM)'),
  body('sessionType').optional().isIn(['online', 'in-person']).withMessage('Session type must be online or in-person'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  body('preferredPlatform').optional().isIn(['daily', 'zoom', 'meet']).withMessage('Invalid platform')
];

const rateSessionValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().isLength({ max: 1000 }).withMessage('Review must not exceed 1000 characters'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
];

const rescheduleValidation = [
  body('sessionDate').isISO8601().withMessage('Valid session date is required'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required (HH:MM)'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required (HH:MM)'),
  body('reason').optional().isLength({ max: 200 }).withMessage('Reason must not exceed 200 characters')
];

// @route   POST /api/sessions
// @desc    Create a new session request
// @access  Private (Student only)
router.post('/', auth, studentAuth, createSessionValidation, createSession);

// @route   GET /api/sessions
// @desc    Get user sessions with filtering
// @access  Private
router.get('/', auth, getUserSessions);

// @route   GET /api/sessions/stats
// @desc    Get session statistics for dashboard
// @access  Private
router.get('/stats', auth, getSessionStats);

// @route   GET /api/sessions/availability/:tutorId/:date
// @desc    Get tutor's availability for a specific date
// @access  Public
router.get('/availability/:tutorId/:date', getTutorAvailability);

// @route   GET /api/sessions/:id
// @desc    Get session by ID
// @access  Private
router.get('/:id', auth, getSessionById);

// @route   PUT /api/sessions/:id
// @desc    Update session status (approve, reject, cancel, etc.)
// @access  Private
router.put('/:id', auth, updateSession);

// @route   PUT /api/sessions/:id/reschedule
// @desc    Reschedule a session
// @access  Private
router.put('/:id/reschedule', auth, rescheduleValidation, rescheduleSession);

// @route   POST /api/sessions/:id/rate
// @desc    Rate and review a completed session
// @access  Private (Student only)
router.post('/:id/rate', auth, studentAuth, rateSessionValidation, rateSession);

// Tutor-specific routes
// @route   GET /api/sessions/tutor/requests
// @desc    Get pending session requests for tutor
// @access  Private (Tutor only)
router.get('/tutor/requests', auth, tutorAuth, getTutorRequests);

// @route   GET /api/sessions/tutor/sessions
// @desc    Get tutor's sessions with filtering
// @access  Private (Tutor only)
router.get('/tutor/sessions', auth, tutorAuth, getTutorSessions);

// @route   GET /api/sessions/tutor/stats
// @desc    Get tutor's session statistics
// @access  Private (Tutor only)
router.get('/tutor/stats', auth, tutorAuth, getTutorStats);

// @route   PUT /api/sessions/requests/:id
// @desc    Update session request status (approve/reject)
// @access  Private (Tutor only)
router.put('/requests/:id', auth, tutorAuth, updateSessionRequest);

module.exports = router;
