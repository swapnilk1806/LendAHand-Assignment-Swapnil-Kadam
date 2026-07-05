const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  const notifs = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
  const unread = notifs.filter(n => !n.read).length;
  res.json({ data: notifs, unread });
};

exports.markNotificationRead = async (req, res) => {
  const notif = await Notification.findById(req.params.id);
  if (!notif) return res.status(404).json({ message: 'Notification not found' });
  if (notif.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
  notif.read = true;
  await notif.save();
  res.json(notif);
};