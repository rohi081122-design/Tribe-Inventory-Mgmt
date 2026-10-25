// controllers/likeController.js
// The buyer's like list (the ❤️ button on every product).
// Liked products are saved in the buyer's account (User.likedProducts), so only logged-in
// buyers can like products, and the list is the same on every device.

const User = require('../models/User');
const Product = require('../models/Product');
const { PUBLIC_SELLER_FIELDS } = require('../utils/productQuery');
const { isValidObjectId } = require('../utils/validators');

const MAX_LIKES = 500;

// @route  GET /api/likes
// @access Logged-in buyer
// Returns the liked products (newest like first) and their ids. Products that were deleted,
// or hidden because the seller's access was removed, are left out.
async function getMyLikes(req, res) {
  const user = await User.findById(req.user._id).select('likedProducts');
  const likedIds = user ? user.likedProducts : [];

  const products = await Product.find({ _id: { $in: likedIds }, hidden: { $ne: true } })
    .populate('category', 'name slug')
    .populate('seller', PUBLIC_SELLER_FIELDS);

  // Same order as the like list, newest like first
  const sortedProducts = [...likedIds]
    .reverse()
    .map((id) => products.find((product) => product._id.equals(id)))
    .filter(Boolean);

  res.json({
    success: true,
    productIds: sortedProducts.map((product) => product._id),
    products: sortedProducts,
  });
}

// @route  POST /api/likes/:productId
// @access Logged-in buyer
async function likeProduct(req, res) {
  const { productId } = req.params;
  const productExists = isValidObjectId(productId) && (await Product.exists({ _id: productId, hidden: { $ne: true } }));
  if (!productExists) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  // $addToSet adds the id only if it is not in the list yet (liking twice changes nothing).
  // The extra condition stops the list from growing past MAX_LIKES.
  const result = await User.updateOne(
    {
      _id: req.user._id,
      $or: [{ likedProducts: productId }, { [`likedProducts.${MAX_LIKES - 1}`]: { $exists: false } }],
    },
    { $addToSet: { likedProducts: productId } }
  );
  if (result.matchedCount === 0) {
    return res.status(400).json({
      success: false,
      message: `You can like at most ${MAX_LIKES} products. Remove some likes first.`,
    });
  }

  res.json({ success: true, liked: true, message: 'Added to your likes.' });
}

// @route  DELETE /api/likes/:productId
// @access Logged-in buyer
async function unlikeProduct(req, res) {
  const { productId } = req.params;
  if (isValidObjectId(productId)) {
    await User.updateOne({ _id: req.user._id }, { $pull: { likedProducts: productId } });
  }
  res.json({ success: true, liked: false, message: 'Removed from your likes.' });
}

module.exports = { getMyLikes, likeProduct, unlikeProduct };
