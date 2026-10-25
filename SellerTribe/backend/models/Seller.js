// models/Seller.js
// A seller account on the SellerTribe website.
// The same "sellers" collection is read by the TribalMarketplace backend, which only ever
// uses the public fields (name, village, district, state).
//
// PRIVACY: the Aadhaar number is never stored in plain text.
//   aadhaarHash  - a keyed hash (HMAC) used to find the seller at login (see utils/aadhaar.js)
//   aadhaarLast4 - the last 4 digits, only for showing "XXXX XXXX 1234" to the seller

const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    phone: {
      type: String,
      required: [true, 'Contact number is required'],
      unique: true,
      match: [/^\d{10}$/, 'Contact number must have 10 digits'],
    },
    aadhaarHash: {
      type: String,
      required: true,
      unique: true,
      select: false, // never loaded unless asked for
    },
    aadhaarLast4: { type: String, required: true, match: /^\d{4}$/ },

    // Address (village, district and state are also shown next to the seller's products)
    village: { type: String, required: true, trim: true, maxlength: 60 },
    district: { type: String, required: true, trim: true, maxlength: 60 },
    state: { type: String, required: true, trim: true, maxlength: 60 },

    // Only sellers approved by the Tribal Marketplace team can upload products.
    // New registrations start as "waiting for approval". The team approves them on the /admin page.
    isApproved: { type: Boolean, default: false },
    approvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hide private/internal fields whenever a seller is turned into JSON
sellerSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.aadhaarHash;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Seller', sellerSchema);
