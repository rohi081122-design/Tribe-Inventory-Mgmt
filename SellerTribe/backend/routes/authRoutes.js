// routes/authRoutes.js  ->  /api/auth/...

const express = require('express');
const { registerSeller, loginSeller, logoutSeller, getCurrentSeller } = require('../controllers/authController');
const { loadSellerIfLoggedIn } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/register', authLimiter, registerSeller);
router.post('/login', authLimiter, loginSeller);
router.post('/logout', logoutSeller);
router.get('/me', loadSellerIfLoggedIn, getCurrentSeller);

module.exports = router;
