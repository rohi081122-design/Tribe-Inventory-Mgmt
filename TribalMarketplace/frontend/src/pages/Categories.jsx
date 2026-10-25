// pages/Categories.jsx
// Shows all main categories as cards. Selecting a category shows its subcategories.
// Categories come from MongoDB through GET /api/categories.

import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ImageWithFallback from '../components/ImageWithFallback.jsx';
import CategoryThumb from '../components/CategoryThumb.jsx';
import PhotoIcon from '../components/PhotoIcon.jsx';
import photoIcons from '../data/photoIcons.js';
import { ArrowRightIcon, CloseIcon } from '../components/Icons.jsx';
import { categoryAPI } from '../services/api.js';
import { isUsableImageUrl } from '../utils/images.js';
import pageHeaderPhotos, { headerPhotoStyle } from '../data/pageHeaderPhotos.js';
import '../styles/categories.css';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const panelRef = useRef(null);

  // The selected category is kept in the URL (?selected=slug) so it can be shared or bookmarked
  const selectedSlug = searchParams.get('selected') || '';
  const selectedCategory = categories.find((category) => category.slug === selectedSlug);

  useEffect(() => {
    categoryAPI
      .getCategories()
      .then((data) => setCategories(data.categories))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Scroll the subcategory panel into view when a category is selected
  useEffect(() => {
    if (selectedCategory && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedCategory]);

  function selectCategory(slug) {
    setSearchParams(slug === selectedSlug ? {} : { selected: slug }, { replace: true });
  }

  return (
    <div className="categories-page">
      <section className="page-header page-header-photo" style={headerPhotoStyle(pageHeaderPhotos.categories)}>
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>Categories</span>
          </nav>
          <h1>Shop by Category</h1>
          <p>Choose a category to see its subcategories, then open the products you are interested in.</p>
        </div>
      </section>

      <div className="container page-section">
        {loading && <Loading text="Loading categories..." />}
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}
        {!loading && !error && categories.length === 0 && (
          <EmptyState
            photo={photoIcons.handicrafts}
            title="No categories yet"
            message="Categories are created automatically when the backend connects to MongoDB for the first time."
          />
        )}

        <div className="category-grid category-grid-large">
          {categories.map((category, index) => {
            const isSelected = category.slug === selectedSlug;
            return (
              <button
                type="button"
                key={category._id}
                className={`category-card accent-${index % 4} ${isSelected ? 'is-selected' : ''}`}
                onClick={() => selectCategory(category.slug)}
                aria-pressed={isSelected}
                aria-controls="subcategory-panel"
              >
                <div className="category-card-media">
                  {isUsableImageUrl(category.image) ? (
                    <ImageWithFallback src={category.image} alt="" label="Category Image" width={400} />
                  ) : (
                    <span className="category-card-icon" aria-hidden="true">
                      <PhotoIcon photo={photoIcons.handicrafts} />
                    </span>
                  )}
                </div>
                <div className="category-card-body">
                  <h2>{category.name}</h2>
                  <p>{category.description}</p>
                  <span className="category-card-count">
                    {category.subcategories.length} subcategories · {category.productCount}{' '}
                    {category.productCount === 1 ? 'product' : 'products'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Subcategories of the selected category */}
        {selectedCategory && (
          <section id="subcategory-panel" className="subcategory-panel" ref={panelRef} aria-live="polite">
            <div className="subcategory-panel-header">
              <CategoryThumb category={selectedCategory} size={64} className="subcategory-panel-icon" />
              <div>
                <h2>{selectedCategory.name}</h2>
                <p>{selectedCategory.description}</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => selectCategory(selectedCategory.slug)}
                aria-label="Close subcategories"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <div className="subcategory-grid">
              {selectedCategory.subcategories.map((sub) => (
                <Link
                  key={sub.slug}
                  to={`/categories/${selectedCategory.slug}?sub=${sub.slug}`}
                  className="subcategory-card"
                >
                  <span className="subcategory-card-name">{sub.name}</span>
                  <span className="subcategory-card-count">
                    {sub.productCount} {sub.productCount === 1 ? 'product' : 'products'}
                  </span>
                  <ArrowRightIcon size={18} />
                </Link>
              ))}
            </div>

            <Link to={`/categories/${selectedCategory.slug}`} className="btn btn-primary">
              View all {selectedCategory.name} <ArrowRightIcon size={18} />
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}

export default Categories;
