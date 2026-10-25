// utils/orders.js - shared helpers for order pages

export const STATUS_LABELS = {
  placed: 'New order',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// Buttons a seller sees for each status: [new status, button text]
export const SELLER_ACTIONS = {
  placed: [
    ['confirmed', 'Confirm order'],
    ['cancelled', 'Cancel order'],
  ],
  confirmed: [
    ['shipped', 'Mark as shipped'],
    ['cancelled', 'Cancel order'],
  ],
  shipped: [['delivered', 'Mark as delivered']],
  delivered: [],
  cancelled: [],
};

// The notification bell sends this browser event when new notifications arrive,
// so open pages (dashboard, orders) can load the latest orders again
export const NEW_NOTIFICATIONS_EVENT = 'sellertribe:new-notifications';
