const Task = require('../models/Task');
const User = require('../models/User');
const ExcelJS = require('exceljs');
const csvWriter = require('csv-writer');
const fs = require('fs');

exports.getCompletedTasks = async (req, res) => {
  const tasks = await Task.find({ status: 'Completed' }).populate('assignedEmployee', 'name');
  res.json(tasks);
};

exports.getPendingTasks = async (req, res) => {
  const tasks = await Task.find({ status: { $in: ['Pending', 'In Progress'] } }).populate('assignedEmployee', 'name');
  res.json(tasks);
};

exports.getEmployeeWiseTasks = async (req, res) => {
  const employees = await User.find({ role: 'employee' });
  const result = await Promise.all(employees.map(async emp => {
    const count = await Task.countDocuments({ assignedEmployee: emp._id });
    return { _id: emp._id, name: emp.name, taskCount: count };
  }));
  res.json(result);
};

exports.exportExcel = async (req, res) => {
  const tasks = await Task.find().populate('assignedEmployee', 'name');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Tasks');
  worksheet.columns = [
    { header: 'Title', key: 'title' },
    { header: 'Status', key: 'status' },
    { header: 'Priority', key: 'priority' },
    { header: 'Assigned To', key: 'assigned' },
    { header: 'Due Date', key: 'dueDate' },
  ];
  tasks.forEach(t => {
    worksheet.addRow({
      title: t.title,
      status: t.status,
      priority: t.priority,
      assigned: t.assignedEmployee?.name || 'Unassigned',
      dueDate: t.dueDate.toISOString().split('T')[0],
    });
  });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');
  await workbook.xlsx.write(res);
  res.end();
};

exports.exportCSV = async (req, res) => {
  const tasks = await Task.find().populate('assignedEmployee', 'name');
  const createCsvWriter = csvWriter.createObjectCsvWriter;
  const writer = createCsvWriter({
    path: 'temp.csv',
    header: [
      { id: 'title', title: 'Title' },
      { id: 'status', title: 'Status' },
      { id: 'priority', title: 'Priority' },
      { id: 'assigned', title: 'Assigned To' },
      { id: 'dueDate', title: 'Due Date' },
    ]
  });
  const records = tasks.map(t => ({
    title: t.title,
    status: t.status,
    priority: t.priority,
    assigned: t.assignedEmployee?.name || 'Unassigned',
    dueDate: t.dueDate.toISOString().split('T')[0],
  }));
  await writer.writeRecords(records);
  res.download('temp.csv', 'report.csv', () => fs.unlinkSync('temp.csv'));
};