import { body, validationResult } from 'express-validator';

// Helper function to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

// User registration validation
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('role')
    .isIn(['student', 'faculty', 'staff', 'organizer', 'admin'])
    .withMessage('Please provide a valid role'),

  // Conditional validations based on role
  body('department')
    .if(body('role').isIn(['student', 'faculty']))
    .notEmpty()
    .withMessage('Department is required for students and faculty'),

  body('studentId')
    .if(body('role').equals('student'))
    .notEmpty()
    .withMessage('Student ID is required for students')
    .isAlphanumeric()
    .withMessage('Student ID must be alphanumeric'),

  body('teacherId')
    .if(body('role').equals('faculty'))
    .notEmpty()
    .withMessage('Teacher ID is required for faculty')
    .isAlphanumeric()
    .withMessage('Teacher ID must be alphanumeric'),

  body('staffId')
    .if(body('role').equals('staff'))
    .notEmpty()
    .withMessage('Staff ID is required for staff members')
    .isAlphanumeric()
    .withMessage('Staff ID must be alphanumeric'),

  body('organizationName')
    .if(body('role').equals('organizer'))
    .notEmpty()
    .withMessage('Organization name is required for organizers'),

  body('organizationCode')
    .if(body('role').equals('organizer'))
    .notEmpty()
    .withMessage('Organization code is required for organizers'),

  handleValidationErrors
];

// User login validation
export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

// Event creation validation
export const validateEventCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Event title must be between 3 and 100 characters'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Event description must be between 10 and 1000 characters'),

  body('category')
    .isIn(['Technology', 'Sports', 'Cultural', 'Workshop', 'Competition', 'Seminar', 'Conference', 'Social', 'Academic', 'Other'])
    .withMessage('Please select a valid category'),

  body('date')
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value <= new Date()) {
        throw new Error('Event date must be in the future');
      }
      return true;
    }),

  body('time')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide valid time in HH:MM format'),

  body('location')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Location must be between 3 and 100 characters'),

  body('maxAttendees')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Maximum attendees must be between 1 and 10000'),

  body('registrationDeadline')
    .isISO8601()
    .toDate()
    .custom((value, { req }) => {
      if (value >= new Date(req.body.date)) {
        throw new Error('Registration deadline must be before event date');
      }
      return true;
    }),

  handleValidationErrors
];

// Event update validation
export const validateEventUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Event title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Event description must be between 10 and 1000 characters'),

  body('category')
    .optional()
    .isIn(['Technology', 'Sports', 'Cultural', 'Workshop', 'Competition', 'Seminar', 'Conference', 'Social', 'Academic', 'Other'])
    .withMessage('Please select a valid category'),

  body('location')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Location must be between 3 and 100 characters'),

  body('maxAttendees')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Maximum attendees must be between 1 and 10000'),

  handleValidationErrors
];

// Organization creation validation
export const validateOrganizationCreation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Organization name must be between 3 and 100 characters'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Organization description must be between 10 and 1000 characters'),

  body('type')
    .isIn(['Academic Club', 'Sports Club', 'Cultural Club', 'Technical Club', 'Social Club', 'Professional Society', 'Student Government', 'Volunteer Organization', 'Special Interest Group', 'Other'])
    .withMessage('Please select a valid organization type'),

  body('category')
    .isIn(['Technology', 'Arts & Culture', 'Sports & Recreation', 'Academic', 'Social Service', 'Professional Development', 'Religion & Spirituality', 'Environment', 'Health & Wellness', 'Other'])
    .withMessage('Please select a valid category'),

  body('contact.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid contact email'),

  body('founded')
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value > new Date()) {
        throw new Error('Founded date cannot be in the future');
      }
      return true;
    }),

  body('faculty.advisor.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Faculty advisor name must be between 2 and 50 characters'),

  body('faculty.advisor.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid faculty advisor email'),

  handleValidationErrors
];

// Profile update validation
export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),

  handleValidationErrors
];

// Password change validation
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),

  handleValidationErrors
];

// Feedback validation
export const validateFeedback = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),

  handleValidationErrors
];