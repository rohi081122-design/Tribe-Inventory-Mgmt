// models/User.js
// A buyer account on the marketplace.
// (Sellers have their own accounts on the separate SellerTribe website - see models/Seller.js.)
// Passwords are hashed with bcrypt before saving and are never sent back in API responses.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 100,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // not returned by queries unless we ask for it with .select('+password')
    },
    village: { type: String, trim: true, maxlength: 60, default: '' },
    district: { type: String, trim: true, maxlength: 60, default: '' },
    state: { type: String, trim: true, maxlength: 60, default: '' },

    // Products the buyer liked (the ❤️ button), oldest first. Saved in the account,
    // so the like list is the same on every device. Not loaded unless asked for.
    likedProducts: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      default: [],
      select: false,
    },
  },
  { timestamps: true }
);

// Hash the password whenever it is new or changed
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Compares a plain password typed by the user with the stored hash
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Remove the password hash (and the internal __v field) whenever a user is turned into JSON
userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
