// components/Loading.jsx
// Loading spinner and "skeleton" placeholder cards shown while data is loading.

function Loading({ text = 'Loading...', fullPage = false }) {
  return (
    <div className={`loading ${fullPage ? 'loading-page' : ''}`} role="status">
      <span className="spinner" aria-hidden="true" />
      <span className="loading-text">{text}</span>
    </div>
  );
}

// Grey animated cards in the shape of product cards
export function ProductGridSkeleton({ count = 4, compact = false }) {
  return (
    <div className={`products-grid ${compact ? 'products-grid-compact' : ''}`} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div className="product-card skeleton-card" key={index}>
          <div className="skeleton skeleton-image" />
          <div className="product-card-body">
            <div className="skeleton skeleton-line short" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line medium" />
            <div className="skeleton skeleton-button" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Loading;
