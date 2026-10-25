// pages/Admin.jsx
// Page for the Tribal Marketplace TEAM (not for sellers): http://localhost:5174/admin
// - log in with the team password (ADMIN_PASSWORD in backend/.env)
// - see all sellers who registered
// - Approve: the seller can upload products
// - Remove access: the seller cannot upload and all their products are hidden from the marketplace
// - Orders & earnings: every order and the platform charges Tribal Marketplace earns

import { useCallback, useEffect, useState } from 'react';
import AdminOrders from '../components/AdminOrders.jsx';
import AdminQueries from '../components/AdminQueries.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import photoIcons from '../data/photoIcons.js';
import Loading from '../components/Loading.jsx';
import { CheckIcon, LogoutIcon } from '../components/Icons.jsx';
import { adminAPI } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate } from '../utils/format.js';
import pageHeaderPhotos, { headerPhotoStyle } from '../data/pageHeaderPhotos.js';
import '../styles/seller.css';
import '../styles/admin.css';

const VIEWS = [
  { value: 'sellers', label: 'Sellers', title: 'Approve Sellers', intro: 'Only approved sellers can upload products to Tribal Marketplace.' },
  { value: 'orders', label: 'Orders & earnings', title: 'Orders & Earnings', intro: 'Every order from the marketplace: which buyer ordered what from which seller, and the platform charges we earn.' },
  { value: 'queries', label: 'Customer Queries', title: 'Customer Queries', intro: 'Questions sent from the Contact Us page of the marketplace. Call or email the customer, then mark the query as resolved.' },
];

