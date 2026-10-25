// middleware/rateLimiters.js
// Limits how many requests one IP address can make in a time window.
// Seller login only needs a number for now, so this limit is important: it stops someone
// from quickly trying many numbers.

const { rateLimit } = require('express-rate-limit');

function createLimiter(windowMinutes, maxRequests, message) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: maxRequests,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { success: false, message },
  });
}

// General limit for the whole API
const apiLimiter = createLimiter(15, 1000, 'Too many requests. Please slow down and try again in a few minutes.');

// Seller login and registration
const authLimiter = createLimiter(
  15,
  20,
  'Too many login or registration attempts. Please wait 15 minutes and try again.'
);

module.exports = { apiLimiter, authLimiter };
