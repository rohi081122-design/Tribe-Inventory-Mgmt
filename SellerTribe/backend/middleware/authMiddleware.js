// middleware/authMiddleware.js
// protectSeller         -> only lets logged-in sellers continue (reads the JWT from the HTTP-only cookie)
// loadSellerIfLoggedIn  -> attaches the seller when logged in, but never blocks the request

const jwt = require('jsonwebtoken');
const Seller = require('../models/Seller');
const { AUTH_COOKIE_NAME, clearAuthCookie } = require('../utils/authCookie');
const { isValidObjectId } = require('../utils/validators');

// Reads the token cookie and returns the matching seller from MongoDB (or null)
async function getSellerFromCookie(req, res) {
  const token = req.cookies ? req.cookies[AUTH_COOKIE_NAME] : null;
  if (!token) {
    return null;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // Expired or tampered token: remove it so the browser stops sending it
    clearAuthCookie(res);
    return null;
  }

  if (!isValidObjectId(decoded.id)) {
    clearAuthCookie(res);
    return null;
  }

  const seller = await Seller.findById(decoded.id);
  if (!seller) {
    clearAuthCookie(res);
  }
  return seller;
}

async function protectSeller(req, res, next) {
  const seller = await getSellerFromCookie(req, res);

  if (!seller) {
    return res.status(401).json({ success: false, message: 'Please log in to continue.' });
  }

  req.seller = seller;
  next();
}

async function loadSellerIfLoggedIn(req, res, next) {
  req.seller = await getSellerFromCookie(req, res);
  next();
}

// Use after protectSeller: only sellers approved by the team may add, edit or delete products
function requireApprovedSeller(req, res, next) {
  if (!req.seller || !req.seller.isApproved) {
    return res.status(403).json({
      success: false,
      code: 'SELLER_NOT_APPROVED',
      message:
        'Your seller account is waiting for approval by the Tribal Marketplace team. You can upload products after it is approved.',
    });
  }
  next();
}

module.exports = { protectSeller, loadSellerIfLoggedIn, requireApprovedSeller };
