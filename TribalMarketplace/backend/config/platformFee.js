// config/platformFee.js
// The PLATFORM CHARGE added on top of the product price at checkout.
// This is how Tribal Marketplace earns money.
//
// Change the numbers in backend/.env (no code changes needed):
//   PLATFORM_FEE_PERCENT=5   -> percent of the product price
//   PLATFORM_FEE_MIN=10      -> minimum charge in rupees for each product in an order
//
// The fee is ALWAYS calculated here on the server, never in the browser,
// so a buyer cannot change it.

const DEFAULT_PERCENT = 5;
const DEFAULT_MINIMUM = 10;

// Reads a number from .env, or uses the fallback when it is missing or not a valid number (0 or more)
function readNumber(value, fallback) {
  const number = Number(value);
  return value !== undefined && value !== '' && Number.isFinite(number) && number >= 0 ? number : fallback;
}

function getPlatformFeeRules() {
  return {
    percent: readNumber(process.env.PLATFORM_FEE_PERCENT, DEFAULT_PERCENT),
    minimum: readNumber(process.env.PLATFORM_FEE_MIN, DEFAULT_MINIMUM),
  };
}

// Platform charge for one product line (price x quantity), rounded to whole rupees.
// Example with 5%, minimum Rs 10:  Rs 450 -> Rs 23,  Rs 120 -> Rs 10 (minimum)
function calculatePlatformFee(lineTotal) {
  const { percent, minimum } = getPlatformFeeRules();
  return Math.max(minimum, Math.round((lineTotal * percent) / 100));
}

module.exports = { getPlatformFeeRules, calculatePlatformFee, readNumber };
