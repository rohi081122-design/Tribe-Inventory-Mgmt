// pages/OrderDetails.jsx - one order of the logged-in buyer: /orders/:id

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ImageWithFallback from '../components/ImageWithFallback.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import pageHeaderPhotos, { headerPhotoStyle } from '../data/pageHeaderPhotos.js';
import photoIcons from '../data/photoIcons.js';
import Loading from '../components/Loading.jsx';
import { CheckIcon, MapPinIcon, StoreIcon } from '../components/Icons.jsx';
import { orderAPI } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, formatPrice } from '../utils/format.js';
import { ORDER_STEPS, STATUS_LABELS } from '../utils/orders.js';
import '../styles/orders.css';

function OrderDetails() {
  const { id } = useParams();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    orderAPI
      .getOrder(id)
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function cancelOrder() {
    setCancelling(true);
    try {
      const data = await orderAPI.cancelOrder(order._id);
      setOrder({ ...order, ...data.order, seller: order.seller });
      showToast(data.message, 'info');
      setConfirmCancel(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return <Loading text="Loading order..." fullPage />;
  }

  if (error || !order) {
    return (
      <div className="container page-section">
        <EmptyState photo={photoIcons.parcel} title="Order not found" message={error || 'This order does not exist.'}>
          <Link to="/orders" className="btn btn-primary">
            My Orders
          </Link>
        </EmptyState>
      </div>
    );
  }

  const isCancelled = order.status === 'cancelled';
  const currentStep = ORDER_STEPS.indexOf(order.status);
  const { delivery } = order;

  return (
    <div className="orders-page">
      <section className="page-header page-header-photo" style={headerPhotoStyle(pageHeaderPhotos.orders)}>
        <div className="container page-header-row">
          <div>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link> <span aria-hidden="true">/</span> <Link to="/orders">My Orders</Link>{' '}
              <span aria-hidden="true">/</span> <span>{order.orderNumber}</span>
            </nav>
            <h1>Order {order.orderNumber}</h1>
            <p>Placed on {formatDate(order.createdAt)} · Cash on Delivery</p>
          </div>
          <span className={`order-status order-status-${order.status}`}>{STATUS_LABELS[order.status]}</span>
        </div>
      </section>

      <div className="container page-section order-details-layout">
        <div className="order-details-main">
          {/* Progress of the order */}
          <section className="checkout-panel">
            <h2>Order status</h2>
            {isCancelled ? (
              <p className="order-cancelled-note">
                This order was cancelled{order.cancelledBy ? ` by the ${order.cancelledBy}` : ''}.
              </p>
            ) : (
              <ol className="order-steps">
                {ORDER_STEPS.map((step, index) => (
                  <li key={step} className={index <= currentStep ? 'is-done' : ''}>
                    <span className="order-step-dot">{index <= currentStep ? <CheckIcon size={14} /> : index + 1}</span>
                    {STATUS_LABELS[step]}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="checkout-panel">
            <h2>Products</h2>
            <ul className="summary-items">
              {order.items.map((item) => (
                <li key={item.product}>
                  <ImageWithFallback src={item.imageUrl} alt="" label="Product" width={120} className="summary-thumb" />
                  <div>
                    <Link to={`/products/${item.product}`}>
                      <strong>{item.name}</strong>
                    </Link>
                    <small>
                      {item.quantity} × {formatPrice(item.price)} = {formatPrice(item.lineTotal)}
                    </small>
                    <small className="summary-fee">+ platform charge {formatPrice(item.platformFee)}</small>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="checkout-summary">
          <h2>Payment</h2>
          <div className="summary-row">
            <span>Products</span>
            <span>{formatPrice(order.itemsTotal)}</span>
          </div>
          <div className="summary-row">
            <span>Platform charge</span>
            <span>{formatPrice(order.platformFee)}</span>
          </div>
          <div className={`summary-row ${order.deliveryCharge > 0 ? 'summary-delivery' : ''}`}>
            <span>
              Delivery charge
              {typeof order.deliveryDistanceKm === 'number' && (
                <small className="summary-row-sub">≈ {order.deliveryDistanceKm} km from the seller</small>
              )}
            </span>
            <span>
              {order.deliveryCharge > 0 || typeof order.deliveryDistanceKm !== 'number'
                ? formatPrice(order.deliveryCharge)
                : 'Free'}
            </span>
          </div>
          <div className="summary-row summary-total">
            <span>{isCancelled ? 'Total (cancelled)' : 'Total to pay on delivery'}</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>

          <h2 className="order-side-title">
            <MapPinIcon size={18} /> Delivery address
          </h2>
          <address className="order-address">
            <strong>{delivery.fullName}</strong>
            {delivery.address}
            <br />
            {delivery.village}, {delivery.district}, {delivery.state} - {delivery.pincode}
            <br />
            Mobile: {delivery.phone}
          </address>

          {order.seller && (
            <>
              <h2 className="order-side-title">
                <StoreIcon size={18} /> Seller
              </h2>
              <p className="order-address">
                <strong>{order.seller.name}</strong>
                {[order.seller.village, order.seller.district, order.seller.state].filter(Boolean).join(', ')}
              </p>
            </>
          )}

          {order.status === 'placed' && (
            <button type="button" className="btn btn-danger-outline btn-block" onClick={() => setConfirmCancel(true)}>
              Cancel order
            </button>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel this order?"
        message={`Order ${order.orderNumber} will be cancelled. You can only cancel before the seller confirms it.`}
        confirmText="Yes, cancel order"
        cancelText="Keep order"
        busy={cancelling}
        onConfirm={cancelOrder}
        onCancel={() => setConfirmCancel(false)}
      />
    </div>
  );
}

export default OrderDetails;
