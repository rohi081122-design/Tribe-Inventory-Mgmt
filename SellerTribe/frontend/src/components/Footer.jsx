// components/Footer.jsx

import { Link } from 'react-router-dom';
import siteConfig from '../data/siteConfig.js';

function Footer() {
  return (
    <footer className="seller-footer">
      <div className="pattern-strip" aria-hidden="true" />
      <div className="container seller-footer-inner">
        <p>
          © {new Date().getFullYear()} {siteConfig.name} - the seller website of{' '}
          <a href={siteConfig.marketplaceUrl}>Tribal Marketplace</a>.
        </p>
        <p className="seller-footer-note">
          Only sellers approved by the Tribal Marketplace team can upload products. <Link to="/admin">Team login</Link>
          {' · '}
          <a href={`${siteConfig.marketplaceUrl}/credits`}>Photo credits</a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
