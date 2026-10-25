// middleware/errorMiddleware.js
// notFound     -> runs when no route matched (404)
// errorHandler -> catches every error thrown in controllers and sends a clean JSON message.
// Express 5 automatically forwards errors from async controllers to this handler.

function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

// Express recognises error handlers because they have 4 parameters (err, req, res, next)
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Something went wrong';

  // Invalid MongoDB id, e.g. /api/products/abc
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format.';
  }

  // Mongoose schema validation failed
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((fieldError) => fieldError.message)
      .join('. ');
  }

  // Unique index violated (for example the same email registered twice)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field === 'email' ? 'An account with this email already exists.' : 'This record already exists.';
  }

  // Broken JSON sent by the client
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'The request body is not valid JSON.';
  }
  if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'The request is too large.';
  }

  // Never show internal error details to users. Log them for the developer instead.
  // (Errors created with utils/httpError.js have messages that are safe to show.)
  if (statusCode >= 500 && !err.isPublic) {
    console.error('Server error:', err);
    message = 'Something went wrong on the server. Please try again later.';
  }

  res.status(statusCode).json({ success: false, message });
}

module.exports = { notFound, errorHandler };
