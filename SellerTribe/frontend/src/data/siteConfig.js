// data/siteConfig.js
// Basic settings for the seller website.

const siteConfig = {
  name: 'SellerTribe',
  tagline: 'Seller Hub · Tribal Marketplace',

  // Address of the buyer marketplace (set VITE_MARKETPLACE_URL in frontend/.env)
  marketplaceUrl: (import.meta.env.VITE_MARKETPLACE_URL || 'http://localhost:5173').replace(/\/$/, ''),
};

export default siteConfig;
