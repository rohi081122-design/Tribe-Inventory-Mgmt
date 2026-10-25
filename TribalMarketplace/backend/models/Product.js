// models/Product.js
// A product uploaded by a seller on the SellerTribe website.
// This marketplace only READS products. The same schema exists in SellerTribe/backend,
// so if you add a field, add it in both places.

const mongoose = require('mongoose');
require('./Seller'); // registers the Seller model used by .populate('seller')

// An extra photo (side view, top view, close-up ...) added by the seller on SellerTribe.
// label tells the buyer which view the photo shows, e.g. "Side view".
const MAX_EXTRA_IMAGES = 5; // same limit as SellerTribe/backend/config/productPhotos.js

const extraImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    label: { type: String, trim: true, maxlength: 30, default: '' },
  },
  { _id: false } // the photos do not need their own ids
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      validate: {
        validator: (value) => value > 0,
        message: 'Price must be a positive number',
      },
    },
    description: { type: String, trim: true, maxlength: 2000, default: '' },

    // Image stored on Cloudinary. publicId is needed to delete the image later.
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },

    // Optional extra photos shown in the photo slider on the product page (main photo stays in "image")
    extraImages: {
      type: [extraImageSchema],
      default: [],
      validate: {
        validator: (list) => list.length <= MAX_EXTRA_IMAGES,
        message: `A product can have at most ${MAX_EXTRA_IMAGES} extra photos`,
      },
    },

    // Optional main category and subcategory
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    subcategory: { type: String, trim: true, default: '' }, // subcategory slug, e.g. "dokra-art"
    subcategoryName: { type: String, trim: true, default: '' }, // readable name, e.g. "Dokra Art"
    // When the seller chose "Other" and typed their own main category (then category is null),
    // e.g. "Grass Crafts". A typed subcategory is saved in subcategory / subcategoryName as usual.
    customCategory: { type: String, trim: true, maxlength: 40, default: '' },

    // null means "the seller did not provide stock information"
    stock: {
      type: Number,
      default: null,
      min: 0,
      validate: {
        validator: (value) => value === null || Number.isInteger(value),
        message: 'Stock must be a whole number',
      },
    },

    village: { type: String, trim: true, maxlength: 60, default: '' },
    district: { type: String, trim: true, maxlength: 60, default: '' },

    // The seller who owns this product (a document in the "sellers" collection)
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },

    // Number of times the product details page was opened (used for "Popular products")
    views: { type: Number, default: 0 },

    // true when the team removed the seller's access on SellerTribe: the product is not shown here
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes make the most common queries fast
productSchema.index({ createdAt: -1 });
productSchema.index({ category: 1, subcategory: 1, createdAt: -1 });
productSchema.index({ seller: 1, createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ views: -1 });
productSchema.index({ name: 1 });

productSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Product', productSchema);
