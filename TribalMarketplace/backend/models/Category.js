// models/Category.js
// A main category (for example "Tribal Jewellery") with a list of subcategories.
// Categories are created from seed/categories.js (see README -> "Categories").

const mongoose = require('mongoose');
const { slugify, cleanString, isValidObjectId } = require('../utils/validators');

const subcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    description: { type: String, trim: true, default: '' },
    icon: { type: String, default: '' }, // emoji, only shown when there is no image
    image: { type: String, default: '' }, // category photo, e.g. '/images/categories/tribal-jewellery.jpg'
    // Photographer credit for Creative Commons photos (shown on the Photo Credits page)
    imageCredit: {
      text: { type: String, default: '' },
      url: { type: String, default: '' },
    },
    displayOrder: { type: Number, default: 0 },
    subcategories: [subcategorySchema],
  },
  { timestamps: true }
);

// Create slugs automatically if someone adds a category without them
categorySchema.pre('validate', function () {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
  this.subcategories.forEach((sub) => {
    if (!sub.slug && sub.name) {
      sub.slug = slugify(sub.name);
    }
  });
});

// Finds a category by its MongoDB id OR its slug ("tribal-jewellery")
categorySchema.statics.findByIdOrSlug = function (value) {
  const text = cleanString(value).toLowerCase();
  if (!text) {
    return null;
  }
  return isValidObjectId(text) ? this.findById(text) : this.findOne({ slug: text });
};

// Finds a subcategory inside this category by its slug
categorySchema.methods.findSubcategory = function (subcategorySlug) {
  return this.subcategories.find((sub) => sub.slug === subcategorySlug) || null;
};

categorySchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Category', categorySchema);
