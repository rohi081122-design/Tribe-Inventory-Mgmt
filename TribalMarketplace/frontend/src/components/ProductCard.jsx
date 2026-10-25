// components/ProductCard.jsx
// One product in a grid: image, like button (heart), share button, category, name, location, price and buttons.

import { Link, useLocation, useNavigate } from 'react-router-dom';
import ImageWithFallback from './ImageWithFallback.jsx';
import LikeButton from './LikeButton.jsx';
import ShareButton from './ShareButton.jsx';
import { CartIcon, MapPinIcon } from './Icons.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatPrice, getProductLocation } from '../utils/format.js';
import '../styles/products.css';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const currentLocation = useLocation();

  const productUrl = `/products/${product._id}`;
  const categoryLabel = product.subcategoryName || product.category?.name || product.customCategory || 'Handmade';
  const location = getProductLocation(product);
  const isOutOfStock = product.stock === 0;

  function handleAddToCart() {
    // Only logged-in buyers can use the cart: send visitors to the login page (and back here afterwards)
    if (!addToCart(product, 1)) {
      showToast('Please log in or create an account to add products to your cart.', 'info');
      navigate('/login', { state: { from: currentLocation.pathname + currentLocation.search } });
      return;
    }
    showToast(`"${product.name}" added to your cart.`);
  }

  return (
    <article className="product-card">
      <Link to={productUrl} className="product-card-image" tabIndex={-1} aria-hidden="true">
        <ImageWithFallback src={product.image?.url} alt="" label="Product Image" width={500} />
        {isOutOfStock && <span className="product-card-badge">Out of stock</span>}
      </Link>

      {/* Heart in the top-right corner of the photo and Share under it
          (outside the link, because a button cannot be inside a link) */}
      <LikeButton product={product} />
      <ShareButton product={product} />

      <div className="product-card-body">
        <span className="product-card-category">{categoryLabel}</span>

        <h3 className="product-card-title">
          <Link to={productUrl}>{product.name}</Link>
        </h3>

        {location && (
          <p className="product-card-location">
            <MapPinIcon size={14} /> {location}
          </p>
        )}

        <p className="product-card-price">{formatPrice(product.price)}</p>

        <div className="product-card-actions">
          <Link to={productUrl} className="btn btn-outline btn-sm">
            View Details
          </Link>
          <button
            type="button"
            className="btn btn-primary btn-sm btn-icon"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={`Add ${product.name} to cart`}
            title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
          >
            <CartIcon size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
