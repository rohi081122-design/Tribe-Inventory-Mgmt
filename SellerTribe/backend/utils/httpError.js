// utils/httpError.js
// Creates an error that carries an HTTP status code and a message that is safe to show users.
// Example:  throw httpError(404, 'Product not found.');
// The error middleware turns it into:  { success: false, message: 'Product not found.' }

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isPublic = true; // the message was written by us, so users may see it
  return error;
}

module.exports = httpError;
