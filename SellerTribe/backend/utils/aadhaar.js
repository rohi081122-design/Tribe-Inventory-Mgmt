// utils/aadhaar.js
// Helpers for handling Aadhaar numbers safely.
//
// An Aadhaar number is sensitive personal data, so we never save it as plain text.
// Instead we save an HMAC: a one-way "fingerprint" made with a secret key (AADHAAR_SECRET).
// The same number always gives the same fingerprint, so we can still find a seller at login,
// but someone who sees the database cannot turn the fingerprint back into the number.

const crypto = require('crypto');

// "1234 5678 9012" -> "123456789012"
function onlyDigits(value) {
  return typeof value === 'string' ? value.replace(/[\s-]/g, '') : '';
}

function isValidAadhaarFormat(digits) {
  // NOTE: for this prototype any 12 digits are accepted (dummy numbers are allowed).
  return /^\d{12}$/.test(digits);
}

function hashAadhaar(digits) {
  return crypto.createHmac('sha256', process.env.AADHAAR_SECRET).update(digits).digest('hex');
}

module.exports = { onlyDigits, isValidAadhaarFormat, hashAadhaar };
