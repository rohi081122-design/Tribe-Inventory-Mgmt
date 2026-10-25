// pages/Products.jsx
// All products and search results: /products?search=...&category=...&subcategory=...&sort=...&page=...
// Searching, filtering, sorting and pagination all happen on the backend.

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid.jsx';
import Pagination from '../components/Pagination.jsx';
import { FilterIcon } from '../components/Icons.jsx';
import { categoryAPI, productAPI } from '../services/api.js';
import pageHeaderPhotos, { headerPhotoStyle } from '../data/pageHeaderPhotos.js';
import '../styles/products.css';

const PRODUCTS_PER_PAGE = 12;

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page')) || 1;

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    categoryAPI
      .getCategories()
      .then((data) => setCategories(data.categories))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');

    productAPI
      .getProducts({ search, category, subcategory, sort, page, limit: PRODUCTS_PER_PAGE })
      .then((data) => {
        if (ignore) return;
        setProducts(data.products);
        setTotalProducts(data.totalProducts);
        setTotalPages(data.totalPages);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [search, category, subcategory, sort, page]);

  // Changes values in the URL. Any filter change goes back to page 1.
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

  const selectedCategory = categories.find((item) => item.slug === category);
  const hasFilters = Boolean(search || category || subcategory || sort !== 'newest');

  return (
    <div className="products-page">
      <section className="page-header page-header-photo" style={headerPhotoStyle(pageHeaderPhotos.products)}>
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>{search ? 'Search' : 'All Products'}</span>
          </nav>
          <h1>{search ? `Results for "${search}"` : 'All Products'}</h1>
          <p>Handmade and traditional products listed by tribal sellers.</p>
        </div>
      </section>

      <div className="container page-section">
        {/* Filters */}
        <div className="filter-bar" role="group" aria-label="Filter and sort products">
          <span className="filter-bar-title">
            <FilterIcon size={18} /> Filters
          </span>

          <label className="filter-field">
            <span>Category</span>
            <select value={category} onChange={(event) => updateParams({ category: event.target.value, subcategory: '' })}>
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item._id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Subcategory</span>
            <select
              value={subcategory}
              onChange={(event) => updateParams({ subcategory: event.target.value })}
              disabled={!selectedCategory}
            >
              <option value="">{selectedCategory ? 'All subcategories' : 'Choose a category first'}</option>
              {selectedCategory?.subcategories.map((sub) => (
                <option key={sub.slug} value={sub.slug}>
                  {sub.name}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Sort by</span>
            <select value={sort} onChange={(event) => updateParams({ sort: event.target.value })}>
              <option value="newest">Recently added</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="popular">Most popular</option>
            </select>
          </label>

          {hasFilters && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSearchParams({})}>
              Clear all
            </button>
          )}
        </div>

        <div className="listing-toolbar">
          <p className="listing-count">
            {loading ? 'Searching...' : `${totalProducts} ${totalProducts === 1 ? 'product' : 'products'} found`}
          </p>
        </div>

        <ProductGrid
          products={products}
          loading={loading}
          error={error}
          skeletonCount={8}
          emptyTitle={search ? `No products match "${search}"` : 'No products available yet.'}
          emptyMessage={
            search
              ? 'Try a different or shorter word, check the spelling, or remove some filters.'
              : 'Sellers have not added products yet. Please check back soon.'
          }
          emptyAction={
            hasFilters && (
              <button type="button" className="btn btn-primary" onClick={() => setSearchParams({})}>
                Show all products
              </button>
            )
          }
        />

        <Pagination page={page} totalPages={totalPages} onPageChange={changePage} />
      </div>
    </div>
  );
}

export default Products;
