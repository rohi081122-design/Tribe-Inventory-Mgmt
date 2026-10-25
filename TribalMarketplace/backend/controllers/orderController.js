// controllers/orderController.js
// Checkout and orders for logged-in buyers.
//
// Important rules (all checked here on the server):
//   - prices, the platform charge and the delivery charge are calculated from the DATABASE,
//     never taken from the browser
//   - stock is checked and reduced when the order is placed (and given back if it is cancelled)
//   - a cart with products from several sellers becomes one order per seller
//     (each seller sends their own parcel, so each order has its own delivery charge)
//   - payment is Cash on Delivery for now (online payment can be added later)
//   - the seller and the team get a notification for every new or cancelled order

const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Seller = require('../models/Seller');
const httpError = require('../utils/httpError');
const { calculatePlatformFee, getPlatformFeeRules } = require('../config/platformFee');
const { getDeliveryQuote, getDeliveryRules } = require('../config/deliveryCharge');
const { findStateName, getPlaceNames } = require('../config/places');
const { notifyOrdersPlaced, notifyOrderCancelledByBuyer } = require('../utils/orderNotifications');
const { cleanString, cleanText, isValidObjectId, checkLength } = require('../utils/validators');

const MAX_DIFFERENT_PRODUCTS = 20;
const MAX_QUANTITY = 20;

const roundMoney = (amount) => Math.round(amount * 100) / 100;

/* ------------------------------------------------------------------ */
/* Helper functions                                                    */
/* ------------------------------------------------------------------ */

// Turns [{ productId, quantity }] from the browser into priced order lines using database prices
async function priceItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw httpError(400, 'Your order is empty.');
  }
  if (rawItems.length > MAX_DIFFERENT_PRODUCTS) {
    throw httpError(400, `You can order at most ${MAX_DIFFERENT_PRODUCTS} different products at once.`);
  }

  // Add up the quantity per product (in case the same product appears twice)
  const quantities = new Map();
  for (const item of rawItems) {
    const productId = cleanString(item && item.productId);
    const quantity = Number(item && item.quantity);
    if (!isValidObjectId(productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      throw httpError(400, `Invalid product or quantity (you can order 1 to ${MAX_QUANTITY} of each product).`);
    }
    quantities.set(productId, (quantities.get(productId) || 0) + quantity);
  }

  const products = await Product.find({ _id: { $in: [...quantities.keys()] }, hidden: { $ne: true } });

  const lines = [];
  for (const [productId, quantity] of quantities) {
    const product = products.find((p) => p._id.equals(productId));
    if (!product) {
      throw httpError(404, 'One of the products is no longer available. Please update your cart.');
    }
    if (typeof product.stock === 'number' && product.stock < quantity) {
      throw httpError(
        409,
        product.stock === 0 ? `"${product.name}" is out of stock.` : `Only ${product.stock} of "${product.name}" left in stock.`
      );
    }

    const lineTotal = roundMoney(product.price * quantity);
    lines.push({
      product: product._id,
      seller: product.seller,
      name: product.name,
      imageUrl: product.image ? product.image.url : '',
      price: product.price,
      quantity,
      lineTotal,
      platformFee: calculatePlatformFee(lineTotal),
    });
  }
  return lines;
}

// Adds up the money for a list of order lines (plus the delivery charge, if there is one)
function sumLines(lines, deliveryCharge = 0) {
  const itemsTotal = roundMoney(lines.reduce((sum, line) => sum + line.lineTotal, 0));
  const platformFee = roundMoney(lines.reduce((sum, line) => sum + line.platformFee, 0));
  return { itemsTotal, platformFee, totalAmount: roundMoney(itemsTotal + platformFee + deliveryCharge) };
}

// Splits the order lines into one group per seller and works out each group's delivery charge.
// address = the buyer's { district, state }, or null when it is not known yet (then delivery is null).
async function groupBySeller(lines, address) {
  const groups = new Map();
  for (const line of lines) {
    const key = String(line.seller);
    if (!groups.has(key)) groups.set(key, { sellerId: line.seller, lines: [] });
    groups.get(key).lines.push(line);
  }

  const sellers = await Seller.find({ _id: { $in: [...groups.values()].map((group) => group.sellerId) } }).select(
    'name district state'
  );

  return [...groups.values()].map((group) => {
    const seller = sellers.find((item) => item._id.equals(group.sellerId)) || null;
    return { ...group, seller, delivery: address ? getDeliveryQuote(seller, address) : null };
  });
}

