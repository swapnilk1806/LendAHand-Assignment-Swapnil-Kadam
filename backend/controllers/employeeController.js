const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getEmployees = async (req, res) => {
  const { page = 1, limit = 10, search = '', sort = 'name' } = req.query;
  const query = search ? { name: { $regex: search, $options: 'i' } } : {};
  const total = await User.countDocuments({ ...query, role: 'employee' });
  const data = await User.find({ ...query, role: 'employee' })
    .sort({ [sort]: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .select('-password');
  res.json({ data, total, page: parseInt(page), limit: parseInt(limit) });
};

exports.getEmployeeById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'Employee not found' });
  res.json(user);
};

exports.createEmployee = async (req, res) => {
  const { name, email, password, department, designation, phone, joiningDate, status } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({
    name, email, password: hashed, department, designation, phone,
    joiningDate: joiningDate ? new Date(joiningDate) : undefined,
    status: status || 'active',
    role: 'employee',
    profileImage: req.file ? req.file.filename : undefined,
  });
  await user.save();
  res.status(201).json(user);
};

exports.updateEmployee = async (req, res) => {
  const updates = ['name', 'email', 'department', 'designation', 'phone', 'joiningDate', 'status'];
  const body = {};
  updates.forEach(k => { if (req.body[k] !== undefined) body[k] = req.body[k]; });
  if (req.file) body.profileImage = req.file.filename;
  if (req.body.password) body.password = await bcrypt.hash(req.body.password, 10);
  const user = await User.findByIdAndUpdate(req.params.id, body, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'Employee not found' });
  res.json(user);
};

exports.deleteEmployee = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'Employee not found' });
  res.json({ message: 'Employee deleted' });
};