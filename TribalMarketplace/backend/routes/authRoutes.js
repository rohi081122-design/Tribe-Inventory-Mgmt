// routes/authRoutes.js  ->  /api/auth/...

const express = require('express');
const { registerUser, loginUser, logoutUser, getCurrentUser } = require('../controllers/authController');
const { loadUserIfLoggedIn } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', logoutUser);
router.get('/me', loadUserIfLoggedIn, getCurrentUser);

module.exports = router;
