// pages/Checkout.jsx
// Checkout for logged-in buyers.
//   /checkout?product=<id>&qty=2   -> "Buy Now": just one product
//   /checkout                      -> everything in the cart
//
// The price breakdown (product price + platform charge + delivery charge) comes from the BACKEND,
// so it always matches what is saved in the order. The delivery charge depends on how far the
// delivery district is from each seller, so it is asked for again when the district or state changes.
// Payment: Cash on Delivery.

import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ImageWithFallback from '../components/ImageWithFallback.jsx';
import EmptyState from '../components/EmptyState.jsx';
import photoIcons from '../data/photoIcons.js';
import pageHeaderPhotos, { headerPhotoStyle } from '../data/pageHeaderPhotos.js';
import Loading from '../components/Loading.jsx';
import { CheckIcon, InfoIcon } from '../components/Icons.jsx';
import { orderAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatPrice } from '../utils/format.js';
import '../styles/orders.css';

// Browser-side checks of the delivery form (the backend checks again)
function validateDelivery(values) {
  const errors = {};
  if (values.fullName.trim().length < 2) errors.fullName = 'Please enter the full name';
  if (!/^\d{10}$/.test(values.phone.replace(/[\s-]/g, '').replace(/^\+91/, ''))) errors.phone = 'Please enter a 10-digit mobile number';
  if (values.address.trim().length < 5) errors.address = 'Please enter the house / street address';
  if (values.village.trim().length < 2) errors.village = 'Please enter the village or town';
  if (values.district.trim().length < 2) errors.district = 'Please enter the district';
  if (!values.state.trim()) errors.state = 'Please choose the state';
  if (!/^\d{6}$/.test(values.pincode.trim())) errors.pincode = 'Please enter a 6-digit PIN code';
  return errors;
}

