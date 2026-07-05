const Task = require('../models/Task');
const User = require('../models/User');

exports.getDashboard = async (req, res) => {
  const isAdminUser = req.user.role === 'admin';
  let query = {};
  if (!isAdminUser) query.assignedEmployee = req.user.id;

  const totalTasks = await Task.countDocuments(query);
  const completed = await Task.countDocuments({ ...query, status: 'Completed' });
  const pending = await Task.countDocuments({ ...query, status: 'Pending' });
  const inProgress = await Task.countDocuments({ ...query, status: 'In Progress' });
  const cancelled = await Task.countDocuments({ ...query, status: 'Cancelled' });
  const overdue = await Task.countDocuments({ ...query, dueDate: { $lt: new Date() }, status: { $ne: 'Completed' } });

  let totalEmployees = 0;
  let recentEmployees = [];
  if (isAdminUser) {
    totalEmployees = await User.countDocuments({ role: 'employee' });
    recentEmployees = await User.find({ role: 'employee' }).sort({ createdAt: -1 }).limit(5).select('-password');
  }

  const recentTasks = await Task.find(query)
    .populate('assignedEmployee', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  const stats = { totalTasks, completed, pending, inProgress, cancelled, overdue, totalEmployees };
  const chartData = { totalTasks, completed, pending, inProgress, cancelled };

  res.json({ stats, chartData, recentTasks, recentEmployees });
};