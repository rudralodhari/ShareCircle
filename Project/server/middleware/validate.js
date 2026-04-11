const { body } = require('express-validator');

const registerRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name must be less than 50 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const itemRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('transactionType')
    .isIn(['buy', 'sell', 'rent', 'borrow', 'share', 'exchange', 'donate'])
    .withMessage('Invalid transaction type'),
  body('category')
    .isIn(['Electronics', 'Furniture', 'Clothing', 'Books', 'Sports', 'Garden', 'Kitchen', 'Tools', 'Toys', 'Vehicles', 'Other'])
    .withMessage('Invalid category'),
  body('condition')
    .isIn(['new', 'like_new', 'good', 'fair', 'poor'])
    .withMessage('Invalid condition'),
];

module.exports = { registerRules, loginRules, itemRules };
