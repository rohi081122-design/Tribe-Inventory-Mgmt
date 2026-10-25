// routes/adminRoutes.js  ->  /api/admin/...
// Pages for the Tribal Marketplace team: approve sellers or remove their access, see orders and
// notifications, and answer customer queries from the Contact Us page.

const express = require('express');
const {
  adminLogin,
  adminLogout,
  getAdminStatus,
  listSellers,
  setSellerApproval,
  listOrders,
  listNotifications,
  markNotificationsRead,
} = require('../controllers/adminController');
const { listQueries, resolveQuery, reopenQuery } = require('../controllers/queryController');
const { protectAdmin } = require('../middleware/adminMiddleware');
const { authLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/login', authLimiter, adminLogin);
router.post('/logout', adminLogout);
router.get('/me', getAdminStatus);

router.get('/sellers', protectAdmin, listSellers);
router.patch('/sellers/:id/approval', protectAdmin, setSellerApproval);
router.get('/orders', protectAdmin, listOrders);
router.get('/notifications', protectAdmin, listNotifications);
router.patch('/notifications/read-all', protectAdmin, markNotificationsRead);

// Customer queries from the marketplace Contact Us page
router.get('/queries', protectAdmin, listQueries);
router.patch('/queries/:id/resolve', protectAdmin, resolveQuery);
router.patch('/queries/:id/reopen', protectAdmin, reopenQuery);

module.exports = router;
