// components/Navbar.jsx
// Top bar of the seller website: logo, and (when logged in) Dashboard, Orders, Marketplace, Logout, Upload
// and the notification bell (new orders).

import { Link, NavLink, useNavigate } from 'react-router-dom';
import { GridIcon, LogoutIcon, PackageIcon, PlusIcon, StoreIcon } from './Icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import NotificationBell from './NotificationBell.jsx';
import siteConfig from '../data/siteConfig.js';
import '../styles/layout.css';

function Navbar() {
  const { seller, isApproved, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    showToast('You have been logged out.', 'info');
    navigate('/login');
  }

  return (
    <header className="seller-navbar">
      <div className="container seller-navbar-inner">
        <Link to={seller ? '/' : '/login'} className="brand" aria-label={`${siteConfig.name} home`}>
          {/* CSS-only logo */}
          <span className="logo-mark" aria-hidden="true">
            <span className="logo-mark-letter">S</span>
          </span>
          <span className="brand-text">
            <span className="brand-name">{siteConfig.name}</span>
            <span className="brand-tagline">{siteConfig.tagline}</span>
          </span>
        </Link>

        {seller && <NotificationBell />}

        <nav className="seller-nav" aria-label="Seller navigation">
          {seller ? (
            <>
              <NavLink to="/" end className="seller-nav-link">
                <GridIcon size={18} /> <span>Dashboard</span>
              </NavLink>
              <NavLink to="/orders" className="seller-nav-link">
                <PackageIcon size={18} /> <span>Orders</span>
              </NavLink>
              <a href={siteConfig.marketplaceUrl} className="seller-nav-link">
                <StoreIcon size={18} /> <span>Marketplace</span>
              </a>
              <button type="button" className="seller-nav-link" onClick={handleLogout}>
                <LogoutIcon size={18} /> <span>Logout</span>
              </button>
              {/* Only approved sellers see the upload button */}
              {isApproved && (
                <Link to="/products/new" className="btn btn-primary btn-sm seller-nav-upload">
                  <PlusIcon size={18} /> Upload Product
                </Link>
              )}
            </>
          ) : (
            <a href={siteConfig.marketplaceUrl} className="seller-nav-link">
              <StoreIcon size={18} /> <span>Visit the Marketplace</span>
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
