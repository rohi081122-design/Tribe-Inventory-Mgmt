// models/Order.js
// An order placed by a buyer. One order always belongs to ONE seller: if the cart has products
// from two sellers, checkout creates two orders (each seller then handles their own order).
//
// Orders are CREATED by the TribalMarketplace backend (checkout). Here sellers read their orders
// and update the status. The same schema exists in TribalMarketplace/backend - keep both in sync.

const mongoose = require('mongoose');
require('./Seller'); // registers the Seller model used by .populate('seller')

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    // A copy of the product details at the time of ordering (they stay correct even if the seller edits the product later)
    name: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true }, // price x quantity
    platformFee: { type: Number, required: true }, // platform charge for this line
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true }, // e.g. TM261014-4F7A2C
    buyer: { type: mongoose.Schema.Types.ObjectId, required: true }, // buyer account (in the marketplace's users collection)
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    items: { type: [orderItemSchema], required: true },

    itemsTotal: { type: Number, required: true }, // goes to the seller
    platformFee: { type: Number, required: true }, // earned by Tribal Marketplace
    // Delivery charge when the buyer lives outside the free delivery zone around the seller (0 = free).
    // It covers the seller's cost of sending the parcel far away.
    deliveryCharge: { type: Number, default: 0, min: 0 },
    deliveryDistanceKm: { type: Number, default: null }, // approximate road distance seller -> buyer
    totalAmount: { type: Number, required: true }, // what the buyer pays (products + platform charge + delivery)

    delivery: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      village: { type: String, required: true },
      district: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    paymentMethod: { type: String, enum: ['cod'], default: 'cod' }, // cod = Cash on Delivery
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
    cancelledBy: { type: String, enum: ['', 'buyer', 'seller'], default: '' },
  },
  { timestamps: true }
);

orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });

orderSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Order', orderSchema);
