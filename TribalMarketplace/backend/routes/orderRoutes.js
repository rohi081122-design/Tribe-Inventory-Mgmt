// routes/orderRoutes.js  ->  /api/orders/...
// Everything except the fee rules, the place list and the delivery estimate needs a logged-in buyer.

const express = require('express');
const {
  getFeeRules,
  getPlaces,
  getDeliveryEstimate,
  getQuote,
  placeOrder,
  getMyOrders,
  getMyOrder,
  cancelMyOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/fee-rules', getFeeRules);
router.get('/places', getPlaces);
router.get('/delivery-estimate', getDeliveryEstimate);

router.post('/quote', protect, getQuote);
router.post('/', protect, placeOrder);
router.get('/mine', protect, getMyOrders); // must come before "/:id"
router.get('/:id', protect, getMyOrder);
router.post('/:id/cancel', protect, cancelMyOrder);

module.exports = router;
