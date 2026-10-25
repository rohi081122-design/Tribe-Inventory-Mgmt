const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const { cleanString, isValidObjectId } = require('../utils/validators');

// Orders the seller still has to send: their products must be kept ready
const ACTIVE_STATUSES = ['placed', 'confirmed'];

// Which status may come next
const NEXT_STATUSES = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

// @route  GET /api/orders   (?status=placed|confirmed|shipped|delivered|cancelled)
// @access Logged-in seller
async function getSellerOrders(req, res) {
  const filter = { seller: req.seller._id };
  const status = cleanString(req.query.status);
  if (NEXT_STATUSES[status]) {
    filter.status = status;
  }

  const [orders, counts] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).limit(200),
    Order.aggregate([{ $match: { seller: req.seller._id } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const statusCounts = {};
  counts.forEach(({ _id, count }) => {
    statusCounts[_id] = count;
  });

  res.json({ success: true, orders, statusCounts });
}

// @route  GET /api/orders/demand
// @access Logged-in seller
// "Keep ready" list: for every product, how many pieces buyers ordered in orders that are
// not shipped yet (new + confirmed), so the seller knows how much to prepare.
async function getDemand(req, res) {
  const demand = await Order.aggregate([
    { $match: { seller: req.seller._id, status: { $in: ACTIVE_STATUSES } } },
    { $sort: { createdAt: 1 } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $last: '$items.name' }, // the newest name and photo
        imageUrl: { $last: '$items.imageUrl' },
        quantity: { $sum: '$items.quantity' },
        orders: { $sum: 1 },
        newOrders: { $sum: { $cond: [{ $eq: ['$status', 'placed'] }, 1, 0] } },
      },
    },
    { $sort: { quantity: -1, name: 1 } },
    { $limit: 50 },
  ]);

  // Stock that is left after these orders (stock is reduced when a buyer orders)
  const products = await Product.find({ _id: { $in: demand.map((row) => row._id) } }).select('stock');
  const items = demand.map((row) => {
    const product = products.find((item) => item._id.equals(row._id));
    return {
      product: row._id,
      name: row.name,
      imageUrl: row.imageUrl,
      quantity: row.quantity,
      orders: row.orders,
      newOrders: row.newOrders,
      stockLeft: product && typeof product.stock === 'number' ? product.stock : null,
    };
  });

  res.json({
    success: true,
    items,
    totalPieces: items.reduce((sum, item) => sum + item.quantity, 0),
  });
}

// @route  PATCH /api/orders/:id/status   { status: 'confirmed' | 'shipped' | 'delivered' | 'cancelled' }
// @access Approved seller (own orders only)
async function updateOrderStatus(req, res) {
  const order = isValidObjectId(req.params.id) ? await Order.findById(req.params.id) : null;
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }
  if (!order.seller.equals(req.seller._id)) {
    return res.status(403).json({ success: false, message: 'You can only manage your own orders.' });
  }

  const newStatus = cleanString(req.body.status);
  if (!NEXT_STATUSES[order.status].includes(newStatus)) {
    return res.status(409).json({
      success: false,
      message: `An order that is "${order.status}" cannot be changed to "${newStatus || 'nothing'}".`,
    });
  }

  // Only change the order if nobody else changed it in the meantime (for example the buyer cancelling it)
  const changes = newStatus === 'cancelled' ? { status: newStatus, cancelledBy: 'seller' } : { status: newStatus };
  const updatedOrder = await Order.findOneAndUpdate({ _id: order._id, status: order.status }, changes, {
    returnDocument: 'after',
  });
  if (!updatedOrder) {
    return res.status(409).json({
      success: false,
      message: 'This order was just changed (the buyer may have cancelled it). Please reload the page.',
    });
  }

  // Give the stock back when an order is cancelled, and tell the team
  if (newStatus === 'cancelled') {
    for (const item of updatedOrder.items) {
      await Product.updateOne({ _id: item.product, stock: { $ne: null } }, { $inc: { stock: item.quantity } });
    }
    await notifyTeamSellerCancelled(updatedOrder, req.seller);
  }

  res.json({ success: true, message: `Order ${updatedOrder.orderNumber} is now "${newStatus}".`, order: updatedOrder });
}

// A notification for the team page when a seller cancels an order (errors only logged)
async function notifyTeamSellerCancelled(order, seller) {
  const items = order.items.map(({ name, quantity }) => ({ name, quantity }));
  try {
    await Notification.create({
      recipient: 'team',
      seller: seller._id,
      type: 'order_cancelled',
      order: order._id,
      orderNumber: order.orderNumber,
      items,
      title: `Order ${order.orderNumber} cancelled by the seller`,
      message: `${seller.name} cancelled the order of ${order.delivery.fullName} for ${items
        .map((item) => `${item.quantity} × ${item.name}`)
        .join(', ')}.`,
    });
  } catch (error) {
    console.error('Could not save the notification:', error.message);
  }
}

module.exports = { getSellerOrders, getDemand, updateOrderStatus };
