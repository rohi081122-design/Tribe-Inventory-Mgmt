// pages/NotFound.jsx - shown for any URL that does not exist

import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="container page-section not-found">
      <p className="not-found-code" aria-hidden="true">
        404
      </p>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist or may have been moved.</p>
      <div className="not-found-actions">
        <Link to="/" className="btn btn-primary">
          Go to Home
        </Link>
        <Link to="/products" className="btn btn-outline">
          Browse products
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
