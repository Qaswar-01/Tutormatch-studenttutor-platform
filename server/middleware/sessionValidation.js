const { body, param, query } = require('express-validator');

// Validation for creating a session
const createSessionValidation = [
  body('tutor')
    .isMongoId()
    .withMessage('Valid tutor ID is required'),
  
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Subject must be between 2 and 100 characters'),
  
  body('sessionDate')
    .isISO8601()
    .withMessage('Valid session date is required (YYYY-MM-DD)')
    .custom((value) => {
      const sessionDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (sessionDate < today) {
        throw new Error('Session date must be today or in the future');
      }
      
      // Check if date is not more than 3 months in the future
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 3);
      
      if (sessionDate > maxDate) {
        throw new Error('Session date cannot be more than 3 months in the future');
      }
      
      return true;
    }),
  
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid start time is required (HH:MM format)'),
  
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid end time is required (HH:MM format)')
    .custom((endTime, { req }) => {
      const startTime = req.body.startTime;
      if (startTime && endTime <= startTime) {
        throw new Error('End time must be after start time');
      }
      
      // Check minimum session duration (30 minutes)
      const start = new Date(`2000-01-01T${startTime}:00`);
      const end = new Date(`2000-01-01T${endTime}:00`);
      const durationMs = end - start;
      const durationMinutes = durationMs / (1000 * 60);
      
      if (durationMinutes < 30) {
        throw new Error('Session must be at least 30 minutes long');
      }
      
      // Check maximum session duration (4 hours)
      if (durationMinutes > 240) {
        throw new Error('Session cannot be longer than 4 hours');
      }
      
      return true;
    }),
  
  body('sessionType')
    .optional()
    .isIn(['online', 'in-person'])
    .withMessage('Session type must be either "online" or "in-person"'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('preferredPlatform')
    .optional()
    .isIn(['daily', 'zoom', 'meet', 'teams'])
    .withMessage('Preferred platform must be one of: daily, zoom, meet, teams')
];

// Validation for rating a session
const rateSessionValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  
  body('review')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review must be between 10 and 1000 characters'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value')
];

// Validation for rescheduling a session
const rescheduleValidation = [
  body('sessionDate')
    .isISO8601()
    .withMessage('Valid session date is required (YYYY-MM-DD)')
    .custom((value) => {
      const sessionDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (sessionDate < today) {
        throw new Error('New session date must be today or in the future');
      }
      
      return true;
    }),
  
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid start time is required (HH:MM format)'),
  
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid end time is required (HH:MM format)')
    .custom((endTime, { req }) => {
      const startTime = req.body.startTime;
      if (startTime && endTime <= startTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  
  body('reason')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Reason must be between 5 and 200 characters')
];

// Validation for updating session status
const updateSessionValidation = [
  body('status')
    .isIn(['pending', 'approved', 'rejected', 'cancelled', 'in-progress', 'completed'])
    .withMessage('Invalid session status'),
  
  body('rejectionReason')
    .if(body('status').equals('rejected'))
    .notEmpty()
    .withMessage('Rejection reason is required when rejecting a session')
    .isLength({ min: 10, max: 300 })
    .withMessage('Rejection reason must be between 10 and 300 characters'),
  
  body('meetingUrl')
    .optional()
    .isURL()
    .withMessage('Meeting URL must be a valid URL'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
];

// Validation for session query parameters
const sessionQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'cancelled', 'in-progress', 'completed', 'no-show'])
    .withMessage('Invalid status filter'),
  
  query('subject')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Subject filter must be between 2 and 100 characters'),
  
  query('sortBy')
    .optional()
    .isIn(['sessionDate', 'createdAt', 'totalCost', 'duration', 'status'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be "asc" or "desc"'),
  
  query('upcoming')
    .optional()
    .isBoolean()
    .withMessage('Upcoming filter must be a boolean')
];

// Validation for tutor availability parameters
const availabilityValidation = [
  param('tutorId')
    .isMongoId()
    .withMessage('Valid tutor ID is required'),
  
  param('date')
    .isISO8601()
    .withMessage('Valid date is required (YYYY-MM-DD)')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) {
        throw new Error('Date must be today or in the future');
      }
      
      // Check if date is not more than 2 months in the future
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 2);
      
      if (date > maxDate) {
        throw new Error('Date cannot be more than 2 months in the future');
      }
      
      return true;
    })
];

module.exports = {
  createSessionValidation,
  rateSessionValidation,
  rescheduleValidation,
  updateSessionValidation,
  sessionQueryValidation,
  availabilityValidation
};
