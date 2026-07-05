const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const {
  getCompletedTasks,
  getPendingTasks,
  getEmployeeWiseTasks,
  exportExcel,
  exportCSV
} = require('../controllers/reportController');

router.get('/completed', auth, isAdmin, getCompletedTasks);
router.get('/pending', auth, isAdmin, getPendingTasks);
router.get('/employee', auth, isAdmin, getEmployeeWiseTasks);
router.get('/export/excel', auth, isAdmin, exportExcel);
router.get('/export/csv', auth, isAdmin, exportCSV);

module.exports = router;