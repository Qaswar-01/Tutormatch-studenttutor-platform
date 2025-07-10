const express = require('express');
const router = express.Router();
const { param, body } = require('express-validator');
const {
  createVideoRoom,
  getVideoToken,
  deleteVideoRoom,
  getVideoRoom,
  getVideoStatus
} = require('../controllers/videoController');
const { auth, tutorAuth, adminAuth } = require('../middleware/auth');

// Validation middleware
const sessionIdValidation = [
  param('sessionId').isMongoId().withMessage('Valid session ID is required')
];

const createRoomValidation = [
  body('options').optional().isObject().withMessage('Options must be an object'),
  body('options.max_participants').optional().isInt({ min: 2, max: 10 }).withMessage('Max participants must be between 2 and 10'),
  body('options.enable_chat').optional().isBoolean().withMessage('Enable chat must be a boolean'),
  body('options.enable_screenshare').optional().isBoolean().withMessage('Enable screenshare must be a boolean'),
  body('options.enable_recording').optional().isBoolean().withMessage('Enable recording must be a boolean')
];

// @route   POST /api/video/room/:sessionId
// @desc    Create video room for session
// @access  Private (Tutor only)
router.post('/room/:sessionId', 
  auth, 
  tutorAuth, 
  sessionIdValidation, 
  createRoomValidation, 
  createVideoRoom
);

// @route   GET /api/video/token/:sessionId
// @desc    Get video room token for session
// @access  Private
router.get('/token/:sessionId', 
  auth, 
  sessionIdValidation, 
  getVideoToken
);

// @route   GET /api/video/room/:sessionId
// @desc    Get video room information
// @access  Private
router.get('/room/:sessionId', 
  auth, 
  sessionIdValidation, 
  getVideoRoom
);

// @route   DELETE /api/video/room/:sessionId
// @desc    Delete video room for session
// @access  Private (Tutor only)
router.delete('/room/:sessionId', 
  auth, 
  tutorAuth, 
  sessionIdValidation, 
  deleteVideoRoom
);

// @route   GET /api/video/status
// @desc    Get video service status
// @access  Private (Admin only)
router.get('/status', 
  auth, 
  adminAuth, 
  getVideoStatus
);

module.exports = router;
