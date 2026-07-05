const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { uploadSingle } = require('../middleware/upload');
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');

router.get('/', auth, isAdmin, getEmployees);
router.get('/:id', auth, isAdmin, getEmployeeById);
router.post('/', auth, isAdmin, uploadSingle('profileImage'), validate([
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email')
    .custom(async (email) => {
      const User = require('../models/User');
      const user = await User.findOne({ email });
      if (user) throw new Error('Email already in use');
    }),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
]), createEmployee);
router.put('/:id', auth, isAdmin, uploadSingle('profileImage'), updateEmployee);
router.delete('/:id', auth, isAdmin, deleteEmployee);

module.exports = router;