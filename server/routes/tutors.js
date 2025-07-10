const express = require('express');
const router = express.Router();
const {
  getAllTutors,
  searchTutors,
  getTutorById,
  updateAvailability,
  getTutorStats
} = require('../controllers/tutorController');
const { auth, tutorAuth } = require('../middleware/auth');

// @route   GET /api/tutors
// @desc    Get all tutors with filtering
// @access  Public
router.get('/', getAllTutors);

// @route   GET /api/tutors/search
// @desc    Search tutors with advanced filtering
// @access  Public
router.get('/search', searchTutors);

// @route   PUT /api/tutors/availability
// @desc    Update tutor availability
// @access  Private (Tutor only)
router.put('/availability', auth, tutorAuth, updateAvailability);

// @route   GET /api/tutors/:id
// @desc    Get tutor by ID
// @access  Public
router.get('/:id', getTutorById);

// @route   GET /api/tutors/:id/stats
// @desc    Get tutor statistics
// @access  Public
router.get('/:id/stats', getTutorStats);

module.exports = router;
