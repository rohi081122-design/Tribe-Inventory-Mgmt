const Seller = require('../models/Seller');
const { setAuthCookie, clearAuthCookie } = require('../utils/authCookie');
const { cleanString, cleanText, checkLength } = require('../utils/validators');
const { onlyDigits, isValidAadhaarFormat, hashAadhaar } = require('../utils/aadhaar');

// "+91 98765-43210" -> "9876543210"
function readNumber(value) {
  let text = cleanString(value).replace(/[\s-]/g, '');
  if (text.startsWith('+91')) {
    text = text.slice(3);
  }
  return text;
}

function isValidPhone(phone) {
  // NOTE: for this prototype any 10 digits are accepted (dummy numbers are allowed).
  return /^\d{10}$/.test(phone);
}

// @route  POST /api/auth/register
// @access Public (rate limited)
async function registerSeller(req, res) {
  const name = cleanText(req.body.name);
  const phone = readNumber(req.body.phone);
  const aadhaar = onlyDigits(cleanString(req.body.aadhaar));
  const village = cleanText(req.body.village);
  const district = cleanText(req.body.district);
  const state = cleanText(req.body.state);

  // ---- Validation ----
  const errors = {};
  checkLength(errors, 'name', name, { label: 'Full name', min: 2, max: 60, required: true });
  if (!isValidPhone(phone)) {
    errors.phone = 'Please enter a 10-digit contact number';
  }
  if (!isValidAadhaarFormat(aadhaar)) {
    errors.aadhaar = 'Please enter a 12-digit Aadhaar number';
  }
  checkLength(errors, 'village', village, { label: 'Village / Town', min: 2, max: 60, required: true });
  checkLength(errors, 'district', district, { label: 'District', min: 2, max: 60, required: true });
  checkLength(errors, 'state', state, { label: 'State', min: 2, max: 60, required: true });

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Please correct the highlighted fields.', errors });
  }

  // ---- Already registered? ----
  const aadhaarHash = hashAadhaar(aadhaar);
  const [phoneTaken, aadhaarTaken] = await Promise.all([Seller.exists({ phone }), Seller.exists({ aadhaarHash })]);

  if (phoneTaken) {
    errors.phone = 'This contact number is already registered';
  }
  if (aadhaarTaken) {
    errors.aadhaar = 'This Aadhaar number is already registered';
  }
  if (phoneTaken || aadhaarTaken) {
    return res.status(409).json({
      success: false,
      message: 'You are already registered. Please log in with your contact number or Aadhaar number.',
      errors,
    });
  }

  // Only the hash and the last 4 digits of the Aadhaar number are saved
  const seller = await Seller.create({
    name,
    phone,
    aadhaarHash,
    aadhaarLast4: aadhaar.slice(-4),
    village,
    district,
    state,
  });

  setAuthCookie(res, seller._id);

  // New sellers must be approved by the team before they can upload products
  res.status(201).json({
    success: true,
    message: `Thank you, ${seller.name}! Your registration was received. You can upload products after the Tribal Marketplace team approves your account.`,
    seller,
  });
}

// @route  POST /api/auth/login
// @body   { identifier: "<10-digit contact number> OR <12-digit Aadhaar number>" }
// @access Public (rate limited)
async function loginSeller(req, res) {
  const identifier = readNumber(req.body.identifier);

  let seller = null;
  if (/^\d{10}$/.test(identifier)) {
    seller = await Seller.findOne({ phone: identifier });
  } else if (/^\d{12}$/.test(identifier)) {
    seller = await Seller.findOne({ aadhaarHash: hashAadhaar(identifier) });
  } else {
    return res.status(400).json({
      success: false,
      message: 'Please enter your 10-digit contact number or your 12-digit Aadhaar number.',
    });
  }

  if (!seller) {
    return res.status(404).json({
      success: false,
      message: 'No seller account was found with this number. Please register first.',
    });
  }

  setAuthCookie(res, seller._id);
  res.json({ success: true, message: `Welcome back, ${seller.name}!`, seller });
}

// @route  POST /api/auth/logout
function logoutSeller(req, res) {
  clearAuthCookie(res);
  res.json({ success: true, message: 'You have been logged out.' });
}

// @route  GET /api/auth/me   (returns seller: null when nobody is logged in)
function getCurrentSeller(req, res) {
  res.json({ success: true, seller: req.seller || null });
}

module.exports = { registerSeller, loginSeller, logoutSeller, getCurrentSeller };
