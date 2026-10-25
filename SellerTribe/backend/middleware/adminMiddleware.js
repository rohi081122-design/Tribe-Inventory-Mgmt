// middleware/adminMiddleware.js
// protectAdmin -> only lets the logged-in Tribal Marketplace team (admin) continue

const { isAdminRequest } = require('../utils/adminAuth');

function protectAdmin(req, res, next) {
  if (!isAdminRequest(req)) {
    return res.status(401).json({ success: false, message: 'Please log in as the Tribal Marketplace team.' });
  }
  next();
}

module.exports = { protectAdmin };
