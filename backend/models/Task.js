const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], default: 'Pending' },
  startDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attachment: String,
  comments: [{ text: String, user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, createdAt: Date }],
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);