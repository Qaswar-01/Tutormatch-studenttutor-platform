const express = require('express');
const router = express.Router();
const {
  getPendingTutors,
  approveTutor,
  getAllUsers,
  getAllSessions,
  getAnalytics,
  updateUserStatus
} = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/auth');

// Apply admin authentication to all routes
router.use(auth, adminAuth);

// @route   GET /api/admin/pending-tutors
// @desc    Get pending tutors for approval
// @access  Private (Admin only)
router.get('/pending-tutors', getPendingTutors);

// @route   PUT /api/admin/approve-tutor/:id
// @desc    Approve or reject tutor application
// @access  Private (Admin only)
router.put('/approve-tutor/:id', approveTutor);

// @route   GET /api/admin/users
// @desc    Get all users with filtering
// @access  Private (Admin only)
router.get('/users', getAllUsers);

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Private (Admin only)
router.put('/users/:id/status', updateUserStatus);

// @route   GET /api/admin/sessions
// @desc    Get all sessions with filtering
// @access  Private (Admin only)
router.get('/sessions', getAllSessions);

// @route   GET /api/admin/analytics
// @desc    Get platform analytics and statistics
// @access  Private (Admin only)
router.get('/analytics', getAnalytics);

module.exports = router;
