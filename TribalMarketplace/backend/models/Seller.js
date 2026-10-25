// models/Seller.js
// Sellers register and log in on the separate SellerTribe website, which owns the full
// seller data (contact number, Aadhaar...). Both websites use the same MongoDB database.
//
// This marketplace only needs the PUBLIC seller details shown next to a product,
// so only those fields are listed here. Private fields are never selected.

const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema(
  {
    name: String,
    village: String,
    district: String,
    state: String,
  },
  { timestamps: true }
);

// Model name "Seller" -> MongoDB collection "sellers" (shared with SellerTribe)
module.exports = mongoose.model('Seller', sellerSchema);
