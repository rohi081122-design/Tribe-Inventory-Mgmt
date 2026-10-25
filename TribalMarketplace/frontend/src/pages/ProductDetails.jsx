// pages/ProductDetails.jsx
// One product: /products/:id

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ProductGallery from '../components/ProductGallery.jsx';
import LikeButton from '../components/LikeButton.jsx';
import ShareButton from '../components/ShareButton.jsx';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import photoIcons from '../data/photoIcons.js';
import ProductGrid from '../components/ProductGrid.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { CartIcon, CheckIcon, MapPinIcon, MinusIcon, PlusIcon, StoreIcon } from '../components/Icons.jsx';
import { orderAPI, productAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import useFeeRules, { estimatePlatformFee } from '../hooks/useFeeRules.js';
import { formatDate, formatPrice, getInitials, getProductLocation, getStockInfo } from '../utils/format.js';
import '../styles/products.css';

function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart, getMaxQuantity } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const currentLocation = useLocation();
  const feeRules = useFeeRules();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [related, setRelated] = useState([]);
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);

  // Load the product whenever the id in the URL changes
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');
    setNotFound(false);
    setQuantity(1);
    setAddedToCart(false);

    productAPI
      .getProduct(id)
      .then((data) => {
        if (!ignore) setProduct(data.product);
      })
      .catch((err) => {
        if (ignore) return;
        if (err.status === 404 || err.status === 400) setNotFound(true);
        else setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  // Delivery charge from the seller to the buyer's own district (saved in their account).
  // Visitors who are not logged in see the delivery rules instead.
  const buyerDistrict = user?.district || '';
  const buyerState = user?.state || '';
  useEffect(() => {
    if (!buyerDistrict && !buyerState) {
      setDeliveryEstimate(null);
      return undefined;
    }
    let ignore = false;
    orderAPI
      .getDeliveryEstimate(id, buyerDistrict, buyerState)
      .then((data) => {
        if (!ignore) setDeliveryEstimate(data.estimate);
      })
      .catch(() => {
        if (!ignore) setDeliveryEstimate(null);
      });
    return () => {
      ignore = true;
    };
  }, [id, buyerDistrict, buyerState]);

  // Load a few other products from the same category
  const categorySlug = product?.category?.slug;
  useEffect(() => {
    if (!categorySlug) {
      setRelated([]);
      return;
    }
    productAPI
      .getProducts({ category: categorySlug, limit: 5 })
      .then((data) => setRelated(data.products.filter((item) => item._id !== id).slice(0, 4)))
      .catch(() => setRelated([]));
  }, [categorySlug, id]);

  if (loading) {
    return <Loading text="Loading product..." fullPage />;
  }

  if (notFound) {
    return (
      <div className="container page-section">
        <EmptyState
          photo={photoIcons.streetMarket}
          title="Product not found"
          message="This product does not exist or has been removed by the seller."
        >
          <Link to="/products" className="btn btn-primary">
            Browse products
          </Link>
        </EmptyState>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container page-section">
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      </div>
    );
  }

  const stockInfo = getStockInfo(product.stock);
  const isOutOfStock = stockInfo.status === 'out';
  const maxQuantity = getMaxQuantity(product.stock);
  const location = getProductLocation(product);
  const seller = product.seller;

  function changeQuantity(amount) {
    setQuantity((current) => Math.min(Math.max(current + amount, 1), maxQuantity));
  }

  // Price preview for the chosen quantity (the backend calculates the final amount at checkout)
  const itemsTotal = product.price * quantity;
  const platformFee = estimatePlatformFee(itemsTotal, feeRules);
  const deliveryCharge = deliveryEstimate ? deliveryEstimate.deliveryCharge : 0;
  const deliveryRules = feeRules?.delivery;

  function goToLogin(message) {
    showToast(message, 'info');
    navigate('/login', { state: { from: currentLocation.pathname } });
  }

  function handleAddToCart() {
    // Only logged-in buyers can use the cart
    if (!addToCart(product, quantity)) {
      goToLogin('Please log in or create an account to add products to your cart.');
      return;
    }
    setAddedToCart(true);
    showToast(`${quantity} × "${product.name}" added to your cart.`);
  }

  // Buy Now goes straight to checkout with just this product
  function handleBuyNow() {
    const checkoutUrl = `/checkout?product=${product._id}&qty=${quantity}`;
    if (!user) {
      showToast('Please log in or create an account to buy this product.', 'info');
      navigate('/login', { state: { from: checkoutUrl } });
      return;
    }
    navigate(checkoutUrl);
  }

  return (
    <div className="product-details-page">
      <div className="container page-section">
        <nav className="breadcrumb breadcrumb-dark" aria-label="Breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden="true">/</span>
          {product.category ? (
            <>
              <Link to={`/categories/${product.category.slug}`}>{product.category.name}</Link>{' '}
              <span aria-hidden="true">/</span>
            </>
          ) : (
            <>
              <Link to="/products">Products</Link> <span aria-hidden="true">/</span>
            </>
          )}{' '}
          <span>{product.name}</span>
        </nav>

        <div className="product-details">
          {/* Photos: main photo + side view, top view ... if the seller added them.
              key makes the slider start again at the first photo when another product opens. */}
          <ProductGallery key={product._id} product={product} />

          {/* Information */}
          <div className="product-details-info">
            {/* customCategory = a category the seller typed ("Other") when none of ours fitted */}
            {(product.subcategoryName || product.category || product.customCategory) && (
              <span className="product-details-category">
                {product.category?.name || product.customCategory}
                {product.subcategoryName && ` › ${product.subcategoryName}`}
              </span>
            )}

            <div className="product-details-title-row">
              <h1 className="product-details-title">{product.name}</h1>
              <div className="product-details-title-actions">
                <LikeButton product={product} variant="details" />
                <ShareButton product={product} variant="details" />
              </div>
            </div>

            {location && (
              <p className="product-details-location">
                <MapPinIcon size={16} /> {location}
              </p>
            )}

            <p className="product-details-price">{formatPrice(product.price)}</p>

            <p className={`stock-status stock-${stockInfo.status}`}>
              <span className="stock-dot" aria-hidden="true" /> {stockInfo.label}
            </p>

            <div className="purchase-box">
              <div className="quantity-selector" role="group" aria-label="Quantity">
                <button type="button" onClick={() => changeQuantity(-1)} disabled={quantity <= 1 || isOutOfStock} aria-label="Decrease quantity">
                  <MinusIcon size={16} />
                </button>
                <span aria-live="polite">{quantity}</span>
                <button
                  type="button"
                  onClick={() => changeQuantity(1)}
                  disabled={quantity >= maxQuantity || isOutOfStock}
                  aria-label="Increase quantity"
                >
                  <PlusIcon size={16} />
                </button>
              </div>

              <button type="button" className="btn btn-outline btn-lg" onClick={handleAddToCart} disabled={isOutOfStock}>
                <CartIcon size={20} /> {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <button type="button" className="btn btn-primary btn-lg" onClick={handleBuyNow} disabled={isOutOfStock}>
                Buy Now
              </button>

              {addedToCart && (
                <Link to="/cart" className="btn btn-ghost btn-lg">
                  <CheckIcon size={18} /> Go to Cart
                </Link>
              )}
            </div>

            {/* What the buyer will pay: product price + platform charge */}
            {feeRules && !isOutOfStock && (
              <div className="price-preview">
                <div>
                  <span>
                    Price ({quantity} × {formatPrice(product.price)})
                  </span>
                  <span>{formatPrice(itemsTotal)}</span>
                </div>
                <div>
                  <span>
                    Platform charge ({feeRules.percent}%, min {formatPrice(feeRules.minimum)})
                  </span>
                  <span>{formatPrice(platformFee)}</span>
                </div>
                {/* Delivery: free near the seller, charged per km when the buyer is farther away */}
                <div className={deliveryCharge > 0 ? 'price-preview-delivery' : ''}>
                  {deliveryEstimate ? (
                    <>
                      <span>
                        Delivery charge (≈ {deliveryEstimate.distanceKm} km to {deliveryEstimate.to})
                      </span>
                      <span>{deliveryCharge > 0 ? formatPrice(deliveryCharge) : 'Free'}</span>
                    </>
                  ) : (
                    <>
                      <span>Delivery charge</span>
                      <span>At checkout</span>
                    </>
                  )}
                </div>
                <div className="price-preview-total">
                  <span>{deliveryEstimate ? 'Total to pay' : 'Total (without delivery)'}</span>
                  <span>{formatPrice(itemsTotal + platformFee + deliveryCharge)}</span>
                </div>
                {deliveryRules && (
                  <small className="price-preview-note">
                    {deliveryEstimate && deliveryCharge > 0
                      ? `You are outside this seller's ${deliveryRules.freeZoneKm} km free delivery zone: `
                      : `Free delivery within ${deliveryRules.freeZoneKm} km of the seller. Farther away: `}
                    {formatPrice(deliveryRules.perKm)} per km beyond {deliveryRules.freeZoneKm} km (min{' '}
                    {formatPrice(deliveryRules.minimum)}, max {formatPrice(deliveryRules.maximum)}).
                  </small>
                )}
                <p>{user ? 'Pay with Cash on Delivery.' : 'Cash on Delivery. Please log in or register to buy.'}</p>
              </div>
            )}

            {/* Seller information (only public details - never the contact number or Aadhaar) */}
            {seller && (
              <div className="seller-card">
                <span className="seller-avatar" aria-hidden="true">
                  {getInitials(seller.name)}
                </span>
                <div>
                  <span className="seller-card-label">
                    <StoreIcon size={14} /> Sold by
                  </span>
                  <strong>{seller.name}</strong>
                  <span className="seller-card-sub">
                    {[seller.village, seller.district, seller.state].filter(Boolean).join(', ')}
                  </span>
                </div>
              </div>
            )}

            <div className="product-details-description">
              <h2>About this product</h2>
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <p className="text-muted">The seller has not added a description yet.</p>
              )}
            </div>

            <dl className="product-specs">
              <div>
                <dt>Category</dt>
                <dd>{product.category?.name || product.customCategory || 'Not specified'}</dd>
              </div>
              <div>
                <dt>Subcategory</dt>
                <dd>{product.subcategoryName || 'Not specified'}</dd>
              </div>
              <div>
                <dt>Availability</dt>
                <dd>{stockInfo.label}</dd>
              </div>
              <div>
                <dt>Listed on</dt>
                <dd>{formatDate(product.createdAt)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="page-section page-section-alt" aria-labelledby="related-products">
          <div className="container">
            <SectionHeader
              id="related-products"
              title="More from this category"
              linkTo={`/categories/${product.category.slug}`}
            />
            <ProductGrid products={related} loading={false} error="" />
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductDetails;
