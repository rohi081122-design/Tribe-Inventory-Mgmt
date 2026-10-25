const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
require('../models/Buyer'); // registers the read-only Buyer model used by .populate('buyer')
const {
  MIN_ADMIN_PASSWORD_LENGTH,
  isAdminPasswordConfigured,
  isCorrectAdminPassword,
  setAdminCookie,
  clearAdminCookie,
  isAdminRequest,
} = require('../utils/adminAuth');
const { cleanString, isValidObjectId } = require('../utils/validators');

// @route  POST /api/admin/login   { password }
async function adminLogin(req, res) {
  if (!isAdminPasswordConfigured()) {
    return res.status(503).json({
      success: false,
      message: `Team login is not set up. Add ADMIN_PASSWORD (at least ${MIN_ADMIN_PASSWORD_LENGTH} characters) to SellerTribe/backend/.env and restart the backend.`,
    });
  }

  if (!isCorrectAdminPassword(req.body.password)) {
    return res.status(401).json({ success: false, message: 'Wrong team password.' });
  }

  setAdminCookie(res);
  res.json({ success: true, message: 'Welcome, team!' });
}

// @route  POST /api/admin/logout
function adminLogout(req, res) {
  clearAdminCookie(res);
  res.json({ success: true, message: 'Team logged out.' });
}

// @route  GET /api/admin/me   -> { isAdmin: true/false }
function getAdminStatus(req, res) {
  res.json({ success: true, isAdmin: isAdminRequest(req), isConfigured: isAdminPasswordConfigured() });
}

// @route  GET /api/admin/sellers?status=pending|approved|all
async function listSellers(req, res) {
  const status = cleanString(req.query.status);
  const filter = {};
  if (status === 'pending') filter.isApproved = { $ne: true };
  if (status === 'approved') filter.isApproved = true;

  const [sellers, productCounts, pendingCount] = await Promise.all([
    Seller.find(filter).sort({ createdAt: -1 }).limit(500),
    Product.aggregate([{ $group: { _id: '$seller', count: { $sum: 1 } } }]),
    Seller.countDocuments({ isApproved: { $ne: true } }),
  ]);

  const countBySeller = {};
  productCounts.forEach(({ _id, count }) => {
    countBySeller[String(_id)] = count;
  });

  res.json({
    success: true,
    pendingCount,
    sellers: sellers.map((seller) => ({ ...seller.toJSON(), productCount: countBySeller[String(seller._id)] || 0 })),
  });
}

// @route  PATCH /api/admin/sellers/:id/approval   { approved: true | false }
async function setSellerApproval(req, res) {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(404).json({ success: false, message: 'Seller not found.' });
  }
  if (typeof req.body.approved !== 'boolean') {
    return res.status(400).json({ success: false, message: 'Send { "approved": true } or { "approved": false }.' });
  }

  const approved = req.body.approved;
  const seller = await Seller.findByIdAndUpdate(
    id,
    { isApproved: approved, approvedAt: approved ? new Date() : null },
    { new: true }
  );
  if (!seller) {
    return res.status(404).json({ success: false, message: 'Seller not found.' });
  }

  // Show or hide all products of this seller on the marketplace
  const result = await Product.updateMany({ seller: seller._id }, { hidden: !approved });

  res.json({
    success: true,
    message: approved
      ? `${seller.name} can now upload products.`
      : `${seller.name}'s access was removed. ${result.modifiedCount} product(s) are now hidden from the marketplace.`,
    seller,
  });
}

// @route  GET /api/admin/orders
// All orders with a summary of the platform charges earned by Tribal Marketplace
async function listOrders(req, res) {
  const [orders, byStatus] = await Promise.all([
    Order.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('seller', 'name phone district state')
      .populate({ path: 'buyer', model: 'Buyer', select: 'name email' }), // the buyer's marketplace account
    Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          platformFee: { $sum: '$platformFee' },
          itemsTotal: { $sum: '$itemsTotal' },
          deliveryCharge: { $sum: '$deliveryCharge' },
        },
      },
    ]),
  ]);

  const summary = {
    totalOrders: 0,
    activeOrders: 0, // everything that is not cancelled
    deliveredOrders: 0,
    salesValue: 0, // value of products in orders that are not cancelled
    platformFeeExpected: 0, // platform charges on orders that are not cancelled
    platformFeeEarned: 0, // platform charges on DELIVERED orders (money actually collected)
    deliveryCharges: 0, // delivery charges on orders that are not cancelled (they go to the sellers)
  };
  byStatus.forEach((group) => {
    summary.totalOrders += group.count;
    if (group._id !== 'cancelled') {
      summary.activeOrders += group.count;
      summary.salesValue += group.itemsTotal;
      summary.platformFeeExpected += group.platformFee;
      summary.deliveryCharges += group.deliveryCharge;
    }
    if (group._id === 'delivered') {
      summary.deliveredOrders += group.count;
      summary.platformFeeEarned += group.platformFee;
    }
  });

  res.json({ success: true, summary, orders });
}

// @route  GET /api/admin/notifications   -> the latest team notifications and how many are unread
async function listNotifications(req, res) {
  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ recipient: 'team' }).sort({ createdAt: -1 }).limit(30).populate('seller', 'name'),
    Notification.countDocuments({ recipient: 'team', isRead: false }),
  ]);
  res.json({ success: true, notifications, unreadCount });
}

// @route  PATCH /api/admin/notifications/read-all
async function markNotificationsRead(req, res) {
  await Notification.updateMany({ recipient: 'team', isRead: false }, { isRead: true });
  res.json({ success: true, unreadCount: 0 });
}

module.exports = {
  adminLogin,
  adminLogout,
  getAdminStatus,
  listSellers,
  setSellerApproval,
  listOrders,
  listNotifications,
  markNotificationsRead,
};
