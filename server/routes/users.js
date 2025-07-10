const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAccount,
  getUserById,
  toggleBookmark,
  getBookmarks
} = require('../controllers/userController');
const { auth, studentAuth } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const { validateProfileUpdate } = require('../middleware/validation');

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, validateProfileUpdate, updateProfile);

// @route   POST /api/users/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post('/upload-avatar', auth, upload.single('avatar'), handleMulterError, uploadAvatar);

// @route   DELETE /api/users/account
// @desc    Delete/deactivate user account
// @access  Private
router.delete('/account', auth, deleteAccount);

// @route   GET /api/users/bookmarks
// @desc    Get user's bookmarked tutors
// @access  Private (Student only)
router.get('/bookmarks', auth, studentAuth, getBookmarks);

// @route   POST /api/users/bookmark/:tutorId
// @desc    Bookmark/unbookmark a tutor
// @access  Private (Student only)
router.post('/bookmark/:tutorId', auth, studentAuth, toggleBookmark);

// @route   GET /api/users/:id
// @desc    Get user by ID (public profile)
// @access  Public
router.get('/:id', getUserById);

module.exports = router;
