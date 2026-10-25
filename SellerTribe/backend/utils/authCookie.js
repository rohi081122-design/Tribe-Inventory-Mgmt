// utils/authCookie.js
// Creates the seller login token (JWT) and stores it in an HTTP-only cookie.
// HTTP-only cookies cannot be read by JavaScript in the browser, which protects
// the token from being stolen by injected scripts (XSS).
//
// The cookie is called "sellerToken" (not "token") because the marketplace also runs on
// localhost during development, and browsers share cookies between ports of the same host.
// Different names keep the buyer login and the seller login from overwriting each other.

const jwt = require('jsonwebtoken');

const AUTH_COOKIE_NAME = 'sellerToken';
const SESSION_DAYS = 7;

// Development: SameSite=Lax over http. Production (different domains): SameSite=None + Secure (https).
function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };
}

// The token only contains the seller id. Everything else is read from the database.
function createToken(sellerId) {
  return jwt.sign({ id: sellerId.toString() }, process.env.JWT_SECRET, {
    expiresIn: `${SESSION_DAYS}d`,
  });
}

function setAuthCookie(res, sellerId) {
  res.cookie(AUTH_COOKIE_NAME, createToken(sellerId), {
    ...getCookieOptions(),
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME, getCookieOptions());
}

module.exports = {
  AUTH_COOKIE_NAME,
  SESSION_DAYS,
  getCookieOptions,
  setAuthCookie,
  clearAuthCookie,
};
