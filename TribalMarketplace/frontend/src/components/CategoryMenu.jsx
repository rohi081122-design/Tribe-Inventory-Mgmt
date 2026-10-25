// components/CategoryMenu.jsx
// A horizontal, scrollable list of all main categories (with a small photo of each).
// Used on the category and product listing pages to jump between categories.

import { Link } from 'react-router-dom';
import CategoryThumb from './CategoryThumb.jsx';

function CategoryMenu({ categories, activeSlug = '', showAllLink = true }) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <nav className="category-menu" aria-label="Product categories">
      <ul className="category-menu-list">
        {showAllLink && (
          <li>
            <Link to="/products" className={`category-menu-item ${activeSlug === '' ? 'is-active' : ''}`}>
              All Products
            </Link>
          </li>
        )}
        {categories.map((category) => (
          <li key={category._id}>
            <Link
              to={`/categories/${category.slug}`}
              className={`category-menu-item ${activeSlug === category.slug ? 'is-active' : ''}`}
              aria-current={activeSlug === category.slug ? 'page' : undefined}
            >
              <CategoryThumb category={category} size={24} /> {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default CategoryMenu;
