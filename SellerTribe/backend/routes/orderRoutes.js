// routes/orderRoutes.js  ->  /api/orders/...
// A seller sees their own orders. Changing an order's status needs an APPROVED seller.

const express = require('express');
const { getSellerOrders, getDemand, updateOrderStatus } = require('../controllers/orderController');
const { protectSeller, requireApprovedSeller } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protectSeller);

router.get('/', getSellerOrders);
router.get('/demand', getDemand); // how many of each product to keep ready
router.patch('/:id/status', requireApprovedSeller, updateOrderStatus);

module.exports = router;
