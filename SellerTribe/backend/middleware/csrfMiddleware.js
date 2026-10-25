// middleware/csrfMiddleware.js
// CSRF protection using the "double submit" pattern.
//
// Why? The login token lives in a cookie, and browsers attach cookies automatically.
// A malicious website could try to make the browser send a request to our API.
//
// How it works:
//   1. The frontend calls GET /api/csrf-token. The server stores a random token in a cookie
//      AND returns the same token in the JSON response.
//   2. For every POST / PUT / DELETE, the frontend sends the token in the "X-CSRF-Token" header.
//   3. The server checks that the header matches the cookie.
// Other websites cannot read our API responses (CORS blocks them), so they cannot know the token.

const crypto = require('crypto');
const { getCookieOptions, SESSION_DAYS } = require('../utils/authCookie');

// Different name from the marketplace's cookie, so the two sites never overwrite each other
const CSRF_COOKIE_NAME = 'sellerCsrfToken';
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

// GET /api/csrf-token
function sendCsrfToken(req, res) {
  let token = req.cookies ? req.cookies[CSRF_COOKIE_NAME] : null;

  // Re-use a valid existing token, otherwise create a new random one
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    token = crypto.randomBytes(32).toString('hex');
  }

  res.cookie(CSRF_COOKIE_NAME, token, {
    ...getCookieOptions(),
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
  });

  res.json({ success: true, csrfToken: token });
}

// Runs before every API route. Only state-changing requests are checked.
function verifyCsrfToken(req, res, next) {
  if (SAFE_METHODS.includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies ? req.cookies[CSRF_COOKIE_NAME] : '';
  const cookieBuffer = Buffer.from(typeof cookieToken === 'string' ? cookieToken : '');
  const headerBuffer = Buffer.from(req.get('X-CSRF-Token') || '');

  // timingSafeEqual compares in constant time, so attackers cannot guess the token byte by byte
  const tokensMatch =
    cookieBuffer.length > 0 &&
    cookieBuffer.length === headerBuffer.length &&
    crypto.timingSafeEqual(cookieBuffer, headerBuffer);

  if (!tokensMatch) {
    return res.status(403).json({
      success: false,
      code: 'CSRF_INVALID',
      message: 'Security check failed. Please refresh the page and try again.',
    });
  }

  next();
}

module.exports = { sendCsrfToken, verifyCsrfToken };
