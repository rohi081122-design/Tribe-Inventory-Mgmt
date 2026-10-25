// models/Contact.js
// Queries sent from the Contact Us page (no email is sent).
// The team reads them on the SellerTribe Team page (/admin -> Customer Queries), calls or emails
// the customer, and then marks the query as resolved. Resolved queries are KEPT (never deleted).
// The same schema exists in SellerTribe/backend (models/Contact.js) - keep both in sync.

const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 100 },
    // 10-digit mobile number (older messages, sent before this field existed, have none)
    phone: { type: String, trim: true, default: '' },
    subject: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    // pending = waiting for the team, resolved = the team has helped the customer.
    // (Messages saved before this change may still say "new" or "read" - they count as pending.)
    status: { type: String, enum: ['pending', 'resolved', 'new', 'read'], default: 'pending' },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true } // createdAt = when the customer sent the query
);

contactSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);
