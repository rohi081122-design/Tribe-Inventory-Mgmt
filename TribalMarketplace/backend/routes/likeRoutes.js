// routes/likeRoutes.js  ->  /api/likes/...
// The logged-in buyer's like list (❤️). Every route needs a logged-in buyer.

const express = require('express');
const { getMyLikes, likeProduct, unlikeProduct } = require('../controllers/likeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getMyLikes);
router.post('/:productId', likeProduct);
router.delete('/:productId', unlikeProduct);

module.exports = router;
