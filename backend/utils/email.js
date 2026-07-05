const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: config.EMAIL_USER, pass: config.EMAIL_PASS },
});

exports.sendEmail = async (to, subject, html) => {
  if (config.EMAIL_USER === 'test@example.com' || config.EMAIL_PASS === 'password') {
    console.log(`[EMAIL SKIPPED] To: ${to}, Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({ from: config.EMAIL_USER, to, subject, html });
};