const TABS = [
  { value: 'pending', label: 'Waiting for approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'all', label: 'All sellers' },
];

function Admin() {
  const { showToast } = useToast();

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [view, setView] = useState('sellers');
  const [tab, setTab] = useState('pending');
  const [sellers, setSellers] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busySellerId, setBusySellerId] = useState('');
  const [sellerToRemove, setSellerToRemove] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0); // new order notifications for the team
  const [pendingQueries, setPendingQueries] = useState(0); // customer queries not resolved yet

  // Is the team already logged in?
  useEffect(() => {
    adminAPI
      .getStatus()
      .then((data) => {
        setIsAdmin(data.isAdmin);
        setIsConfigured(data.isConfigured);
      })
      .catch((err) => setLoginError(err.message))
      .finally(() => setChecking(false));
  }, []);

  const loadSellers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminAPI.getSellers(tab);
      setSellers(data.sellers);
      setPendingCount(data.pendingCount);
    } catch (err) {
      if (err.status === 401) setIsAdmin(false); // session expired
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    if (isAdmin && view === 'sellers') loadSellers();
  }, [isAdmin, view, loadSellers]);

  // How many order notifications the team has not read yet (badge on the 'Orders & earnings' button)
  useEffect(() => {
    if (!isAdmin) return;
    adminAPI
      .getNotifications()
      .then((data) => setUnreadNotifications(data.unreadCount))
      .catch(() => {});
    // How many customer queries are still pending (badge on the 'Customer Queries' button)
    adminAPI
      .getQueries('pending', 1)
      .then((data) => setPendingQueries(data.counts.pending))
      .catch(() => {});
  }, [isAdmin, view]);

  // Called by the orders view when the team session has expired
  const handleSessionExpired = useCallback(() => setIsAdmin(false), []);

  async function handleLogin(event) {
    event.preventDefault();
    if (loggingIn) return;
    if (!password) {
      setLoginError('Please enter the team password.');
      return;
    }
    setLoggingIn(true);
    setLoginError('');
    try {
      await adminAPI.login(password);
      setPassword('');
      setIsAdmin(true);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await adminAPI.logout().catch(() => {});
    setIsAdmin(false);
    setSellers([]);
  }

  async function changeApproval(seller, approved) {
    setBusySellerId(seller._id);
    try {
      const data = await adminAPI.setApproval(seller._id, approved);
      showToast(data.message, approved ? 'success' : 'info');
      setSellerToRemove(null);
      await loadSellers();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusySellerId('');
    }
  }

  if (checking) {
    return <Loading text="Loading..." fullPage />;
  }

  /* ---------- Team login ---------- */
  if (!isAdmin) {
    return (
      <div className="admin-login-page">
        <form className="admin-login-card" onSubmit={handleLogin} noValidate>
          <span className="eyebrow eyebrow-dark">Tribal Marketplace team</span>
          <h1>Team Login</h1>
          <p className="text-muted">
            This page is for the Tribal Marketplace team to approve sellers. Sellers do not need this page.
          </p>

          {!isConfigured && (
            <div className="alert alert-warning">
              Team login is not set up yet. Add <code>ADMIN_PASSWORD</code> to <code>SellerTribe/backend/.env</code> and
              restart the backend.
            </div>
          )}
          {loginError && (
            <div className="alert alert-error" role="alert">
              {loginError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="admin-password" className="form-label">
              Team password
            </label>
            <input
              id="admin-password"
              type="password"
              className="form-control"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loggingIn}>
            {loggingIn ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    );
  }

  /* ---------- Team panel: seller approvals or orders ---------- */
  const currentView = VIEWS.find((item) => item.value === view);

  return (
    <div className="seller-page">
      <section className="page-header page-header-photo" style={headerPhotoStyle(pageHeaderPhotos.admin)}>
        <div className="container page-header-row">
          <div>
            <span className="eyebrow">Team panel</span>
            <h1>{currentView.title}</h1>
            <p>{currentView.intro}</p>
          </div>
          <button type="button" className="btn btn-outline-light" onClick={handleLogout}>
            <LogoutIcon size={18} /> Team logout
          </button>
        </div>
      </section>

      <div className="container page-section">
        <div className="admin-views" role="tablist" aria-label="Team panel sections">
          {VIEWS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={view === item.value}
              className={`btn btn-sm ${view === item.value ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setView(item.value)}
            >
              {item.label}
              {item.value === 'sellers' && pendingCount > 0 && <span className="admin-tab-count">{pendingCount}</span>}
              {item.value === 'orders' && unreadNotifications > 0 && (
                <span className="admin-tab-count" aria-label={`${unreadNotifications} new`}>
                  {unreadNotifications}
                </span>
              )}
              {item.value === 'queries' && pendingQueries > 0 && (
                <span className="admin-tab-count" aria-label={`${pendingQueries} pending`}>
                  {pendingQueries}
                </span>
              )}
            </button>
          ))}
        </div>

        {view === 'queries' ? (
          <div className="dashboard-panel">
            <AdminQueries onSessionExpired={handleSessionExpired} onPendingChange={setPendingQueries} />
          </div>
        ) : view === 'orders' ? (
          <div className="dashboard-panel">
            <AdminOrders onSessionExpired={handleSessionExpired} onUnreadChange={setUnreadNotifications} />
          </div>
        ) : (
          <div className="dashboard-panel">
            <div className="admin-tabs" role="tablist" aria-label="Filter sellers">
              {TABS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.value}
                  className={`chip ${tab === item.value ? 'is-active' : ''}`}
                  onClick={() => setTab(item.value)}
                >
                  {item.label}
                  {item.value === 'pending' && pendingCount > 0 && <span className="admin-tab-count">{pendingCount}</span>}
                </button>
              ))}
            </div>

            {error && (
              <div className="alert alert-error" role="alert">
                {error}
              </div>
            )}
            {loading && <Loading text="Loading sellers..." />}

            {!loading && !error && sellers.length === 0 && (
              <EmptyState
                photo={tab === 'pending' ? photoIcons.womenSelfHelpGroup : photoIcons.womenGroup}
                title={tab === 'pending' ? 'No sellers are waiting for approval' : 'No sellers here yet'}
                message="New seller registrations appear in the 'Waiting for approval' tab."
              />
            )}

            {!loading && sellers.length > 0 && (
              <div className="seller-table-wrapper">
                <table className="seller-table admin-table">
                  <thead>
                    <tr>
                      <th scope="col">Seller</th>
                      <th scope="col">Aadhaar</th>
                      <th scope="col">Address</th>
                      <th scope="col">Registered</th>
                      <th scope="col">Products</th>
                      <th scope="col">Status</th>
                      <th scope="col">
                        <span className="visually-hidden">Action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellers.map((seller) => (
                      <tr key={seller._id}>
                        <td data-label="Seller">
                          <span className="admin-seller">
                            <strong>{seller.name}</strong>
                            <small>{seller.phone}</small>
                          </span>
                        </td>
                        <td data-label="Aadhaar">XXXX XXXX {seller.aadhaarLast4}</td>
                        <td data-label="Address">{[seller.village, seller.district, seller.state].filter(Boolean).join(', ')}</td>
                        <td data-label="Registered">{formatDate(seller.createdAt)}</td>
                        <td data-label="Products">{seller.productCount}</td>
                        <td data-label="Status">
                          <span className={`status-pill ${seller.isApproved ? 'status-approved' : 'status-pending'}`}>
                            {seller.isApproved ? 'Approved' : 'Waiting'}
                          </span>
                        </td>
                        <td className="seller-table-actions">
                          {seller.isApproved ? (
                            <button
                              type="button"
                              className="btn btn-danger-outline btn-sm"
                              onClick={() => setSellerToRemove(seller)}
                              disabled={busySellerId === seller._id}
                            >
                              Remove access
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => changeApproval(seller, true)}
                              disabled={busySellerId === seller._id}
                            >
                              <CheckIcon size={16} /> {busySellerId === seller._id ? 'Approving...' : 'Approve'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(sellerToRemove)}
        title="Remove this seller's access?"
        message={
          sellerToRemove
            ? `${sellerToRemove.name} will not be able to upload or edit products, and their ${sellerToRemove.productCount} product(s) will be hidden from the marketplace. You can approve them again later.`
            : ''
        }
        confirmText="Yes, remove access"
        busy={Boolean(busySellerId)}
        onConfirm={() => changeApproval(sellerToRemove, false)}
        onCancel={() => setSellerToRemove(null)}
      />
    </div>
  );
}

export default Admin;
