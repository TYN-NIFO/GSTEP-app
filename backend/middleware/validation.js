const { body, param, query, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { config } = require('../config/config');
const logger = require('../utils/logger');

// Rate limiting middleware
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.logSecurity('Rate Limit Exceeded', {
        ip: req.ip,
        url: req.url,
        userAgent: req.get('User-Agent'),
      });
      res.status(429).json({ message });
    },
  });
};

// Apply rate limiting to different routes
const authLimiter = createRateLimiter(
  config.rateLimit.windowMs,
  5,
  'Too many login attempts, please try again later'
);

const apiLimiter = createRateLimiter(
  config.rateLimit.windowMs,
  config.rateLimit.max,
  'Too many requests from this IP'
);

const uploadLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10,
  'Too many file uploads, please try again later'
);

// Validation rules
const userValidationRules = {
  register: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required')
      .custom((value) => {
        if (value.includes('@gct.ac.in')) {
          return true;
        }
        throw new Error('Students must use institutional email (@gct.ac.in)');
      }),
    
    body('password')
      .isLength({ min: config.security.passwordMinLength })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage(`Password must contain at least ${config.security.passwordMinLength} characters with uppercase, lowercase, digit, and special character`),
    
    body('role')
      .isIn(['student', 'placement_officer', 'placement_representative', 'staff'])
      .withMessage('Invalid role'),
  ],
  
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  
  profile: [
    body('profile.name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),
    
    body('profile.rollNumber')
      .optional()
      .trim()
      .isLength({ min: 1, max: 20 })
      .matches(/^[A-Z0-9]+$/)
      .withMessage('Roll number can only contain uppercase letters and numbers'),
    
    body('profile.personalEmail')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid personal email is required'),
    
    body('profile.collegeEmail')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid college email is required'),
    
    body('profile.tenthPercentage')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Tenth percentage must be between 0 and 100'),
    
    body('profile.twelfthPercentage')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Twelfth percentage must be between 0 and 100'),
    
    body('profile.cgpa')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('CGPA must be between 0 and 10'),
    
    body('profile.dateOfBirth')
      .optional()
      .isISO8601()
      .withMessage('Valid date of birth is required'),
    
    body('profile.gender')
      .optional()
      .isIn(['Male', 'Female', 'Other'])
      .withMessage('Gender must be Male, Female, or Other'),
  ],
  
  jobDrive: [
    body('companyName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Company name must be between 2 and 100 characters'),
    
    body('role')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Job role must be between 2 and 100 characters'),
    
    body('description')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Job description must be between 10 and 2000 characters'),
    
    body('date')
      .isISO8601()
      .withMessage('Valid date is required'),
    
    body('ctc')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('CTC must be a positive number'),
    
    body('eligibility.minCGPA')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('Minimum CGPA must be between 0 and 10'),
    
    body('eligibility.maxBacklogs')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Maximum backlogs must be a non-negative integer'),
    
    body('eligibility.allowedDepartments')
      .optional()
      .isArray({ max: 10 })
      .withMessage('Allowed departments must be an array with maximum 10 items'),
    
    body('eligibility.allowedDepartments.*')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Department name must be between 1 and 50 characters'),
  ],
  
  placementConsent: [
    body('hasAgreed')
      .isBoolean()
      .withMessage('hasAgreed must be a boolean value'),
    
    body('signature')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Signature must be between 1 and 1000 characters'),
  ],
  
  fileUpload: [
    body('file')
      .custom((value, { req }) => {
        if (!req.file) {
          throw new Error('No file uploaded');
        }
        
        const maxSize = config.upload.maxFileSize;
        if (req.file.size > maxSize) {
          throw new Error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
        }
        
        const allowedTypes = config.upload.allowedMimeTypes;
        if (!allowedTypes.includes(req.file.mimetype)) {
          throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
        }
        
        return true;
      }),
  ],
};

// Parameter validation rules
const paramValidationRules = {
  userId: [
    param('userId')
      .isMongoId()
      .withMessage('Invalid user ID format'),
  ],
  
  jobDriveId: [
    param('id')
      .isMongoId()
      .withMessage('Invalid job drive ID format'),
  ],
  
  page: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: config.api.pagination.maxPageSize })
      .withMessage(`Limit must be between 1 and ${config.api.pagination.maxPageSize}`),
  ],
};

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value,
      location: error.location,
    }));
    
    logger.logSecurity('Validation Error', {
      url: req.url,
      method: req.method,
      ip: req.ip,
      errors: errorDetails,
    });
    
    return res.status(400).json({
      message: 'Validation failed',
      errors: errorDetails,
    });
  }
  
  next();
};

// Sanitize input middleware
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj, depth = 0) => {
    if (depth > config.validation.maxObjectDepth) {
      throw new Error('Object depth exceeds maximum allowed');
    }
    
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    const sanitized = Array.isArray(obj) ? [] : {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Remove potentially dangerous characters and trim
        sanitized[key] = value
          .replace(/[<>]/g, '') // Remove < and >
          .replace(/javascript:/gi, '') // Remove javascript: protocol
          .replace(/data:/gi, '') // Remove data: protocol
          .trim();
        
        // Check string length
        if (sanitized[key].length > config.validation.maxStringLength) {
          throw new Error(`String length exceeds maximum allowed (${config.validation.maxStringLength})`);
        }
      } else if (Array.isArray(value)) {
        // Check array length
        if (value.length > config.validation.maxArrayLength) {
          throw new Error(`Array length exceeds maximum allowed (${config.validation.maxArrayLength})`);
        }
        sanitized[key] = sanitize(value, depth + 1);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitize(value, depth + 1);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  };
  
  try {
    req.body = sanitize(req.body);
    req.query = sanitize(req.query);
    next();
  } catch (error) {
    logger.logSecurity('Sanitization Error', {
      url: req.url,
      method: req.method,
      ip: req.ip,
      error: error.message,
    });
    
    return res.status(400).json({
      message: 'Input sanitization failed',
      error: error.message,
    });
  }
};

// Custom validation helpers
const validateObjectId = (value) => {
  const mongoose = require('mongoose');
  return mongoose.Types.ObjectId.isValid(value);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

module.exports = {
  authLimiter,
  apiLimiter,
  uploadLimiter,
  userValidationRules,
  paramValidationRules,
  validate,
  sanitizeInput,
  validateObjectId,
  validateEmail,
  validatePhone,
}; 