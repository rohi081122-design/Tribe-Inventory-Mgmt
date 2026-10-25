// middleware/rateLimiters.js
// Limits how many requests one IP address can make in a time window.
// This slows down password guessing and contact-form spam.

const { rateLimit } = require('express-rate-limit');

// extraOptions: more express-rate-limit settings, e.g. { skipFailedRequests: true }
function createLimiter(windowMinutes, maxRequests, message, extraOptions = {}) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: maxRequests,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { success: false, message },
    ...extraOptions,
  });
}

// General limit for the whole API
const apiLimiter = createLimiter(15, 1000, 'Too many requests. Please slow down and try again in a few minutes.');

// Login and registration
const authLimiter = createLimiter(
  15,
  20,
  'Too many login or registration attempts. Please wait 15 minutes and try again.'
);

// Contact form: 5 saved queries per hour. Attempts that fail (for example a wrong mobile number)
// do not count, so a customer correcting the form is never blocked.
const contactLimiter = createLimiter(60, 5, 'You have sent several messages already. Please try again in an hour.', {
  skipFailedRequests: true,
});

module.exports = { apiLimiter, authLimiter, contactLimiter };
