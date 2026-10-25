// components/Navbar.jsx
// Sticky top navigation: logo, search, likes, cart, main links, buyer login and a link to the seller website.
// On small screens the links move into a menu opened by the hamburger button.

import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import SearchBar from './SearchBar.jsx';
import { CartIcon, CloseIcon, HeartIcon, LogoutIcon, MenuIcon, PackageIcon, StoreIcon, UserIcon } from './Icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useLikes } from '../context/LikesContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import siteConfig from '../data/siteConfig.js';
import '../styles/navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/categories', label: 'Categories' },
  { to: '/products', label: 'All Products' },
  { to: '/contact', label: 'Contact' },
];

function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { likeCount } = useLikes();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close the mobile menu whenever the page changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  // Close the mobile menu with the Escape key
  useEffect(() => {
    if (!menuOpen) return undefined;
    function handleKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  async function handleLogout() {
    await logout();
    showToast('You have been logged out.', 'info');
    navigate('/');
  }

  const firstName = user ? user.name.split(' ')[0] : '';

  return (
    <header className="navbar">
      {/* Top row: logo, search, cart */}
      <div className="navbar-top">
        <div className="container navbar-top-inner">
          <button
            type="button"
            className="navbar-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="main-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </button>

          <Link to="/" className="brand" aria-label={`${siteConfig.name} home`}>
            <Logo />
            <span className="brand-text">
              <span className="brand-name">{siteConfig.name}</span>
              <span className="brand-tagline">{siteConfig.tagline}</span>
            </span>
          </Link>

          <div className="navbar-search">
            <SearchBar />
          </div>

          <div className="navbar-quick-actions">
            {user ? (
              <span className="navbar-greeting" title={user.email}>
                <UserIcon size={18} />
                <span>
                  Hi, {firstName}
                  <small>Your account</small>
                </span>
              </span>
            ) : (
              <Link to="/login" className="navbar-greeting">
                <UserIcon size={18} />
                <span>
                  Hello, sign in
                  <small>Account</small>
                </span>
              </Link>
            )}

            {/* Liked products (the number shows only when there are some) */}
            <Link to="/likes" className="navbar-cart navbar-likes" aria-label={`Liked products, ${likeCount}`}>
              <HeartIcon size={24} />
              {likeCount > 0 && <span className="navbar-cart-count navbar-likes-count">{likeCount > 99 ? '99+' : likeCount}</span>}
              <span className="navbar-cart-label">Likes</span>
            </Link>

            <Link to="/cart" className="navbar-cart" aria-label={`Cart, ${cartCount} items`}>
              <CartIcon size={24} />
              <span className="navbar-cart-count">{cartCount > 99 ? '99+' : cartCount}</span>
              <span className="navbar-cart-label">Cart</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom row: main links + account links (becomes the mobile menu) */}
      <nav id="main-menu" className={`navbar-menu ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
        <div className="container navbar-menu-inner">
          <ul className="nav-links">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end={link.end} className="nav-link">
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="nav-account">
            {/* Sellers use a separate website (SellerTribe) */}
            <a href={siteConfig.sellerSiteUrl} className="nav-link nav-link-seller">
              <StoreIcon size={18} /> Sell with us
            </a>

            {user && (
              <NavLink to="/orders" className="nav-link">
                <PackageIcon size={18} /> My Orders
              </NavLink>
            )}

            {user ? (
              <button type="button" className="btn btn-outline btn-sm nav-logout" onClick={handleLogout}>
                <LogoutIcon size={16} /> Logout
              </button>
            ) : (
              <>
                <NavLink to="/login" className="nav-link">
                  Login
                </NavLink>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Dark background behind the open mobile menu */}
      {menuOpen && <div className="navbar-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
    </header>
  );
}

export default Navbar;
