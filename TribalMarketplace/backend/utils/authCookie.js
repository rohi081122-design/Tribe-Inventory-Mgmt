// utils/authCookie.js
// Creates the JWT login token and stores it in an HTTP-only cookie.
// HTTP-only cookies cannot be read by JavaScript in the browser, which protects
// the token from being stolen by injected scripts (XSS).

const jwt = require('jsonwebtoken');

const AUTH_COOKIE_NAME = 'token';
const SESSION_DAYS = 7;

// Cookie settings that work for both local development and deployment.
// - Development: frontend (localhost:5173) and backend (localhost:5000) are the same "site",
//   so SameSite=Lax works over plain http.
// - Production: frontend and backend are usually on different domains, so the cookie must be
//   SameSite=None and Secure (https only). CSRF tokens protect these cross-site requests.
function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };
}

// Creates a signed token that only contains the user id.
// Everything else about the user is always read from the database, never from the token.
function createToken(userId) {
  return jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: `${SESSION_DAYS}d`,
  });
}

function setAuthCookie(res, userId) {
  res.cookie(AUTH_COOKIE_NAME, createToken(userId), {
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
