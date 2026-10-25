// controllers/contactController.js
// Saves queries from the Contact Us page in MongoDB (status "pending").
// The team sees them on the SellerTribe Team page and marks them as resolved there.

const Contact = require('../models/Contact');
const { cleanString, cleanText, isValidEmail, checkLength } = require('../utils/validators');

// "+91 98765-43210" or "098765 43210" -> "9876543210"
function cleanMobileNumber(value) {
  return cleanString(value)
    .replace(/[\s\-()]/g, '')
    .replace(/^\+?91(?=\d{10}$)/, '')
    .replace(/^0(?=\d{10}$)/, '');
}

// @route  POST /api/contact
// @access Public (rate limited)
async function sendContactMessage(req, res) {
  const name = cleanText(req.body.name);
  const email = cleanString(req.body.email).toLowerCase();
  const phone = cleanMobileNumber(req.body.phone);
  const subject = cleanText(req.body.subject);
  const message = cleanText(req.body.message);

  const errors = {};
  checkLength(errors, 'name', name, { label: 'Full name', min: 2, max: 60, required: true });

  if (!email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email) || email.length > 100) {
    errors.email = 'Please enter a valid email address';
  }

  // Indian mobile numbers have 10 digits and start with 6, 7, 8 or 9
  if (!phone) {
    errors.phone = 'Mobile number is required';
  } else if (!/^[6-9]\d{9}$/.test(phone)) {
    errors.phone = 'Please enter a valid 10-digit mobile number';
  }

  checkLength(errors, 'subject', subject, { label: 'Subject', min: 3, max: 120, required: true });
  checkLength(errors, 'message', message, { label: 'Message', min: 10, max: 2000, required: true });

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Please correct the highlighted fields.', errors });
  }

  await Contact.create({ name, email, phone, subject, message, status: 'pending' });

  // We only say the message was saved - no email is sent by this project
  res.status(201).json({
    success: true,
    message: 'Thank you! Your query has been received. Our team will contact you soon on your mobile number or email.',
  });
}

module.exports = { sendContactMessage };
