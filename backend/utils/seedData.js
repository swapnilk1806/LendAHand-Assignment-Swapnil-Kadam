const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { createNotification } = require('./notifications');

// ---------- Delete all existing data ----------
const clearAllData = async () => {
  console.log('🗑️ Clearing existing data...');
  await User.deleteMany({});
  await Task.deleteMany({});
  await Notification.deleteMany({});
  console.log('✅ All data cleared.');
};

// ---------- Insert sample data ----------
exports.insertSampleData = async (force = false) => {
  try {
    // If not forced, check if data exists and skip
    if (!force) {
      const userCount = await User.countDocuments();
      if (userCount > 0) {
        console.log('Sample data already exists. Skipping...');
        return;
      }
    } else {
      await clearAllData();
    }

    console.log('Inserting fresh sample data...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const empPassword = await bcrypt.hash('employee123', 10);

    // ---------- Create Admin ----------
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      department: 'Management',
      designation: 'System Administrator',
      phone: '123-456-7890',
      joiningDate: new Date('2023-01-01'),
      status: 'active',
    });
    await admin.save();

    // ---------- 8 Realistic Employees ----------
    const employeeData = [
      { name: 'John Smith', email: 'john.smith@company.com', department: 'Engineering', designation: 'Senior Developer', phone: '123-456-1001' },
      { name: 'Jane Johnson', email: 'jane.johnson@company.com', department: 'Marketing', designation: 'Marketing Manager', phone: '123-456-1002' },
      { name: 'Michael Williams', email: 'michael.williams@company.com', department: 'Sales', designation: 'Sales Executive', phone: '123-456-1003' },
      { name: 'Sarah Brown', email: 'sarah.brown@company.com', department: 'HR', designation: 'HR Coordinator', phone: '123-456-1004' },
      { name: 'David Jones', email: 'david.jones@company.com', department: 'Finance', designation: 'Financial Analyst', phone: '123-456-1005' },
      { name: 'Emma Garcia', email: 'emma.garcia@company.com', department: 'IT', designation: 'IT Support Specialist', phone: '123-456-1006' },
      { name: 'James Miller', email: 'james.miller@company.com', department: 'Operations', designation: 'Operations Manager', phone: '123-456-1007' },
      { name: 'Olivia Rodriguez', email: 'olivia.rodriguez@company.com', department: 'Design', designation: 'UI/UX Designer', phone: '123-456-1008' },
    ];

    const employees = [];
    for (const emp of employeeData) {
      const user = new User({
        name: emp.name,
        email: emp.email,
        password: empPassword,
        role: 'employee',
        department: emp.department,
        designation: emp.designation,
        phone: emp.phone,
        joiningDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        status: 'active',
      });
      await user.save();
      employees.push(user);
    }

    // ---------- 20 Realistic Tasks ----------
    const taskData = [
      { title: 'Complete project roadmap', description: 'Define milestones for Q3', priority: 'High', status: 'Pending' },
      { title: 'Design new landing page', description: 'Create mockups and prototypes', priority: 'Medium', status: 'In Progress' },
      { title: 'Fix login authentication bug', description: 'Resolve JWT expiration issue', priority: 'Urgent', status: 'In Progress' },
      { title: 'Prepare Q2 financial report', description: 'Compile revenue and expense data', priority: 'High', status: 'Completed' },
      { title: 'Update marketing materials', description: 'Refresh brochures and case studies', priority: 'Low', status: 'Pending' },
      { title: 'Implement SSO integration', description: 'Connect with Azure AD', priority: 'High', status: 'Pending' },
      { title: 'Conduct code review for sprint', description: 'Review team PRs', priority: 'Medium', status: 'In Progress' },
      { title: 'Plan team building event', description: 'Organize offsite for Q3', priority: 'Low', status: 'Pending' },
      { title: 'Optimize database queries', description: 'Improve response time', priority: 'High', status: 'Completed' },
      { title: 'Create user onboarding flow', description: 'Design email sequences and dashboard tour', priority: 'Medium', status: 'In Progress' },
      { title: 'Set up CI/CD pipeline', description: 'Automate deployment to staging', priority: 'High', status: 'Pending' },
      { title: 'Update privacy policy', description: 'Comply with new regulations', priority: 'Low', status: 'Completed' },
      { title: 'Migrate legacy data', description: 'Move old records to new schema', priority: 'Medium', status: 'Pending' },
      { title: 'Design mobile app screens', description: 'Create wireframes for iOS/Android', priority: 'High', status: 'In Progress' },
      { title: 'Implement push notifications', description: 'Use Firebase messaging', priority: 'Medium', status: 'Pending' },
      { title: 'Conduct security audit', description: 'Vulnerability assessment', priority: 'Urgent', status: 'Pending' },
      { title: 'Write API documentation', description: 'Swagger/OpenAPI specs', priority: 'Low', status: 'Completed' },
      { title: 'Improve dashboard performance', description: 'Lazy load charts and tables', priority: 'Medium', status: 'In Progress' },
      { title: 'Set up monitoring alerts', description: 'Configure Prometheus and Grafana', priority: 'High', status: 'Pending' },
      { title: 'Design corporate email templates', description: 'Newsletter and transactional emails', priority: 'Low', status: 'Pending' },
    ];

    const now = new Date();
    const tasks = [];
    for (let i = 0; i < taskData.length; i++) {
      const t = taskData[i];
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() + (i * 2) - 15);
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + (10 + (i % 15)));

      const task = new Task({
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        startDate,
        dueDate,
        assignedEmployee: employees[i % employees.length]._id,
        createdBy: admin._id,
        updatedBy: admin._id,
      });
      await task.save();
      tasks.push(task);
    }

    // ---------- Notifications ----------
    // Employee task assigned notifications
    for (const task of tasks) {
      await createNotification(task.assignedEmployee, `Task "${task.title}" assigned to you.`, 'task_assigned', task._id);
    }

    // Additional notifications for employees (completed, due soon, etc.)
    await createNotification(tasks[3].assignedEmployee, `Task "${tasks[3].title}" completed.`, 'task_completed', tasks[3]._id);
    await createNotification(tasks[8].assignedEmployee, `Task "${tasks[8].title}" completed.`, 'task_completed', tasks[8]._id);
    await createNotification(tasks[1].assignedEmployee, `Task "${tasks[1].title}" is due tomorrow.`, 'due_tomorrow', tasks[1]._id);
    await createNotification(tasks[5].assignedEmployee, `Task "${tasks[5].title}" is due in 2 days.`, 'due_tomorrow', tasks[5]._id);
    await createNotification(tasks[10].assignedEmployee, `Task "${tasks[10].title}" is overdue.`, 'overdue', tasks[10]._id);
    await createNotification(tasks[15].assignedEmployee, `Task "${tasks[15].title}" is overdue.`, 'overdue', tasks[15]._id);
    await createNotification(tasks[12].assignedEmployee, `Task "${tasks[12].title}" has been updated.`, 'task_updated', tasks[12]._id);
    await createNotification(tasks[18].assignedEmployee, `Task "${tasks[18].title}" has been updated.`, 'task_updated', tasks[18]._id);

    // Admin notifications
    await createNotification(admin._id, `You created task "${tasks[0].title}" and assigned it to ${employees[0].name}.`, 'task_assigned', tasks[0]._id);
    await createNotification(admin._id, `You created task "${tasks[4].title}" and assigned it to ${employees[4].name}.`, 'task_assigned', tasks[4]._id);
    await createNotification(admin._id, `Task "${tasks[3].title}" was completed by ${employees[3].name}.`, 'task_completed', tasks[3]._id);
    await createNotification(admin._id, `Task "${tasks[8].title}" was completed by ${employees[0].name}.`, 'task_completed', tasks[8]._id);
    await createNotification(admin._id, `Task "${tasks[1].title}" is due in 1 day.`, 'due_tomorrow', tasks[1]._id);
    await createNotification(admin._id, `Task "${tasks[10].title}" is overdue.`, 'overdue', tasks[10]._id);
    await createNotification(admin._id, 'Welcome to the Task Management System! You are logged in as Administrator.', 'task_assigned', null);
    await createNotification(admin._id, 'New employee John Doe was registered.', 'task_assigned', null);
    await createNotification(admin._id, 'Reminder: Monthly report is due in 2 days.', 'due_tomorrow', null);
    await createNotification(admin._id, 'System update: New features added to the dashboard.', 'task_assigned', null);
    await createNotification(admin._id, 'Three new employees onboarded this week.', 'task_assigned', null);
    await createNotification(admin._id, 'Security patch applied successfully.', 'task_assigned', null);

    console.log('✅ Sample data inserted successfully!');
    console.log(`Users: ${await User.countDocuments()}, Tasks: ${await Task.countDocuments()}, Notifications: ${await Notification.countDocuments()}`);
  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
  }
};