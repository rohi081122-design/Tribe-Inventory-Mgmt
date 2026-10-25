// utils/adminAuth.js
// Login for the Tribal Marketplace TEAM (admin), who approve sellers on the /admin page.
// The team logs in with ADMIN_PASSWORD from backend/.env. After login, a separate
// HTTP-only cookie ("sellerTribeAdmin") is set, so the admin login never mixes with a seller login.

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { getCookieOptions } = require('./authCookie');

const ADMIN_COOKIE_NAME = 'sellerTribeAdmin';
const ADMIN_SESSION_HOURS = 12;
const MIN_ADMIN_PASSWORD_LENGTH = 10;

function isAdminPasswordConfigured() {
  const password = process.env.ADMIN_PASSWORD;
  return Boolean(password) && !password.startsWith('PASTE_') && password.length >= MIN_ADMIN_PASSWORD_LENGTH;
}

// Compares the typed password with ADMIN_PASSWORD in constant time
// (both are hashed first, so the lengths are always equal)
function isCorrectAdminPassword(typedPassword) {
  if (!isAdminPasswordConfigured() || typeof typedPassword !== 'string') {
    return false;
  }
  const typedHash = crypto.createHash('sha256').update(typedPassword).digest();
  const realHash = crypto.createHash('sha256').update(process.env.ADMIN_PASSWORD).digest();
  return crypto.timingSafeEqual(typedHash, realHash);
}

function setAdminCookie(res) {
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: `${ADMIN_SESSION_HOURS}h` });
  res.cookie(ADMIN_COOKIE_NAME, token, {
    ...getCookieOptions(),
    maxAge: ADMIN_SESSION_HOURS * 60 * 60 * 1000,
  });
}

function clearAdminCookie(res) {
  res.clearCookie(ADMIN_COOKIE_NAME, getCookieOptions());
}

// true when the request carries a valid admin cookie
function isAdminRequest(req) {
  const token = req.cookies ? req.cookies[ADMIN_COOKIE_NAME] : null;
  if (!token) {
    return false;
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET).role === 'admin';
  } catch {
    return false;
  }
}

module.exports = {
  MIN_ADMIN_PASSWORD_LENGTH,
  isAdminPasswordConfigured,
  isCorrectAdminPassword,
  setAdminCookie,
  clearAdminCookie,
  isAdminRequest,
};
