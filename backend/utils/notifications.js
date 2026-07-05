const Notification = require('../models/Notification');
const User = require('../models/User');
const Task = require('../models/Task');
const { sendEmail } = require('./email');

exports.createNotification = async (userId, message, type, taskId = null) => {
  try {
    const notif = new Notification({ user: userId, message, type, task: taskId });
    await notif.save();
    const user = await User.findById(userId);
    if (user) {
      await sendEmail(user.email, 'Notification', `<p>${message}</p>`);
    }
  } catch (error) {
    console.error('Failed to send notification email:', error.message);
  }
};

// Check due dates (hourly)
exports.checkDueDates = async () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tasks = await Task.find({ dueDate: { $lte: tomorrow, $gte: now }, status: { $ne: 'Completed' } });
  for (const task of tasks) {
    const diff = Math.ceil((task.dueDate - now) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      await exports.createNotification(task.assignedEmployee, `Task "${task.title}" is due tomorrow.`, 'due_tomorrow', task._id);
    } else if (diff < 1) {
      await exports.createNotification(task.assignedEmployee, `Task "${task.title}" is overdue.`, 'overdue', task._id);
    }
  }
};