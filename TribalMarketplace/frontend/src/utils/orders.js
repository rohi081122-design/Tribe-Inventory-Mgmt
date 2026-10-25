// utils/orders.js - shared helpers for order pages

// The normal steps of an order (a cancelled order stops early)
export const ORDER_STEPS = ['placed', 'confirmed', 'shipped', 'delivered'];

export const STATUS_LABELS = {
  placed: 'Order placed',
  confirmed: 'Confirmed by seller',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
