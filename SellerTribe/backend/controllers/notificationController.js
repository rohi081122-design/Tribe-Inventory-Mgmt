const Notification = require('../models/Notification');
const { isValidObjectId } = require('../utils/validators');

const LATEST_COUNT = 20;

// @route  GET /api/notifications   -> the latest notifications and how many are unread
async function getMyNotifications(req, res) {
  const filter = { recipient: 'seller', seller: req.seller._id };
  const [notifications, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).limit(LATEST_COUNT),
    Notification.countDocuments({ ...filter, isRead: false }),
  ]);
  res.json({ success: true, notifications, unreadCount });
}

// @route  PATCH /api/notifications/read-all
async function markAllAsRead(req, res) {
  await Notification.updateMany({ recipient: 'seller', seller: req.seller._id, isRead: false }, { isRead: true });
  res.json({ success: true, unreadCount: 0 });
}

// @route  PATCH /api/notifications/:id/read
async function markAsRead(req, res) {
  if (isValidObjectId(req.params.id)) {
    await Notification.updateOne({ _id: req.params.id, recipient: 'seller', seller: req.seller._id }, { isRead: true });
  }
  const unreadCount = await Notification.countDocuments({ recipient: 'seller', seller: req.seller._id, isRead: false });
  res.json({ success: true, unreadCount });
}

module.exports = { getMyNotifications, markAllAsRead, markAsRead };
