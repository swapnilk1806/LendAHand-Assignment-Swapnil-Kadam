// config/index.js
const dotenv = require('dotenv');
dotenv.config();

// Explicitly define with a hardcoded fallback
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/employee-task-management';

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI,                              // <-- now always a string
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  EMAIL_USER: process.env.EMAIL_USER || 'test@example.com',
  EMAIL_PASS: process.env.EMAIL_PASS || 'password',
};