function Checkout() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { cartItems, removeManyFromCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // "Buy Now" (one product) or the whole cart
  const buyNowProductId = searchParams.get('product');
  const buyNowQuantity = Math.max(1, Number(searchParams.get('qty')) || 1);
  const isBuyNow = Boolean(buyNowProductId);
  const items = isBuyNow
    ? [{ productId: buyNowProductId, quantity: buyNowQuantity }]
    : cartItems.filter((item) => !item.unavailable).map((item) => ({ productId: item.productId, quantity: item.quantity }));
  const itemsKey = JSON.stringify(items); // the quote is loaded again only when the items change

  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteError, setQuoteError] = useState('');

  const [delivery, setDelivery] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    village: user?.village || '',
    district: user?.district || '',
    state: user?.state || 'Jharkhand',
    pincode: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [placing, setPlacing] = useState(false);

  // States and districts for the address form ({ states: [...], districts: { Jharkhand: [...] } })
  const [places, setPlaces] = useState(null);
  useEffect(() => {
    orderAPI
      .getPlaces()
      .then((data) => {
        setPlaces(data);
        // Match the saved state to the list ("jharkhand" -> "Jharkhand"), or leave it empty to choose
        setDelivery((current) => {
          const match = data.states.find((name) => name.toLowerCase() === current.state.trim().toLowerCase());
          return { ...current, state: match || '' };
        });
      })
      .catch(() => setPlaces(null)); // the state stays a normal text box
  }, []);

  // The delivery charge depends on the district and state. Wait until the buyer stops typing
  // for half a second before asking the backend again.
  const [quoteAddress, setQuoteAddress] = useState({ district: delivery.district, state: delivery.state });
  useEffect(() => {
    const timerId = setTimeout(() => {
      setQuoteAddress({ district: delivery.district.trim(), state: delivery.state.trim() });
    }, 500);
    return () => clearTimeout(timerId);
  }, [delivery.district, delivery.state]);
  const addressKey = JSON.stringify(quoteAddress);

  // Ask the backend for the price breakdown
  useEffect(() => {
    const itemsToQuote = JSON.parse(itemsKey);
    if (itemsToQuote.length === 0) {
      setQuoteLoading(false);
      return;
    }
    let ignore = false;
    setQuoteLoading(true);
    setQuoteError('');
    orderAPI
      .getQuote(itemsToQuote, JSON.parse(addressKey))
      .then((data) => {
        if (!ignore) setQuote(data);
      })
      .catch((err) => {
        if (!ignore) setQuoteError(err.message);
      })
      .finally(() => {
        if (!ignore) setQuoteLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [itemsKey, addressKey]);

  // True while the shown delivery charge is for an older address (the buyer is still typing)
  const quoteIsOutdated =
    quoteAddress.district !== delivery.district.trim() || quoteAddress.state !== delivery.state.trim();

  function handleChange(event) {
    const { name, value } = event.target;
    setDelivery((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  }

  async function handlePlaceOrder(event) {
    event.preventDefault();
    if (placing) return; // prevents placing the same order twice

    const formErrors = validateDelivery(delivery);
    setErrors(formErrors);
    setServerError('');
    if (Object.keys(formErrors).length > 0) {
      setServerError('Please correct the delivery details.');
      return;
    }

    setPlacing(true);
    try {
      const data = await orderAPI.placeOrder(items, delivery);
      // Ordered products leave the cart
      if (!isBuyNow) {
        removeManyFromCart(items.map((item) => item.productId));
      }
      showToast(data.message);
      navigate(data.orders.length === 1 ? `/orders/${data.orders[0]._id}` : '/orders', { replace: true });
    } catch (err) {
      setServerError(err.message);
      setErrors(err.errors || {});
      setPlacing(false);
    }
  }

  // list = id of a <datalist> with suggestions (used for the district)
  function renderField(name, label, { placeholder, inputMode, autoComplete, maxLength, list, wide = false } = {}) {
    return (
      <div className={`form-group ${wide ? 'form-group-wide' : ''}`}>
        <label htmlFor={name} className="form-label">
          {label} <span className="required">*</span>
        </label>
        <input
          id={name}
          name={name}
          className={`form-control ${errors[name] ? 'has-error' : ''}`}
          value={delivery[name]}
          onChange={handleChange}
          placeholder={placeholder}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          list={list}
        />
        {errors[name] && <p className="form-error">{errors[name]}</p>}
      </div>
    );
  }

  // The state is chosen from a list, so the delivery distance can always be worked out
  function renderStateField() {
    if (!places) {
      return renderField('state', 'State', { autoComplete: 'address-level1' });
    }
    return (
      <div className="form-group">
        <label htmlFor="state" className="form-label">
          State <span className="required">*</span>
        </label>
        <select
          id="state"
          name="state"
          className={`form-control ${errors.state ? 'has-error' : ''}`}
          value={delivery.state}
          onChange={handleChange}
          autoComplete="address-level1"
        >
          <option value="">Choose your state</option>
          {places.states.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        {errors.state && <p className="form-error">{errors.state}</p>}
      </div>
    );
  }

  const districtSuggestions = (places && places.districts[delivery.state]) || [];
  const deliveryRules = quote?.deliveryRules;

  if (items.length === 0) {
    return (
      <div className="container page-section">
        <EmptyState photo={photoIcons.emptyBasket} title="Nothing to check out" message="Add products to your cart or use Buy Now on a product page.">
          <Link to="/products" className="btn btn-primary">
            Browse products
          </Link>
        </EmptyState>
      </div>
    );
  }

  if (quoteLoading && !quote) {
    return <Loading text="Calculating your total..." fullPage />;
  }

  return (
    <div className="checkout-page">
      <section className="page-header page-header-photo" style={headerPhotoStyle(pageHeaderPhotos.checkout)}>
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link> <span aria-hidden="true">/</span>
            {!isBuyNow && (
              <>
                <Link to="/cart">Cart</Link> <span aria-hidden="true">/</span>
              </>
            )}
            <span>Checkout</span>
          </nav>
          <h1>Checkout</h1>
          <p>Check your order, enter the delivery address and place your order.</p>
        </div>
      </section>

      <div className="container page-section">
        {quoteError ? (
          <div className="alert alert-error" role="alert">
            <span>
              {quoteError} <Link to={isBuyNow ? `/products/${buyNowProductId}` : '/cart'}>Go back</Link>
            </span>
          </div>
        ) : (
          <form className="checkout-layout" onSubmit={handlePlaceOrder} noValidate>
            {/* ----- Delivery address + payment ----- */}
            <section className="checkout-panel" aria-labelledby="delivery-title">
              <h2 id="delivery-title">1. Delivery address</h2>
              {serverError && (
                <div className="alert alert-error" role="alert">
                  {serverError}
                </div>
              )}
              <div className="checkout-fields">
                {renderField('fullName', 'Full name', { autoComplete: 'name', wide: true })}
                {renderField('phone', 'Mobile number', { placeholder: '10-digit number', inputMode: 'numeric', autoComplete: 'tel', maxLength: 14 })}
                {renderField('pincode', 'PIN code', { placeholder: '6 digits', inputMode: 'numeric', autoComplete: 'postal-code', maxLength: 6 })}
                {renderField('address', 'House no., street, landmark', { autoComplete: 'street-address', wide: true, maxLength: 200 })}
                {renderField('village', 'Village / Town', { autoComplete: 'address-level3' })}
                {renderField('district', 'District', { autoComplete: 'address-level2', list: 'district-suggestions' })}
                {renderStateField()}
              </div>
              {/* Suggestions while typing the district (any other district can still be typed) */}
              <datalist id="district-suggestions">
                {districtSuggestions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>

              <h2 className="checkout-step-title">2. Payment</h2>
              <label className="payment-option is-selected">
                <input type="radio" name="payment" value="cod" checked readOnly />
                <span>
                  <strong>Cash on Delivery</strong>
                  <small>Pay in cash when the order is delivered.</small>
                </span>
                <CheckIcon size={20} />
              </label>
              <p className="form-hint">Online payment (UPI / card) will be added later.</p>
            </section>

            {/* ----- Order summary ----- */}
            <aside className="checkout-summary" aria-labelledby="summary-title">
              <h2 id="summary-title">Order summary</h2>
              <ul className="summary-items">
                {quote?.items.map((item) => (
                  <li key={item.product}>
                    <ImageWithFallback src={item.imageUrl} alt="" label="Product" width={120} className="summary-thumb" />
                    <div>
                      <strong>{item.name}</strong>
                      <small>
                        {item.quantity} × {formatPrice(item.price)} = {formatPrice(item.lineTotal)}
                      </small>
                      <small className="summary-fee">+ platform charge {formatPrice(item.platformFee)}</small>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="summary-row">
                <span>Products</span>
                <span>{formatPrice(quote?.itemsTotal)}</span>
              </div>
              <div className="summary-row">
                <span>
                  Platform charge
                  {quote?.feeRules && (
                    <small>
                      {' '}
                      ({quote.feeRules.percent}% per product, min {formatPrice(quote.feeRules.minimum)})
                    </small>
                  )}
                </span>
                <span>{formatPrice(quote?.platformFee)}</span>
              </div>

              {/* Delivery: free near the seller, charged per km when the address is farther away */}
              <div className={`summary-row ${quote?.deliveryCharge > 0 ? 'summary-delivery' : ''}`}>
                <span>
                  Delivery charge
                  {quote?.deliveries?.length === 1 && typeof quote.deliveries[0].distanceKm === 'number' && (
                    <small className="summary-row-sub">≈ {quote.deliveries[0].distanceKm} km from the seller</small>
                  )}
                </span>
                <span>
                  {quoteLoading || quoteIsOutdated
                    ? 'Updating...'
                    : quote?.deliveryCharge === null
                      ? 'Enter your address'
                      : quote?.deliveryCharge > 0
                        ? formatPrice(quote.deliveryCharge)
                        : 'Free'}
                </span>
              </div>
              {/* Several sellers: each one sends a separate parcel with its own delivery charge */}
              {quote?.deliveries?.length > 1 && quote.deliveryCharge !== null && (
                <ul className="summary-deliveries">
                  {quote.deliveries.map((item, index) => (
                    <li key={index}>
                      <span>
                        {item.sellerName} (≈ {item.distanceKm} km)
                      </span>
                      <span>{item.deliveryCharge > 0 ? formatPrice(item.deliveryCharge) : 'Free'}</span>
                    </li>
                  ))}
                </ul>
              )}
              {deliveryRules && (
                <p className="summary-delivery-note">
                  Free delivery within {deliveryRules.freeZoneKm} km of the seller. Farther away:{' '}
                  {formatPrice(deliveryRules.perKm)} per km beyond {deliveryRules.freeZoneKm} km (min{' '}
                  {formatPrice(deliveryRules.minimum)}, max {formatPrice(deliveryRules.maximum)}).
                </p>
              )}

              <div className="summary-row summary-total">
                <span>Total to pay</span>
                <span>{formatPrice(quote?.totalAmount)}</span>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg btn-block"
                disabled={placing || quoteLoading || quoteIsOutdated || !quote}
              >
                {placing ? 'Placing order...' : `Place Order · ${formatPrice(quote?.totalAmount)}`}
              </button>

              <p className="summary-note">
                <InfoIcon size={16} /> The platform charge supports Tribal Marketplace. Products from different sellers are
                delivered as separate orders, each with its own delivery charge.
              </p>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
}

export default Checkout;
