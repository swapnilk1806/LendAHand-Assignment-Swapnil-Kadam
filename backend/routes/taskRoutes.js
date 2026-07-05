const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { uploadSingle } = require('../middleware/upload');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

router.get('/', auth, getTasks);
router.get('/:id', auth, getTaskById);
router.post('/', auth, uploadSingle('attachment'), validate([
  body('title').notEmpty().withMessage('Title is required'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('dueDate').isISO8601().withMessage('Due date must be a valid date')
    .custom((value, { req }) => new Date(value) >= new Date(req.body.startDate))
    .withMessage('Due date cannot be before start date'),
  body('assignedEmployee').isMongoId().withMessage('Assigned employee must be a valid ID'),
]), createTask);
router.put('/:id', auth, uploadSingle('attachment'), updateTask);
router.delete('/:id', auth, deleteTask);

module.exports = router;