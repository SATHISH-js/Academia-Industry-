const { body } = require('express-validator');

const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 120 })
    .withMessage('Name must be between 2 and 120 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8, max: 72 })
    .withMessage('Password must be between 8 and 72 characters long')
    .custom(value => Buffer.byteLength(value, 'utf8') <= 72)
    .withMessage('Password must be at most 72 bytes when encoded as UTF-8')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),

  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role selection is required')
    .isIn(['TRAINEE', 'TRAINER'])
    .withMessage('Role must be TRAINEE or TRAINER. Admin accounts are provisioned separately.'),

  body('phone')
    .optional({ nullable: true })
    .isString()
    .withMessage('Phone must be text')
    .trim()
    .isLength({ max: 25 })
    .withMessage('Phone must be at most 25 characters')
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const changePasswordValidator = [
  body('oldPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8, max: 72 })
    .withMessage('New password must be between 8 and 72 characters long')
    .custom(value => Buffer.byteLength(value, 'utf8') <= 72)
    .withMessage('New password must be at most 72 bytes when encoded as UTF-8')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('New password must contain at least one lowercase letter')
    .matches(/\d/)
    .withMessage('New password must contain at least one number')
];

const profileValidator = [
  body('name').optional().isString().trim().isLength({ min: 2, max: 120 })
    .withMessage('Name must be between 2 and 120 characters'),
  body('phone').optional({ nullable: true }).isString().trim().isLength({ max: 25 })
    .withMessage('Phone must be at most 25 characters'),
  body('avatar_url').optional({ nullable: true }).isString().isLength({ max: 255 })
    .withMessage('Avatar URL must be text no longer than 255 characters')
];

module.exports = {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  profileValidator
};
