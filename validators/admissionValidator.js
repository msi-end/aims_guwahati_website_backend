const { check, validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

exports.validateAdmission = [
  check('fullName').notEmpty().withMessage('Full name is required'),
  check('email').isEmail().withMessage('Provide a valid email address'),
  check('phoneNumber').isLength({ min: 10, max: 15 }).withMessage('Invalid phone number'),
  check('course').notEmpty().withMessage('Course selection is required'),
  check('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
  check('category').isIn(['General', 'OBC', 'SC', 'ST']).withMessage('Invalid category'),
  check('fatherName').notEmpty().withMessage('Father name is required'),
  check('addressLine1').notEmpty().withMessage('Address is required'),
  check('state').notEmpty().withMessage('State is required'),
  check('district').notEmpty().withMessage('District is required'),
  check('pinCode').isNumeric().withMessage('Pin code must be numeric'),
  
  // Middleware to catch errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, "Validation Error", errors.array(), 400);
    }
    next();
  }
];