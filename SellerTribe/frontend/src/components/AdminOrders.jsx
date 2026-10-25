// components/AdminOrders.jsx
// Team view: who ordered what (buyer, products, seller), the platform charges earned by
// Tribal Marketplace, the delivery charges, and the latest order notifications.
// "Expected" = orders that are not cancelled; "Earned" = delivered orders (cash collected).

import { useEffect, useState } from 'react';
import EmptyState from './EmptyState.jsx';
import photoIcons from '../data/photoIcons.js';
import Loading from './Loading.jsx';
import { CloseIcon, PackageIcon } from './Icons.jsx';
import { adminAPI } from '../services/api.js';
import { formatDate, formatPrice, formatTimeAgo } from '../utils/format.js';
import { STATUS_LABELS } from '../utils/orders.js';
import '../styles/orders.css';

// onUnreadChange(count) tells the Admin page how many notifications are unread (for the tab badge)
function AdminOrders({ onSessionExpired, onUnreadChange }) {
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([adminAPI.getOrders(), adminAPI.getNotifications()])
      .then(([orderData, notificationData]) => {
        setSummary(orderData.summary);
        setOrders(orderData.orders);
        setNotifications(notificationData.notifications);
        setUnreadCount(notificationData.unreadCount);
      })
      .catch((err) => {
        if (err.status === 401) onSessionExpired();
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [onSessionExpired]);

  async function markAllAsRead() {
    try {
      await adminAPI.markNotificationsRead();
      setNotifications((list) => list.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
      onUnreadChange?.(0);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <Loading text="Loading orders..." />;
  if (error) {
    return (
      <div className="alert alert-error" role="alert">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="earnings-grid">
        <div className="earnings-card is-highlight">
          <span>Platform charges earned (delivered)</span>
          <strong>{formatPrice(summary.platformFeeEarned)}</strong>
        </div>
        <div className="earnings-card">
          <span>Platform charges expected (all active orders)</span>
          <strong>{formatPrice(summary.platformFeeExpected)}</strong>
        </div>
        <div className="earnings-card">
          <span>Orders (active / total)</span>
          <strong>
            {summary.activeOrders} / {summary.totalOrders}
          </strong>
        </div>
        <div className="earnings-card">
          <span>Product sales value (active)</span>
          <strong>{formatPrice(summary.salesValue)}</strong>
        </div>
        <div className="earnings-card">
          <span>Delivery charges (active, paid to sellers)</span>
          <strong>{formatPrice(summary.deliveryCharges)}</strong>
        </div>
      </div>

      {/* Latest activity: new and cancelled orders */}
      <section className="team-notifications" aria-labelledby="team-notifications-title">
        <div className="team-notifications-header">
          <h2 id="team-notifications-title">
            Latest order notifications {unreadCount > 0 && <span className="admin-tab-count">{unreadCount} new</span>}
          </h2>
          {unreadCount > 0 && (
            <button type="button" className="btn btn-outline btn-sm" onClick={markAllAsRead}>
              Mark all as read
            </button>
          )}
        </div>
        {notifications.length === 0 ? (
          <p className="team-notifications-empty">No notifications yet. Every new or cancelled order will appear here.</p>
        ) : (
          <ul className="team-notification-list">
            {notifications.map((notification) => (
              <li key={notification._id} className={`team-notification ${notification.isRead ? '' : 'is-unread'}`}>
                <span className={`notification-icon notification-icon-${notification.type}`} aria-hidden="true">
                  {notification.type === 'order_cancelled' ? <CloseIcon size={16} /> : <PackageIcon size={16} />}
                </span>
                <span className="notification-text">
                  <strong>
                    {notification.title}
                    {!notification.isRead && <span className="visually-hidden"> (new)</span>}
                  </strong>
                  <span>{notification.message}</span>
                  <small>{formatTimeAgo(notification.createdAt)}</small>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {orders.length === 0 ? (
        <EmptyState photo={photoIcons.parcel} title="No orders yet" message="Orders placed by buyers on the marketplace will appear here." />
      ) : (
        <div className="seller-table-wrapper">
          <table className="seller-table admin-table admin-orders-table">
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Buyer</th>
                <th scope="col">Products ordered</th>
                <th scope="col">Seller</th>
                <th scope="col">Amount</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td data-label="Order">
                    <span className="admin-seller">
                      <strong>{order.orderNumber}</strong>
                      <small>{formatDate(order.createdAt)}</small>
                    </span>
                  </td>
                  <td data-label="Buyer">
                    {/* The buyer's marketplace account, and where the parcel goes */}
                    <span className="admin-seller">
                      <strong>{order.buyer?.name || order.delivery.fullName}</strong>
                      {order.buyer?.email && <small>{order.buyer.email}</small>}
                      <small>
                        Deliver to {order.delivery.fullName} · {order.delivery.phone}
                      </small>
                      <small>
                        {order.delivery.village}, {order.delivery.district}, {order.delivery.state}
                      </small>
                    </span>
                  </td>
                  <td data-label="Products ordered">
                    <ul className="admin-order-items">
                      {order.items.map((item) => (
                        <li key={item.product}>
                          <strong>{item.quantity} ×</strong> {item.name}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td data-label="Seller">
                    <span className="admin-seller">
                      <strong>{order.seller ? order.seller.name : '-'}</strong>
                      {order.seller?.district && (
                        <small>
                          {order.seller.district}, {order.seller.state}
                        </small>
                      )}
                    </span>
                  </td>
                  <td data-label="Amount">
                    <span className="admin-seller">
                      <strong>{formatPrice(order.totalAmount)}</strong>
                      <small>Platform {formatPrice(order.platformFee)}</small>
                      <small>
                        Delivery {formatPrice(order.deliveryCharge)}
                        {typeof order.deliveryDistanceKm === 'number' && ` (≈ ${order.deliveryDistanceKm} km)`}
                      </small>
                    </span>
                  </td>
                  <td data-label="Status">
                    <span className={`order-status order-status-${order.status}`}>{STATUS_LABELS[order.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default AdminOrders;
