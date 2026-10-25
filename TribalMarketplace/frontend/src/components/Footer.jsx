// components/Footer.jsx

import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import siteConfig from '../data/siteConfig.js';
import '../styles/footer.css';

const FOOTER_CATEGORIES = [
  { slug: 'handicrafts-tribal-art', name: 'Handicrafts & Tribal Art' },
  { slug: 'bamboo-cane-products', name: 'Bamboo & Cane' },
  { slug: 'tribal-jewellery', name: 'Tribal Jewellery' },
  { slug: 'forest-products', name: 'Forest Products' },
  { slug: 'eco-friendly-products', name: 'Eco-Friendly Products' },
  { slug: 'home-kitchen', name: 'Home & Kitchen' },
];

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="pattern-strip" aria-hidden="true" />

      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <Logo size={40} />
            <span>{siteConfig.name}</span>
          </Link>
          <p>
            An online marketplace where tribal artisans and local sellers from Jharkhand can showcase handmade
            products, traditional crafts and eco-friendly goods.
          </p>
        </div>

        <div className="footer-column">
          <h3>Explore</h3>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/products">All Products</Link>
            </li>
            <li>
              <Link to="/categories">Categories</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/credits">Photo Credits</Link>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Shop by Category</h3>
          <ul>
            {FOOTER_CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link to={`/categories/${category.slug}`}>{category.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Sellers use the separate SellerTribe website */}
        <div className="footer-column">
          <h3>For Sellers</h3>
          <ul>
            <li>
              <a href={`${siteConfig.sellerSiteUrl}/login?mode=register`}>Become a Seller</a>
            </li>
            <li>
              <a href={`${siteConfig.sellerSiteUrl}/login`}>Seller Login</a>
            </li>
            <li>
              <a href={`${siteConfig.sellerSiteUrl}/products/new`}>Upload a Product</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>
            © {year} {siteConfig.name}. Celebrating the crafts and culture of tribal communities.
          </p>
          <p className="footer-note">Prices are set by individual sellers.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
