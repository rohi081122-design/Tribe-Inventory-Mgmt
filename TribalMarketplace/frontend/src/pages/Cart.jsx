// pages/Cart.jsx
// The logged-in buyer's cart. Prices are refreshed from the backend when the page opens.
// "Proceed to Checkout" opens the checkout page, where the order is placed.

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useFeeRules from '../hooks/useFeeRules.js';
import ImageWithFallback from '../components/ImageWithFallback.jsx';
import EmptyState from '../components/EmptyState.jsx';
import pageHeaderPhotos, { headerPhotoStyle } from '../data/pageHeaderPhotos.js';
import photoIcons from '../data/photoIcons.js';
import { InfoIcon, MinusIcon, PlusIcon, TrashIcon } from '../components/Icons.jsx';
import { useCart } from '../context/CartContext.jsx';
import { productAPI } from '../services/api.js';
import { formatPrice } from '../utils/format.js';
import '../styles/cart.css';

function Cart() {
  const { cartItems, cartCount, subtotal, updateQuantity, removeFromCart, clearCart, refreshCartItems, getMaxQuantity } =
    useCart();
  const [refreshError, setRefreshError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const feeRules = useFeeRules();

  // Product ids in the cart, as text (so the effect runs only when the set of products changes)
  const productIds = cartItems.map((item) => item.productId).join(',');

  // Get the latest name / price / stock of every cart product from the backend
  useEffect(() => {
    if (!productIds) return;
    setRefreshing(true);
    productAPI
      .getProducts({ ids: productIds, limit: 48 })
      .then((data) => {
        refreshCartItems(data.products);
        setRefreshError('');
      })
      .catch((error) => setRefreshError(`Could not refresh prices: ${error.message}`))
      .finally(() => setRefreshing(false));
    // refreshCartItems is recreated on every render, so it is intentionally left out of the list
  }, [productIds]);

  if (cartItems.length === 0) {
    return (
      <div className="container page-section">
        <EmptyState photo={photoIcons.emptyBasket} title="Your cart is empty" message="Explore handmade products and add the ones you like.">
          <Link to="/products" className="btn btn-primary">
            Start shopping
          </Link>
          <Link to="/categories" className="btn btn-outline">
            Browse categories
          </Link>
        </EmptyState>
      </div>
    );
  }

  const hasUnavailableItems = cartItems.some((item) => item.unavailable);

  return (
    <div className="cart-page">
      <section className="page-header page-header-photo" style={headerPhotoStyle(pageHeaderPhotos.cart)}>
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>Cart</span>
          </nav>
          <h1>Your Cart</h1>
          <p>
            {cartCount} {cartCount === 1 ? 'item' : 'items'}
            {refreshing && ' · checking latest prices...'}
          </p>
        </div>
      </section>

      <div className="container page-section cart-layout">
        <section className="cart-items" aria-label="Cart items">
          {refreshError && <div className="alert alert-warning">{refreshError}</div>}
          {hasUnavailableItems && (
            <div className="alert alert-warning">
              Some products are no longer available and are not counted in the subtotal. You can remove them.
            </div>
          )}

          <ul className="cart-list">
            {cartItems.map((item) => {
              const maxQuantity = getMaxQuantity(item.stock);
              return (
                <li key={item.productId} className={`cart-item ${item.unavailable ? 'is-unavailable' : ''}`}>
                  <Link to={`/products/${item.productId}`} className="cart-item-image" tabIndex={-1} aria-hidden="true">
                    <ImageWithFallback src={item.imageUrl} alt="" label="Product" width={200} />
                  </Link>

                  <div className="cart-item-info">
                    <Link to={`/products/${item.productId}`} className="cart-item-name">
                      {item.name}
                    </Link>
                    <span className="cart-item-price">{formatPrice(item.price)} each</span>
                    {item.unavailable && <span className="cart-item-warning">Currently unavailable</span>}
                    {typeof item.stock === 'number' && item.stock > 0 && (
                      <span className="cart-item-stock">{item.stock} in stock</span>
                    )}
                  </div>

                  <div className="cart-item-controls">
                    <div className="quantity-selector quantity-selector-sm" role="group" aria-label={`Quantity of ${item.name}`}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1 || item.unavailable}
                        aria-label="Decrease quantity"
                      >
                        <MinusIcon size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= maxQuantity || item.unavailable}
                        aria-label="Increase quantity"
                      >
                        <PlusIcon size={14} />
                      </button>
                    </div>

                    <span className="cart-item-total">
                      {item.unavailable ? '—' : formatPrice(item.price * item.quantity)}
                    </span>

                    <button
                      type="button"
                      className="icon-button icon-button-danger"
                      onClick={() => removeFromCart(item.productId)}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <TrashIcon size={18} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="cart-list-footer">
            <Link to="/products" className="btn btn-outline btn-sm">
              ← Continue shopping
            </Link>
            <button type="button" className="btn btn-ghost btn-sm" onClick={clearCart}>
              Clear cart
            </button>
          </div>
        </section>

        <aside className="cart-summary" aria-label="Cart summary">
          <h2>Summary</h2>
          <div className="cart-summary-row">
            <span>Items</span>
            <span>{cartCount}</span>
          </div>
          <div className="cart-summary-row cart-summary-total">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {feeRules && (
            <p className="cart-summary-note">
              A platform charge of {feeRules.percent}% per product (minimum {formatPrice(feeRules.minimum)}) is added at
              checkout.
            </p>
          )}
          {feeRules?.delivery && (
            <p className="cart-summary-note">
              Delivery is free within {feeRules.delivery.freeZoneKm} km of the seller. For addresses farther away, a
              delivery charge of {formatPrice(feeRules.delivery.perKm)} per km beyond {feeRules.delivery.freeZoneKm} km
              (min {formatPrice(feeRules.delivery.minimum)}, max {formatPrice(feeRules.delivery.maximum)}) is added at
              checkout.
            </p>
          )}

          <button
            type="button"
            className="btn btn-primary btn-lg btn-block"
            onClick={() => navigate('/checkout')}
            disabled={subtotal === 0}
          >
            Proceed to Checkout
          </button>

          <div className="cart-notice">
            <InfoIcon size={18} />
            <p>
              Payment: <strong>Cash on Delivery</strong>. You will see the full total, including the platform charge and
              any delivery charge, before you place the order.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Cart;
