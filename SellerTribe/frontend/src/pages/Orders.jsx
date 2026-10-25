// pages/Orders.jsx
// Orders that buyers placed on the marketplace for this seller's products.
// The seller moves each order along:  New order -> Confirmed -> Shipped -> Delivered  (or cancels it).
// Payment is Cash on Delivery: the seller collects the total from the buyer, keeps the product amount
// and the delivery charge (for sending the parcel far away); the platform charge belongs to Tribal Marketplace.
// The list loads again by itself when the notification bell reports a new order.

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ImageWithFallback from '../components/ImageWithFallback.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import DemandPanel from '../components/DemandPanel.jsx';
import EmptyState from '../components/EmptyState.jsx';
import photoIcons from '../data/photoIcons.js';
import Loading from '../components/Loading.jsx';
import { MapPinIcon, PackageIcon, UserIcon } from '../components/Icons.jsx';
import { orderAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, formatPrice } from '../utils/format.js';
import { NEW_NOTIFICATIONS_EVENT, SELLER_ACTIONS, STATUS_LABELS } from '../utils/orders.js';
import pageHeaderPhotos, { headerPhotoStyle } from '../data/pageHeaderPhotos.js';
import '../styles/seller.css';
import '../styles/orders.css';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'placed', label: 'New' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

function Orders() {
  const { isApproved } = useAuth();
  const { showToast } = useToast();

  const [filter, setFilter] = useState('');
  const [orders, setOrders] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyOrderId, setBusyOrderId] = useState('');
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [demandVersion, setDemandVersion] = useState(0); // changes after a status change, so the 'Keep ready' list reloads

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await orderAPI.getMyOrders(filter);
      setOrders(data.orders);
      setStatusCounts(data.statusCounts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadOrders();
    window.addEventListener(NEW_NOTIFICATIONS_EVENT, loadOrders);
    return () => window.removeEventListener(NEW_NOTIFICATIONS_EVENT, loadOrders);
  }, [loadOrders]);

  async function changeStatus(order, status) {
    setBusyOrderId(order._id);
    try {
      const data = await orderAPI.updateStatus(order._id, status);
      showToast(data.message, status === 'cancelled' ? 'info' : 'success');
      setOrderToCancel(null);
      setDemandVersion((version) => version + 1);
      await loadOrders();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusyOrderId('');
    }
  }

  const totalCount = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="seller-page">
      <section className="page-header page-header-photo" style={headerPhotoStyle(pageHeaderPhotos.orders)}>
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Dashboard</Link> <span aria-hidden="true">/</span> <span>Orders</span>
          </nav>
          <h1>Orders</h1>
          <p>Orders from buyers for your products. Payment is Cash on Delivery.</p>
        </div>
      </section>

      <div className="container page-section">
        <DemandPanel showOrdersLink={false} refreshKey={demandVersion} />

        <div className="tab-row" role="tablist" aria-label="Filter orders">
          {FILTERS.map((item) => {
            const count = item.value ? statusCounts[item.value] || 0 : totalCount;
            return (
              <button
                key={item.value || 'all'}
                type="button"
                role="tab"
                aria-selected={filter === item.value}
                className={`chip ${filter === item.value ? 'is-active' : ''}`}
                onClick={() => setFilter(item.value)}
              >
                {item.label} <span className="chip-count">{count}</span>
              </button>
            );
          })}
        </div>

        {!isApproved && (
          <div className="alert alert-warning">Your account is not approved, so you can see orders but not change them.</div>
        )}
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}
        {loading && <Loading text="Loading orders..." />}

        {!loading && !error && orders.length === 0 && (
          <EmptyState
            photo={photoIcons.parcel}
            title={filter ? `No ${STATUS_LABELS[filter].toLowerCase()} orders` : 'No orders yet'}
            message="When a buyer orders one of your products on the marketplace, it appears here."
          />
        )}

        <ul className="seller-order-list">
          {orders.map((order) => (
            <li key={order._id} className="seller-order-card">
              <div className="seller-order-header">
                <div>
                  <strong>Order {order.orderNumber}</strong>
                  <small>{formatDate(order.createdAt)}</small>
                </div>
                <span className={`order-status order-status-${order.status}`}>{STATUS_LABELS[order.status]}</span>
              </div>

              <div className="seller-order-body">
                <div className="seller-order-items">
                  {order.items.map((item) => (
                    <div key={item.product} className="seller-order-item">
                      <ImageWithFallback src={item.imageUrl} alt="" label="Photo" width={120} className="order-thumb" />
                      <span>
                        {item.name}
                        <small>
                          {item.quantity} × {formatPrice(item.price)} = {formatPrice(item.lineTotal)}
                        </small>
                      </span>
                    </div>
                  ))}
                </div>

                <div className="seller-order-delivery">
                  <span className="seller-order-label">Deliver to</span>
                  <p>
                    <UserIcon size={14} /> <strong>{order.delivery.fullName}</strong> · {order.delivery.phone}
                  </p>
                  <p>
                    <MapPinIcon size={14} /> {order.delivery.address}, {order.delivery.village}, {order.delivery.district},{' '}
                    {order.delivery.state} - {order.delivery.pincode}
                  </p>
                </div>

                <div className="seller-order-money">
                  <div>
                    <span>Collect from buyer (cash)</span>
                    <strong>{formatPrice(order.totalAmount)}</strong>
                  </div>
                  <div>
                    <span>Your earning (products)</span>
                    <span>{formatPrice(order.itemsTotal)}</span>
                  </div>
                  <div>
                    <span>
                      Delivery charge
                      {typeof order.deliveryDistanceKm === 'number' && <small> (≈ {order.deliveryDistanceKm} km away)</small>}
                    </span>
                    <span>
                      {order.deliveryCharge > 0 || typeof order.deliveryDistanceKm !== 'number'
                        ? formatPrice(order.deliveryCharge)
                        : 'Free (nearby)'}
                    </span>
                  </div>
                  <div>
                    <span>Platform charge (Tribal Marketplace)</span>
                    <span>{formatPrice(order.platformFee)}</span>
                  </div>
                </div>
              </div>

              {isApproved && SELLER_ACTIONS[order.status].length > 0 && (
                <div className="seller-order-actions">
                  {SELLER_ACTIONS[order.status].map(([status, label]) =>
                    status === 'cancelled' ? (
                      <button
                        key={status}
                        type="button"
                        className="btn btn-danger-outline btn-sm"
                        onClick={() => setOrderToCancel(order)}
                        disabled={busyOrderId === order._id}
                      >
                        {label}
                      </button>
                    ) : (
                      <button
                        key={status}
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => changeStatus(order, status)}
                        disabled={busyOrderId === order._id}
                      >
                        <PackageIcon size={16} /> {busyOrderId === order._id ? 'Saving...' : label}
                      </button>
                    )
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <ConfirmDialog
        open={Boolean(orderToCancel)}
        title="Cancel this order?"
        message={
          orderToCancel
            ? `Order ${orderToCancel.orderNumber} will be cancelled and the stock will be added back to your products.`
            : ''
        }
        confirmText="Yes, cancel order"
        cancelText="Keep order"
        busy={Boolean(busyOrderId)}
        onConfirm={() => changeStatus(orderToCancel, 'cancelled')}
        onCancel={() => setOrderToCancel(null)}
      />
    </div>
  );
}

export default Orders;
