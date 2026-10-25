// utils/orderNotifications.js
// Creates the bell notifications (shown on the SellerTribe website) when a buyer places or cancels an order:
//   - the SELLER learns how many of which product to keep ready
//   - the TEAM (SellerTribe /admin) learns which buyer ordered what from which seller
// A problem here must never stop the order itself, so errors are only logged.

const Notification = require('../models/Notification');

const formatRupees = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

// [{ name: 'Dokra Horse', quantity: 3 }, ...] -> "3 × Dokra Horse, 1 × Bamboo Basket"
function describeItems(items) {
  return items.map((item) => `${item.quantity} × ${item.name}`).join(', ');
}

function itemsOf(order) {
  return order.items.map(({ name, quantity }) => ({ name, quantity }));
}

async function saveNotifications(notifications) {
  try {
    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Could not save order notifications:', error.message);
  }
}

// orders: the orders just created; buyer: the logged-in user; sellerNames: Map of seller id -> seller name
async function notifyOrdersPlaced(orders, buyer, sellerNames) {
  const notifications = [];

  for (const order of orders) {
    const items = itemsOf(order);
    const itemText = describeItems(items);
    const place = `${order.delivery.district}, ${order.delivery.state}`;
    const sellerName = sellerNames.get(String(order.seller)) || 'a seller';
    const deliveryText = order.deliveryCharge > 0 ? `, delivery ${formatRupees(order.deliveryCharge)}` : '';
    const common = { seller: order.seller, type: 'order_placed', order: order._id, orderNumber: order.orderNumber, items };

    notifications.push({
      ...common,
      recipient: 'seller',
      title: `New order ${order.orderNumber}`,
      message: `${buyer.name} ordered ${itemText}. Please keep ${items.length === 1 && items[0].quantity === 1 ? 'it' : 'them'} ready for delivery to ${place}.`,
    });

    notifications.push({
      ...common,
      recipient: 'team',
      title: `New order ${order.orderNumber} for ${sellerName}`,
      message: `${buyer.name} (${buyer.email}) ordered ${itemText} from ${sellerName}. Total ${formatRupees(order.totalAmount)} (platform charge ${formatRupees(order.platformFee)}${deliveryText}). Deliver to ${place}.`,
    });
  }

  await saveNotifications(notifications);
}

// The buyer cancelled an order before the seller confirmed it
async function notifyOrderCancelledByBuyer(order, buyer) {
  const items = itemsOf(order);
  const itemText = describeItems(items);
  const common = { seller: order.seller, type: 'order_cancelled', order: order._id, orderNumber: order.orderNumber, items };

  await saveNotifications([
    {
      ...common,
      recipient: 'seller',
      title: `Order ${order.orderNumber} was cancelled`,
      message: `${buyer.name} cancelled the order for ${itemText}. You do not need to keep it ready any more - the stock was added back.`,
    },
    {
      ...common,
      recipient: 'team',
      title: `Order ${order.orderNumber} cancelled by the buyer`,
      message: `${buyer.name} (${buyer.email}) cancelled the order for ${itemText}.`,
    },
  ]);
}

module.exports = { notifyOrdersPlaced, notifyOrderCancelledByBuyer };
