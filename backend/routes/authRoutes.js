const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { validate } = require('../middleware/validation');
const { register, login, logout, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', validate([
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email')
    .custom(async (email) => {
      const User = require('../models/User');
      const user = await User.findOne({ email });
      if (user) throw new Error('Email already in use');
    }),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Must contain uppercase')
    .matches(/[a-z]/).withMessage('Must contain lowercase')
    .matches(/[0-9]/).withMessage('Must contain a number'),
  body('confirmPassword').custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  body('role').isIn(['admin', 'employee']).withMessage('Invalid role'),
]), register);

router.post('/login', validate([
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
]), login);

router.post('/logout', auth, logout);
router.get('/me', auth, getMe);

module.exports = router;