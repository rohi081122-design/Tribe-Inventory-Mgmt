// models/Buyer.js
// READ-ONLY view of the buyer accounts that the TribalMarketplace website saves in the
// shared "users" collection. The team page uses it to show WHO placed an order (name + email).
// SellerTribe never creates or changes buyer accounts, and never reads their passwords.

const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
  },
  { collection: 'users' } // the collection used by the marketplace
);

module.exports = mongoose.model('Buyer', buyerSchema);
