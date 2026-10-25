// utils/validators.js
// Small helper functions for reading and checking user input.

// Returns a trimmed string, or '' when the value is not a string.
// (Blocks tricks like sending { "$gt": "" } objects instead of text.)
function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Like cleanString, but also removes HTML tags so no markup is stored
function cleanText(value) {
  return cleanString(value).replace(/<[^>]*>/g, '').trim();
}

// name@example.com (letters, numbers and . _ % + - only)
function isValidEmail(email) {
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email);
}

// MongoDB ids are 24 hexadecimal characters
function isValidObjectId(id) {
  return typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);
}

// Escapes special characters so user text can be used safely inside a RegExp search
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// "Madua / Ragi" -> "madua-ragi"
function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Checks the length of a text value and adds a message to "errors" if it is wrong
function checkLength(errors, field, value, { label, min = 0, max, required = false }) {
  if (required && !value) {
    errors[field] = `${label} is required`;
  } else if (value && value.length < min) {
    errors[field] = `${label} must be at least ${min} characters`;
  } else if (max && value.length > max) {
    errors[field] = `${label} must be at most ${max} characters`;
  }
}

module.exports = {
  cleanString,
  cleanText,
  isValidEmail,
  isValidObjectId,
  escapeRegex,
  slugify,
  checkLength,
};
