// models/Notification.js
// A short message about an order, shown in the bell on the SellerTribe website.
//   recipient "seller" -> for one seller: "Rahul ordered 3 x Dokra Horse - keep them ready"
//   recipient "team"   -> for the Tribal Marketplace team (SellerTribe /admin): who ordered what
//
// Notifications are created by the TribalMarketplace backend when a buyer places or cancels an order,
// and here when a seller cancels one. Sellers and the team read them and mark them as read here.
// The same schema exists in TribalMarketplace/backend - keep both in sync.

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: String, enum: ['seller', 'team'], required: true },
    // The seller of the order (for "seller" notifications this is who receives it)
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    type: { type: String, enum: ['order_placed', 'order_cancelled'], required: true },

    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    orderNumber: { type: String, default: '' },
    title: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 1000 },
    // The ordered products, e.g. [{ name: 'Dokra Horse', quantity: 3 }]
    items: {
      type: [{ name: String, quantity: Number, _id: false }],
      default: [],
    },

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, seller: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

notificationSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
