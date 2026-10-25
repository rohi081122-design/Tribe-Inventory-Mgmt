// middleware/dbMiddleware.js
// If MongoDB is not connected, answer with a clear 503 message instead of
// waiting and timing out. (We never fall back to fake data.)

const { isDatabaseConnected } = require('../config/db');

function requireDatabase(req, res, next) {
  if (isDatabaseConnected()) {
    return next();
  }

  res.status(503).json({
    success: false,
    message:
      'The database is not connected. Check MONGO_URI in backend/.env and look at the backend terminal for details.',
  });
}

module.exports = { requireDatabase };
