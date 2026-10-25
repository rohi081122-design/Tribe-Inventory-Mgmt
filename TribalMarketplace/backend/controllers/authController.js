// controllers/authController.js
// Buyer registration, login, logout and "who am I?".
// (Sellers sign up on the separate SellerTribe website.)

const User = require('../models/User');
const { setAuthCookie, clearAuthCookie } = require('../utils/authCookie');
const { cleanString, cleanText, isValidEmail, checkLength } = require('../utils/validators');

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72; // bcrypt only uses the first 72 bytes of a password

// Passwords are taken exactly as typed (no trimming)
function readPassword(value) {
  return typeof value === 'string' ? value : '';
}

// @route  POST /api/auth/register
// @access Public
async function registerUser(req, res) {
  const name = cleanText(req.body.name);
  const email = cleanString(req.body.email).toLowerCase();
  const password = readPassword(req.body.password);
  const confirmPassword = readPassword(req.body.confirmPassword);
  const village = cleanText(req.body.village);
  const district = cleanText(req.body.district);
  const state = cleanText(req.body.state);

  // ---- Validation ----
  const errors = {};
  checkLength(errors, 'name', name, { label: 'Full name', min: 2, max: 60, required: true });

  if (!email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email) || email.length > 100) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  } else if (Buffer.byteLength(password) > MAX_PASSWORD_BYTES) {
    errors.password = 'Password is too long (maximum 72 characters)';
  }

  if (password && confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match';
  }

  checkLength(errors, 'village', village, { label: 'Village / Town', min: 2, max: 60, required: true });
  checkLength(errors, 'district', district, { label: 'District', min: 2, max: 60, required: true });
  checkLength(errors, 'state', state, { label: 'State', min: 2, max: 60, required: true });

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Please correct the highlighted fields.', errors });
  }

  // ---- Is the email already used? ----
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email already exists. Please log in instead.',
      errors: { email: 'This email is already registered' },
    });
  }

  // The password is hashed automatically by the User model (pre "save" hook)
  const user = await User.create({ name, email, password, village, district, state });

  setAuthCookie(res, user._id);

  res.status(201).json({
    success: true,
    message: 'Your account has been created successfully.',
    user, // the password hash is removed by the model's toJSON setting
  });
}

// @route  POST /api/auth/login
// @access Public
async function loginUser(req, res) {
  const email = cleanString(req.body.email).toLowerCase();
  const password = readPassword(req.body.password);

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please enter your email and password.' });
  }

  const user = await User.findOne({ email }).select('+password');
  const passwordIsCorrect = user ? await user.matchPassword(password) : false;

  if (!passwordIsCorrect) {
    // Same message for "no such email" and "wrong password", so attackers learn nothing
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  setAuthCookie(res, user._id);

  res.json({ success: true, message: `Welcome back, ${user.name}!`, user });
}

// @route  POST /api/auth/logout
// @access Public
function logoutUser(req, res) {
  clearAuthCookie(res);
  res.json({ success: true, message: 'You have been logged out.' });
}

// @route  GET /api/auth/me
// @access Public (returns user: null when nobody is logged in)
function getCurrentUser(req, res) {
  res.json({ success: true, user: req.user || null });
}

module.exports = { registerUser, loginUser, logoutUser, getCurrentUser };
