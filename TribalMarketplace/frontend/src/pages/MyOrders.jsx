// pages/MyOrders.jsx - all orders of the logged-in buyer

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ImageWithFallback from '../components/ImageWithFallback.jsx';
import EmptyState from '../components/EmptyState.jsx';
import pageHeaderPhotos, { headerPhotoStyle } from '../data/pageHeaderPhotos.js';
import photoIcons from '../data/photoIcons.js';
import Loading from '../components/Loading.jsx';
import { orderAPI } from '../services/api.js';
import { formatDate, formatPrice } from '../utils/format.js';
import { STATUS_LABELS } from '../utils/orders.js';
import '../styles/orders.css';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    orderAPI
      .getMyOrders()
      .then((data) => setOrders(data.orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="orders-page">
      <section className="page-header page-header-photo" style={headerPhotoStyle(pageHeaderPhotos.orders)}>
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>My Orders</span>
          </nav>
          <h1>My Orders</h1>
          <p>Track your orders. All orders are paid with Cash on Delivery.</p>
        </div>
      </section>

      <div className="container page-section">
        {loading && <Loading text="Loading your orders..." />}
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <EmptyState photo={photoIcons.parcel} title="You have no orders yet" message="When you buy a product, your order will appear here.">
            <Link to="/products" className="btn btn-primary">
              Start shopping
            </Link>
          </EmptyState>
        )}

        <ul className="order-list">
          {orders.map((order) => (
            <li key={order._id} className="order-card">
              <div className="order-card-header">
                <div>
                  <strong>Order {order.orderNumber}</strong>
                  <small>
                    Placed on {formatDate(order.createdAt)}
                    {order.seller && ` · Sold by ${order.seller.name}`}
                  </small>
                </div>
                <span className={`order-status order-status-${order.status}`}>{STATUS_LABELS[order.status]}</span>
              </div>

              <div className="order-card-items">
                {order.items.map((item) => (
                  <div key={item.product} className="order-card-item">
                    <ImageWithFallback src={item.imageUrl} alt="" label="Product" width={120} className="order-thumb" />
                    <span>
                      {item.name}
                      <small>Qty {item.quantity}</small>
                    </span>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <span>
                  Total <strong>{formatPrice(order.totalAmount)}</strong>
                  <small>
                    {' '}
                    (incl. platform charge {formatPrice(order.platformFee)}
                    {order.deliveryCharge > 0 && `, delivery ${formatPrice(order.deliveryCharge)}`})
                  </small>
                </span>
                <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">
                  View details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default MyOrders;
