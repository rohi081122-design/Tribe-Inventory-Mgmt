// components/DemandPanel.jsx
// "Keep ready for delivery": for each product, how many pieces buyers have ordered in orders that
// are not shipped yet (new + confirmed). The seller can prepare exactly that many.
// Loads again by itself when the notification bell reports a new order.

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ImageWithFallback from './ImageWithFallback.jsx';
import { PackageIcon } from './Icons.jsx';
import { orderAPI } from '../services/api.js';
import { NEW_NOTIFICATIONS_EVENT } from '../utils/orders.js';

// refreshKey: when this number changes, the list loads again (the Orders page changes it after a status change)
function DemandPanel({ showOrdersLink = true, refreshKey = 0 }) {
  const [items, setItems] = useState([]);
  const [totalPieces, setTotalPieces] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDemand = useCallback(async () => {
    try {
      const data = await orderAPI.getDemand();
      setItems(data.items);
      setTotalPieces(data.totalPieces);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDemand();
    window.addEventListener(NEW_NOTIFICATIONS_EVENT, loadDemand);
    return () => window.removeEventListener(NEW_NOTIFICATIONS_EVENT, loadDemand);
  }, [loadDemand, refreshKey]);

  return (
    <section className="dashboard-panel demand-panel" aria-labelledby="demand-title">
      <div className="dashboard-panel-header">
        <div>
          <h2 id="demand-title">
            <PackageIcon size={22} /> Keep ready for delivery
          </h2>
          <p className="demand-intro">
            {items.length > 0
              ? `Buyers are waiting for ${totalPieces} ${totalPieces === 1 ? 'piece' : 'pieces'}. Prepare these for your new and confirmed orders.`
              : 'Products from your new and confirmed orders appear here, so you know how much to prepare.'}
          </p>
        </div>
        {showOrdersLink && (
          <Link to="/orders" className="btn btn-outline btn-sm">
            View orders
          </Link>
        )}
      </div>

      {loading && <p className="demand-empty">Loading...</p>}
      {!loading && error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}
      {!loading && !error && items.length === 0 && <p className="demand-empty">No orders are waiting right now.</p>}

      {items.length > 0 && (
        <ul className="demand-list">
          {items.map((item) => (
            <li key={item.product} className="demand-item">
              <ImageWithFallback src={item.imageUrl} alt="" label="Photo" width={120} className="demand-thumb" />
              <div className="demand-info">
                <strong>{item.name}</strong>
                <small>
                  {item.orders} {item.orders === 1 ? 'order' : 'orders'}
                  {item.newOrders > 0 && ` · ${item.newOrders} new`}
                  {item.stockLeft !== null && ` · ${item.stockLeft} more in stock`}
                </small>
              </div>
              <span className="demand-quantity">
                <strong>{item.quantity}</strong>
                <small>{item.quantity === 1 ? 'piece' : 'pieces'}</small>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default DemandPanel;
