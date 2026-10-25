// middleware/authMiddleware.js
// protect            -> only lets logged-in buyers continue (reads the JWT from the HTTP-only cookie)
//                       Not used by any route yet - ready for future features such as orders.
// loadUserIfLoggedIn -> attaches the user when logged in, but never blocks the request

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AUTH_COOKIE_NAME, clearAuthCookie } = require('../utils/authCookie');
const { isValidObjectId } = require('../utils/validators');

// Reads the token cookie and returns the matching user from MongoDB (or null)
async function getUserFromCookie(req, res) {
  const token = req.cookies ? req.cookies[AUTH_COOKIE_NAME] : null;
  if (!token) {
    return null;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // Expired or tampered token: remove it so the browser stops sending it
    clearAuthCookie(res);
    return null;
  }

  if (!isValidObjectId(decoded.id)) {
    clearAuthCookie(res);
    return null;
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    clearAuthCookie(res);
  }
  return user;
}

async function protect(req, res, next) {
  const user = await getUserFromCookie(req, res);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Please log in to continue.' });
  }

  req.user = user;
  next();
}

async function loadUserIfLoggedIn(req, res, next) {
  req.user = await getUserFromCookie(req, res);
  next();
}

module.exports = { protect, loadUserIfLoggedIn };
