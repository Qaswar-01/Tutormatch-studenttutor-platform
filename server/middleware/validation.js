const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .isIn(['student', 'tutor'])
    .withMessage('Role must be either student or tutor'),
  
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio must not exceed 1000 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  handleValidationErrors
];

// Tutor profile validation
const validateTutorProfile = [
  body('subjects')
    .isArray({ min: 1 })
    .withMessage('At least one subject is required'),
  
  body('subjects.*')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Each subject must be between 2 and 50 characters'),
  
  body('qualifications')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Qualifications must be between 10 and 1000 characters'),
  
  body('experience')
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience must be a number between 0 and 50'),
  
  body('hourlyRate')
    .isFloat({ min: 5, max: 500 })
    .withMessage('Hourly rate must be between $5 and $500'),
  
  body('city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  
  handleValidationErrors
];

// Session booking validation
const validateSessionBooking = [
  body('tutorId')
    .isMongoId()
    .withMessage('Valid tutor ID is required'),
  
  body('subject')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Subject must be between 2 and 100 characters'),
  
  body('preferredDate')
    .isISO8601()
    .withMessage('Valid date is required'),
  
  body('duration')
    .isInt({ min: 30, max: 180 })
    .withMessage('Duration must be between 30 and 180 minutes'),
  
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message must not exceed 500 characters'),
  
  handleValidationErrors
];

// Message validation
const validateMessage = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters'),
  
  body('sessionId')
    .isMongoId()
    .withMessage('Valid session ID is required'),
  
  handleValidationErrors
];

// Rating validation
const validateRating = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment must not exceed 500 characters'),
  
  body('sessionId')
    .isMongoId()
    .withMessage('Valid session ID is required'),
  
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validateTutorProfile,
  validateSessionBooking,
  validateMessage,
  validateRating,
  handleValidationErrors
};
