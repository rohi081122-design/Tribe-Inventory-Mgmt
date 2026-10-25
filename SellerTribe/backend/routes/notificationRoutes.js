// routes/notificationRoutes.js  ->  /api/notifications/...
// The logged-in seller's notifications (new and cancelled orders).

const express = require('express');
const { getMyNotifications, markAllAsRead, markAsRead } = require('../controllers/notificationController');
const { protectSeller } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protectSeller);

router.get('/', getMyNotifications);
router.patch('/read-all', markAllAsRead); // must come before "/:id/read"
router.patch('/:id/read', markAsRead);

module.exports = router;
