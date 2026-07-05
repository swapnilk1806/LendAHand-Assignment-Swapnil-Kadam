const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

router.post('/', auth, uploadSingle('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ filename: req.file.filename });
});

module.exports = router;