// Reads { district, state } sent by the checkout page to calculate the delivery charge
function readAddress(body) {
  const district = cleanText(body && body.district).slice(0, 60);
  const state = cleanText(body && body.state).slice(0, 60);
  return district || state ? { district, state } : null;
}

// Reads and checks the delivery address form
function readDelivery(body) {
  const delivery = {
    fullName: cleanText(body && body.fullName),
    phone: cleanString(body && body.phone).replace(/[\s-]/g, '').replace(/^\+91/, ''),
    address: cleanText(body && body.address),
    village: cleanText(body && body.village),
    district: cleanText(body && body.district),
    state: cleanText(body && body.state),
    pincode: cleanString(body && body.pincode),
  };

  const errors = {};
  checkLength(errors, 'fullName', delivery.fullName, { label: 'Full name', min: 2, max: 60, required: true });
  if (!/^\d{10}$/.test(delivery.phone)) errors.phone = 'Please enter a 10-digit mobile number';
  checkLength(errors, 'address', delivery.address, { label: 'Address', min: 5, max: 200, required: true });
  checkLength(errors, 'village', delivery.village, { label: 'Village / Town', min: 2, max: 60, required: true });
  checkLength(errors, 'district', delivery.district, { label: 'District', min: 2, max: 60, required: true });
  // The state must be one we know, so the delivery distance can always be worked out
  const stateName = findStateName(delivery.state);
  if (stateName) {
    delivery.state = stateName; // e.g. "jharkhand" -> "Jharkhand"
  } else {
    errors.state = 'Please choose your state from the list';
  }
  if (!/^\d{6}$/.test(delivery.pincode)) errors.pincode = 'Please enter a 6-digit PIN code';

  return { delivery, errors };
}

// Reduces stock for products that have a stock number. If any product runs out at the
// last moment, everything already reduced is given back and an error is thrown.
async function reserveStock(lines) {
  const reserved = [];
  for (const line of lines) {
    const product = await Product.findById(line.product).select('stock');
    if (!product) {
      await releaseStock(reserved);
      throw httpError(404, 'One of the products is no longer available. Please update your order.');
    }
    if (typeof product.stock !== 'number') {
      continue; // the seller did not set a stock number
    }
    const result = await Product.updateOne(
      { _id: line.product, stock: { $gte: line.quantity } },
      { $inc: { stock: -line.quantity } }
    );
    if (result.modifiedCount === 0) {
      await releaseStock(reserved);
      throw httpError(409, `Sorry, "${line.name}" just went out of stock. Please update your order.`);
    }
    reserved.push(line);
  }
  return reserved;
}

// Gives stock back (used when an order fails or is cancelled)
async function releaseStock(lines) {
  for (const line of lines) {
    await Product.updateOne({ _id: line.product, stock: { $ne: null } }, { $inc: { stock: line.quantity } });
  }
}

