// pages/Dashboard.jsx
// Seller home: welcome banner, numbers and the list of the seller's products.

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SellerProductTable from '../components/SellerProductTable.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import DemandPanel from '../components/DemandPanel.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PhotoIcon from '../components/PhotoIcon.jsx';
import Loading from '../components/Loading.jsx';
import Pagination from '../components/Pagination.jsx';
import { ImageIcon, InfoIcon, MapPinIcon, PlusIcon, SearchIcon, StoreIcon, UserIcon } from '../components/Icons.jsx';
import { productAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import siteConfig from '../data/siteConfig.js';
import photoIcons from '../data/photoIcons.js';
import pageHeaderPhotos, { headerPhotoStyle } from '../data/pageHeaderPhotos.js';
import { formatPhone } from '../utils/format.js';
import '../styles/seller.css';

const PRODUCTS_PER_PAGE = 10;

function Dashboard() {
  const { seller, isApproved, refreshSeller } = useAuth();
  const { showToast } = useToast();
  const [checkingApproval, setCheckingApproval] = useState(false);

  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await productAPI.getMyProducts({ page, limit: PRODUCTS_PER_PAGE, search, sort });
      // If the last product on a page was deleted, go back one page
      if (data.products.length === 0 && page > 1) {
        setPage(page - 1);
        return;
      }
      setProducts(data.products);
      setStats(data.stats);
      setTotalProducts(data.totalProducts);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, sort]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Get the latest approval status when the dashboard opens ([] = run only once)
  useEffect(() => {
    refreshSeller();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function checkApprovalAgain() {
    setCheckingApproval(true);
    await refreshSeller();
    setCheckingApproval(false);
  }

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await productAPI.deleteProduct(productToDelete._id);
      showToast(`"${productToDelete.name}" was deleted.`);
      setProductToDelete(null);
      await loadProducts(); // refresh the list and the numbers
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  }

  const location = [seller.village, seller.district, seller.state].filter(Boolean).join(', ');
  const hasNoProductsAtAll = !loading && !error && stats && stats.totalProducts === 0;

  return (
    <div className="seller-page">
      {/* Welcome banner */}
      <section className="dashboard-hero page-header-photo" style={headerPhotoStyle(pageHeaderPhotos.dashboard)}>
        <div className="container dashboard-hero-inner">
          <div>
            <span className="eyebrow">Seller Dashboard</span>
            <h1>Namaste, {seller.name}!</h1>
            <p className="dashboard-hero-meta">
              <span>
                <UserIcon size={16} /> {formatPhone(seller.phone)}
              </span>
              <span>Aadhaar: XXXX XXXX {seller.aadhaarLast4}</span>
              {location && (
                <span>
                  <MapPinIcon size={16} /> {location}
                </span>
              )}
            </p>
          </div>
          {isApproved ? (
            <Link to="/products/new" className="btn btn-hero btn-lg">
              <PlusIcon size={20} /> Upload Product
            </Link>
          ) : (
            <span className="status-pill status-pending">Waiting for approval</span>
          )}
        </div>
      </section>

      <div className="container page-section">
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        {/* Not approved yet: only the team can give upload access */}
        {!isApproved && (
          <div className="approval-card" role="status">
            <span className="approval-card-icon">
              <InfoIcon size={28} />
            </span>
            <div>
              <strong>Your seller account is waiting for approval</strong>
              <p>
                Thank you for registering! Only sellers approved by the Tribal Marketplace team can upload products. The
                team will check your details and give you access - after that you can upload products from here.
              </p>
            </div>
            <button type="button" className="btn btn-outline btn-sm" onClick={checkApprovalAgain} disabled={checkingApproval}>
              {checkingApproval ? 'Checking...' : 'Check again'}
            </button>
          </div>
        )}

        {/* First visit of an approved seller: a big, friendly upload button */}
        {isApproved && hasNoProductsAtAll ? (
          <Link to="/products/new" className="upload-cta">
            <span className="upload-cta-icon">
              <ImageIcon size={40} />
            </span>
            <span>
              <strong>Upload your first product</strong>
              <small>Add a photo, a name, a price and the product details. It will appear on the marketplace right away.</small>
            </span>
            <span className="btn btn-primary">
              <PlusIcon size={18} /> Upload
            </span>
          </Link>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-icon stat-icon-green" aria-hidden="true">
                <PhotoIcon photo={photoIcons.dokraFigurines} />
              </span>
              <div>
                <span className="stat-value">{stats ? stats.totalProducts : '–'}</span>
                <span className="stat-label">Products on the marketplace</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon stat-icon-terracotta" aria-hidden="true">
                <PhotoIcon photo={photoIcons.craftFair} />
              </span>
              <div>
                <span className="stat-value">{stats ? stats.totalViews : '–'}</span>
                <span className="stat-label">Views by buyers</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon stat-icon-brown" aria-hidden="true">
                <PhotoIcon photo={photoIcons.bambooStorage} />
              </span>
              <div>
                <span className="stat-value">{stats ? stats.totalStock : '–'}</span>
                <span className="stat-label">Items in stock</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon stat-icon-ochre" aria-hidden="true">
                <PhotoIcon photo={photoIcons.emptyBasket} />
              </span>
              <div>
                <span className="stat-value">{stats ? stats.outOfStock : '–'}</span>
                <span className="stat-label">Out of stock</span>
              </div>
            </div>
          </div>
        )}

        {/* How many pieces of each product buyers are waiting for */}
        <DemandPanel />

        {/* Product list */}
        <section className="dashboard-panel" aria-labelledby="my-products-title">
          <div className="dashboard-panel-header">
            <h2 id="my-products-title">
              Your products <span className="count-badge">{totalProducts}</span>
            </h2>
            <a href={siteConfig.marketplaceUrl} className="btn btn-outline btn-sm">
              <StoreIcon size={16} /> Open the marketplace
            </a>
          </div>

          <div className="my-products-toolbar">
            <form className="inline-search" onSubmit={handleSearch} role="search">
              <label htmlFor="my-products-search" className="visually-hidden">
                Search your products
              </label>
              <input
                id="my-products-search"
                type="search"
                className="form-control"
                placeholder="Search your products by name"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
              <button type="submit" className="btn btn-secondary">
                <SearchIcon size={18} /> Search
              </button>
            </form>

            <label className="sort-select">
              <span>Sort by</span>
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                }}
              >
                <option value="newest">Recently uploaded</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="popular">Most viewed</option>
              </select>
            </label>
          </div>

          {loading && <Loading text="Loading your products..." />}

          {!loading && !error && products.length === 0 && (
            <EmptyState
              photo={search ? photoIcons.bambooBasket : photoIcons.dokraFigurines}
              title={search ? `No products match "${search}"` : 'You have not uploaded any products yet'}
              message={search ? 'Try another word.' : 'Upload a photo of your product to show it on the marketplace.'}
            >
              {search ? (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setSearchInput('');
                    setSearch('');
                  }}
                >
                  Clear search
                </button>
              ) : (
                isApproved && (
                  <Link to="/products/new" className="btn btn-primary">
                    <PlusIcon size={18} /> Upload Product
                  </Link>
                )
              )}
            </EmptyState>
          )}

          {!loading && products.length > 0 && (
            <SellerProductTable products={products} onDeleteClick={setProductToDelete} canManage={isApproved} />
          )}

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(productToDelete)}
        title="Delete this product?"
        message={
          productToDelete
            ? `"${productToDelete.name}" will be removed from the marketplace permanently. This cannot be undone.`
            : ''
        }
        confirmText="Yes, delete"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}

export default Dashboard;
