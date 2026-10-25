// pages/Likes.jsx - /likes
// The products the logged-in buyer liked (❤️), newest like first.
// Clicking the red heart on a card here unlikes the product, and it leaves the list straight away.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid.jsx';
import pageHeaderPhotos, { headerPhotoStyle } from '../data/pageHeaderPhotos.js';
import { likeAPI } from '../services/api.js';
import { useLikes } from '../context/LikesContext.jsx';
import '../styles/products.css';

function Likes() {
  const { likedIds, likesReady } = useLikes();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    likeAPI
      .getLikes()
      .then((data) => setProducts(data.products))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Only products that are still liked (an unliked product disappears at once)
  const likedProducts = likesReady ? products.filter((product) => likedIds.includes(product._id)) : products;
  const count = likedProducts.length;

  return (
    <div className="likes-page">
      <section className="page-header page-header-photo" style={headerPhotoStyle(pageHeaderPhotos.likes)}>
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>My Likes</span>
          </nav>
          <h1>My Likes</h1>
          <p>
            {loading
              ? 'Products you liked.'
              : `${count} ${count === 1 ? 'product' : 'products'} you liked. Tap the red heart to remove one.`}
          </p>
        </div>
      </section>

      <div className="container page-section">
        <ProductGrid
          products={likedProducts}
          loading={loading}
          error={error}
          emptyTitle="You have not liked any products yet"
          emptyMessage="Tap the heart on a product you like - it will be saved here so you can find it again."
          emptyAction={
            <Link to="/products" className="btn btn-primary">
              Browse products
            </Link>
          }
        />
      </div>
    </div>
  );
}

export default Likes;