// TM + date + random code, for example TM261014-4F7A2C
function createOrderNumber() {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  return `TM${date}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

/* ------------------------------------------------------------------ */
/* Controllers                                                         */
/* ------------------------------------------------------------------ */

// @route  GET /api/orders/fee-rules   (public - lets the website explain the platform and delivery charges)
function getFeeRules(req, res) {
  res.json({ success: true, ...getPlatformFeeRules(), delivery: getDeliveryRules() });
}

// @route  GET /api/orders/places   (public - states and districts for the checkout address form)
function getPlaces(req, res) {
  res.json({ success: true, ...getPlaceNames() });
}

// @route  GET /api/orders/delivery-estimate?product=<id>&district=Dhanbad&state=Jharkhand
// @access Public. Delivery charge from the product's seller to a place (shown on the product page).
async function getDeliveryEstimate(req, res) {
  const productId = cleanString(req.query.product);
  const product = isValidObjectId(productId)
    ? await Product.findOne({ _id: productId, hidden: { $ne: true } }).select('seller')
    : null;
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const seller = await Seller.findById(product.seller).select('district state');
  const address = readAddress(req.query);
  res.json({
    success: true,
    rules: getDeliveryRules(),
    estimate: address ? getDeliveryQuote(seller, address) : null, // null = place unknown
  });
}

// @route  POST /api/orders/quote   { items: [{ productId, quantity }], delivery: { district, state } }
// @access Logged-in buyer. Returns the price breakdown WITHOUT placing an order.
// Without a delivery address, deliveryCharge is null (the page asks for the address first).
async function getQuote(req, res) {
  const lines = await priceItems(req.body.items);
  const groups = await groupBySeller(lines, readAddress(req.body.delivery));

  const deliveryKnown = groups.every((group) => group.delivery);
  const deliveryCharge = deliveryKnown ? groups.reduce((sum, group) => sum + group.delivery.deliveryCharge, 0) : null;

  res.json({
    success: true,
    items: lines.map(({ seller, ...line }) => line),
    ...sumLines(lines, deliveryCharge || 0),
    deliveryCharge,
    // One entry per seller (each seller sends a separate parcel)
    deliveries: groups.map((group) => ({
      sellerName: group.seller ? group.seller.name : 'Seller',
      from: group.delivery ? group.delivery.from : '',
      distanceKm: group.delivery ? group.delivery.distanceKm : null,
      deliveryCharge: group.delivery ? group.delivery.deliveryCharge : null,
    })),
    feeRules: getPlatformFeeRules(),
    deliveryRules: getDeliveryRules(),
  });
}

// @route  POST /api/orders   { items: [{ productId, quantity }], delivery: {...} }
// @access Logged-in buyer
async function placeOrder(req, res) {
  const { delivery, errors } = readDelivery(req.body.delivery);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Please correct the delivery details.', errors });
  }

  const lines = await priceItems(req.body.items);

  // One order per seller, each with its own delivery charge
  const groups = await groupBySeller(lines, delivery);

  const reserved = await reserveStock(lines);
  const created = [];
  try {
    for (const group of groups) {
      const order = await Order.create({
        orderNumber: createOrderNumber(),
        buyer: req.user._id,
        seller: group.sellerId,
        items: group.lines.map(({ seller, ...line }) => line),
        ...sumLines(group.lines, group.delivery.deliveryCharge),
        deliveryCharge: group.delivery.deliveryCharge,
        deliveryDistanceKm: group.delivery.distanceKm,
        delivery,
        paymentMethod: 'cod',
      });
      created.push(order);
    }
  } catch (error) {
    // Something went wrong: undo everything so stock stays correct
    await Order.deleteMany({ _id: { $in: created.map((order) => order._id) } });
    await releaseStock(reserved);
    throw error;
  }

  // Tell each seller what to keep ready, and tell the team who ordered what
  const sellerNames = new Map(groups.map((group) => [String(group.sellerId), group.seller ? group.seller.name : '']));
  await notifyOrdersPlaced(created, req.user, sellerNames);

  const totalDelivery = created.reduce((sum, order) => sum + order.deliveryCharge, 0);
  res.status(201).json({
    success: true,
    message:
      created.length === 1
        ? `Order ${created[0].orderNumber} placed! Pay in cash when it is delivered.`
        : `${created.length} orders placed (one for each seller). Pay in cash when they are delivered.`,
    orders: created,
    ...sumLines(lines, totalDelivery),
    deliveryCharge: totalDelivery,
  });
}

// @route  GET /api/orders/mine
// @access Logged-in buyer
async function getMyOrders(req, res) {
  const orders = await Order.find({ buyer: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('seller', 'name village district state');
  res.json({ success: true, orders });
}

// @route  GET /api/orders/:id
// @access Logged-in buyer (own orders only)
async function getMyOrder(req, res) {
  const order = isValidObjectId(req.params.id)
    ? await Order.findOne({ _id: req.params.id, buyer: req.user._id }).populate('seller', 'name village district state')
    : null;
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }
  res.json({ success: true, order });
}

// @route  POST /api/orders/:id/cancel
// @access Logged-in buyer (own order, only before the seller confirms it)
async function cancelMyOrder(req, res) {
  if (!isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  // Cancel only if the order is still "placed" (checked and changed in one step, so it cannot
  // clash with the seller confirming it at the same moment)
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, buyer: req.user._id, status: 'placed' },
    { status: 'cancelled', cancelledBy: 'buyer' },
    { returnDocument: 'after' }
  );
  if (!order) {
    const exists = await Order.exists({ _id: req.params.id, buyer: req.user._id });
    return exists
      ? res.status(409).json({
          success: false,
          message: 'This order can no longer be cancelled here because the seller has already confirmed it.',
        })
      : res.status(404).json({ success: false, message: 'Order not found.' });
  }
  await releaseStock(order.items);
  await notifyOrderCancelledByBuyer(order, req.user);

  res.json({ success: true, message: `Order ${order.orderNumber} was cancelled.`, order });
}

module.exports = {
  getFeeRules,
  getPlaces,
  getDeliveryEstimate,
  getQuote,
  placeOrder,
  getMyOrders,
  getMyOrder,
  cancelMyOrder,
};
