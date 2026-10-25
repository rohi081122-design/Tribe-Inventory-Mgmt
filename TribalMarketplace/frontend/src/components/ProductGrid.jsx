// components/ProductGrid.jsx
// Shows a grid of ProductCards, plus loading, error and empty states.

import ProductCard from './ProductCard.jsx';
import EmptyState from './EmptyState.jsx';
import photoIcons from '../data/photoIcons.js';
import { ProductGridSkeleton } from './Loading.jsx';

function ProductGrid({
  products,
  loading,
  error,
  skeletonCount = 4,
  emptyTitle = 'No products available yet.',
  emptyMessage = 'Please check back soon - new handmade products are added by sellers.',
  emptyAction = null,
  compact = false,
}) {
  if (loading) {
    return <ProductGridSkeleton count={skeletonCount} compact={compact} />;
  }

  if (error) {
    return (
      <div className="alert alert-error" role="alert">
        {error}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState photo={photoIcons.bambooBasket} title={emptyTitle} message={emptyMessage}>
        {emptyAction}
      </EmptyState>
    );
  }

  return (
    <div className={`products-grid ${compact ? 'products-grid-compact' : ''}`}>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;
