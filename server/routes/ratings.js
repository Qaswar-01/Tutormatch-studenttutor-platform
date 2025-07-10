const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const {
  createRating,
  getTutorRatings,
  getRatingById,
  updateRating,
  deleteRating,
  voteOnRating,
  removeVoteFromRating,
  addTutorResponse,
  flagRating,
  getMyRatings,
  fixRatingComments
} = require('../controllers/ratingController');
const { auth, studentAuth, tutorAuth } = require('../middleware/auth');

// Validation middleware
const createRatingValidation = [
  body('sessionId').isMongoId().withMessage('Valid session ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
  body('detailedRatings').optional().isObject().withMessage('Detailed ratings must be an object'),
  body('detailedRatings.communication').optional().isInt({ min: 1, max: 5 }).withMessage('Communication rating must be between 1 and 5'),
  body('detailedRatings.knowledge').optional().isInt({ min: 1, max: 5 }).withMessage('Knowledge rating must be between 1 and 5'),
  body('detailedRatings.punctuality').optional().isInt({ min: 1, max: 5 }).withMessage('Punctuality rating must be between 1 and 5'),
  body('detailedRatings.helpfulness').optional().isInt({ min: 1, max: 5 }).withMessage('Helpfulness rating must be between 1 and 5'),
  body('detailedRatings.overall').optional().isInt({ min: 1, max: 5 }).withMessage('Overall rating must be between 1 and 5'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
];

const updateRatingValidation = [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
  body('detailedRatings').optional().isObject().withMessage('Detailed ratings must be an object'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
];

const ratingIdValidation = [
  param('id').isMongoId().withMessage('Valid rating ID is required')
];

const tutorIdValidation = [
  param('tutorId').isMongoId().withMessage('Valid tutor ID is required')
];

const voteValidation = [
  body('isHelpful').isBoolean().withMessage('isHelpful must be a boolean')
];

const responseValidation = [
  body('response').notEmpty().withMessage('Response is required')
    .isLength({ min: 1, max: 500 }).withMessage('Response must be between 1 and 500 characters')
];

const flagValidation = [
  body('reason').isIn(['inappropriate', 'spam', 'fake', 'offensive', 'other'])
    .withMessage('Valid reason is required')
];

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sortBy').optional().isIn(['createdAt', 'rating', 'helpfulScore']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('minRating').optional().isInt({ min: 1, max: 5 }).withMessage('Min rating must be between 1 and 5'),
  query('maxRating').optional().isInt({ min: 1, max: 5 }).withMessage('Max rating must be between 1 and 5')
];

// @route   POST /api/ratings
// @desc    Create a rating for a completed session
// @access  Private (Student only)
router.post('/', 
  auth, 
  studentAuth, 
  createRatingValidation, 
  createRating
);

// @route   GET /api/ratings/tutor/:tutorId
// @desc    Get ratings for a tutor
// @access  Public
router.get('/tutor/:tutorId', 
  tutorIdValidation, 
  paginationValidation, 
  getTutorRatings
);

// @route   GET /api/ratings/my-ratings
// @desc    Get user's ratings (as student)
// @access  Private
router.get('/my-ratings', 
  auth, 
  paginationValidation, 
  getMyRatings
);

// @route   GET /api/ratings/:id
// @desc    Get rating by ID
// @access  Public (with access control)
router.get('/:id', 
  ratingIdValidation, 
  getRatingById
);

// @route   PUT /api/ratings/:id
// @desc    Update rating
// @access  Private (Student who created the rating)
router.put('/:id', 
  auth, 
  studentAuth, 
  ratingIdValidation, 
  updateRatingValidation, 
  updateRating
);

// @route   DELETE /api/ratings/:id
// @desc    Delete rating
// @access  Private (Student who created the rating or Admin)
router.delete('/:id', 
  auth, 
  ratingIdValidation, 
  deleteRating
);

// @route   POST /api/ratings/:id/vote
// @desc    Add helpful vote to rating
// @access  Private
router.post('/:id/vote', 
  auth, 
  ratingIdValidation, 
  voteValidation, 
  voteOnRating
);

// @route   DELETE /api/ratings/:id/vote
// @desc    Remove vote from rating
// @access  Private
router.delete('/:id/vote', 
  auth, 
  ratingIdValidation, 
  removeVoteFromRating
);

// @route   POST /api/ratings/:id/response
// @desc    Add tutor response to rating
// @access  Private (Tutor only)
router.post('/:id/response', 
  auth, 
  tutorAuth, 
  ratingIdValidation, 
  responseValidation, 
  addTutorResponse
);

// @route   POST /api/ratings/:id/flag
// @desc    Flag rating for review
// @access  Private
router.post('/:id/flag',
  auth,
  ratingIdValidation,
  flagValidation,
  flagRating
);

// @route   POST /api/ratings/fix-comments
// @desc    Fix existing ratings with missing comments
// @access  Private
router.post('/fix-comments',
  auth,
  fixRatingComments
);

module.exports = router;
