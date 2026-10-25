// pages/CategoryProducts.jsx
// Products of one category: /categories/:slug   (optional ?sub=subcategory-slug&sort=...&page=...)

import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import CategoryMenu from '../components/CategoryMenu.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import Pagination from '../components/Pagination.jsx';
import EmptyState from '../components/EmptyState.jsx';
import photoIcons from '../data/photoIcons.js';
import Loading from '../components/Loading.jsx';
import { categoryAPI } from '../services/api.js';
import { isUsableImageUrl } from '../utils/images.js';
import { headerPhotoStyle } from '../data/pageHeaderPhotos.js';
import '../styles/categories.css';
import '../styles/products.css';

const PRODUCTS_PER_PAGE = 12;

function CategoryProducts() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const subcategory = searchParams.get('sub') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page')) || 1;

  const [allCategories, setAllCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  // Category list for the menu at the top (loaded once)
  useEffect(() => {
    categoryAPI
      .getCategories()
      .then((data) => setAllCategories(data.categories))
      .catch(() => setAllCategories([]));
  }, []);

  // Products of this category - reloads when the category, subcategory, sort or page changes
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');
    setNotFound(false);

    categoryAPI
      .getCategoryProducts(slug, { subcategory, sort, page, limit: PRODUCTS_PER_PAGE })
      .then((data) => {
        if (ignore) return;
        setCategory(data.category);
        setProducts(data.products);
        setTotalProducts(data.totalProducts);
        setTotalPages(data.totalPages);
      })
      .catch((err) => {
        if (ignore) return;
        if (err.status === 404) setNotFound(true);
        else setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [slug, subcategory, sort, page]);

  // Updates one value in the URL (?sub=..&sort=..&page=..). Changing a filter goes back to page 1.
  function updateParams(changes) {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) nextParams.delete(key);
      else nextParams.set(key, value);
    });
    if (!('page' in changes)) nextParams.delete('page');
    setSearchParams(nextParams);
  }

  function changePage(newPage) {
    updateParams({ page: newPage > 1 ? newPage : '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (notFound) {
    return (
      <div className="container page-section">
        <EmptyState
          photo={photoIcons.streetMarket}
          title="Category not found"
          message="This category or subcategory does not exist. It may have been renamed or removed."
        >
          <Link to="/categories" className="btn btn-primary">
            See all categories
          </Link>
        </EmptyState>
      </div>
    );
  }

  const activeSubcategory = category?.subcategories.find((sub) => sub.slug === subcategory);
  const headerPhoto = category && isUsableImageUrl(category.image) ? category.image : '';

  return (
    <div className="category-products-page">
      {/* The category photo is shown behind the title, under a dark overlay so the text stays readable */}
      <section
        className={`page-header ${headerPhoto ? 'page-header-photo' : ''}`}
        style={headerPhotoStyle({ url: headerPhoto })}
      >
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link> <span aria-hidden="true">/</span> <Link to="/categories">Categories</Link>
            {category && (
              <>
                {' '}
                <span aria-hidden="true">/</span>{' '}
                {activeSubcategory ? <Link to={`/categories/${category.slug}`}>{category.name}</Link> : <span>{category.name}</span>}
              </>
            )}
            {activeSubcategory && (
              <>
                {' '}
                <span aria-hidden="true">/</span> <span>{activeSubcategory.name}</span>
              </>
            )}
          </nav>
          <h1>{activeSubcategory ? activeSubcategory.name : category?.name || 'Loading...'}</h1>
          {category && <p>{category.description}</p>}
        </div>
      </section>

      <div className="container page-section">
        <CategoryMenu categories={allCategories} activeSlug={slug} />

        {/* Subcategory chips */}
        {category && (
          <div className="chip-list subcategory-chips" role="group" aria-label="Subcategories">
            <button
              type="button"
              className={`chip ${subcategory === '' ? 'is-active' : ''}`}
              onClick={() => updateParams({ sub: '' })}
              aria-pressed={subcategory === ''}
            >
              All {category.name}
            </button>
            {category.subcategories.map((sub) => (
              <button
                type="button"
                key={sub.slug}
                className={`chip ${subcategory === sub.slug ? 'is-active' : ''}`}
                onClick={() => updateParams({ sub: sub.slug })}
                aria-pressed={subcategory === sub.slug}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        <div className="listing-toolbar">
          <p className="listing-count">
            {loading ? 'Loading products...' : `${totalProducts} ${totalProducts === 1 ? 'product' : 'products'} found`}
          </p>
          <label className="sort-select">
            <span>Sort by</span>
            <select value={sort} onChange={(event) => updateParams({ sort: event.target.value })}>
              <option value="newest">Recently added</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="popular">Most popular</option>
            </select>
          </label>
        </div>

        {loading && !category ? (
          <Loading text="Loading products..." />
        ) : (
          <ProductGrid
            products={products}
            loading={loading}
            error={error}
            skeletonCount={8}
            emptyTitle={`No products in ${activeSubcategory ? activeSubcategory.name : category?.name || 'this category'} yet.`}
            emptyMessage="Sellers have not added products here yet. Please check again later or explore other categories."
            emptyAction={
              <Link to="/products" className="btn btn-outline">
                Browse all products
              </Link>
            }
          />
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={changePage} />
      </div>
    </div>
  );
}

export default CategoryProducts;
