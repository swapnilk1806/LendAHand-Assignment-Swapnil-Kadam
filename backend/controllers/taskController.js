const Task = require('../models/Task');
const { createNotification } = require('../utils/notifications');

exports.getTasks = async (req, res) => {
  const { page = 1, limit = 10, search = '', status = '', priority = '', sort = 'dueDate' } = req.query;
  const isAdminUser = req.user.role === 'admin';
  let query = {};
  if (!isAdminUser) query.assignedEmployee = req.user.id;
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (search) query.title = { $regex: search, $options: 'i' };

  const total = await Task.countDocuments(query);
  const data = await Task.find(query)
    .populate('assignedEmployee', 'name email')
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name')
    .sort({ [sort]: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  res.json({ data, total, page: parseInt(page), limit: parseInt(limit) });
};

exports.getTaskById = async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedEmployee', 'name email')
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name');
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (req.user.role !== 'admin' && task.assignedEmployee._id.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  res.json(task);
};

exports.createTask = async (req, res) => {
  const { title, description, priority, status, startDate, dueDate, assignedEmployee } = req.body;
  const task = new Task({
    title, description, priority: priority || 'Medium',
    status: status || 'Pending',
    startDate: new Date(startDate),
    dueDate: new Date(dueDate),
    assignedEmployee,
    createdBy: req.user.id,
    attachment: req.file ? req.file.filename : undefined,
  });
  await task.save();
  await createNotification(assignedEmployee, `Task "${title}" assigned to you.`, 'task_assigned', task._id);
  res.status(201).json(task);
};

exports.updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (task.status === 'Completed') return res.status(400).json({ message: 'Completed task cannot be edited' });
  if (req.user.role !== 'admin' && task.assignedEmployee.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const updates = ['title', 'description', 'priority', 'status', 'startDate', 'dueDate', 'assignedEmployee'];
  const body = {};
  updates.forEach(k => { if (req.body[k] !== undefined) body[k] = req.body[k]; });
  if (req.file) body.attachment = req.file.filename;
  if (body.startDate) body.startDate = new Date(body.startDate);
  if (body.dueDate) body.dueDate = new Date(body.dueDate);
  if (body.dueDate && body.startDate && new Date(body.dueDate) < new Date(body.startDate)) {
    return res.status(400).json({ message: 'Due date cannot be before start date' });
  }
  body.updatedBy = req.user.id;
  const updated = await Task.findByIdAndUpdate(req.params.id, body, { new: true })
    .populate('assignedEmployee', 'name email');
  if (body.status === 'Completed' && task.status !== 'Completed') {
    await createNotification(task.assignedEmployee, `Task "${task.title}" completed.`, 'task_completed', task._id);
  }
  res.json(updated);
};

exports.deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (req.user.role !== 'admin' && task.assignedEmployee.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  await task.deleteOne();
  res.json({ message: 'Task deleted' });
};