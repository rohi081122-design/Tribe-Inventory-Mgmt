// data/siteConfig.js
// Basic website settings that you can change without touching the components.

const siteConfig = {
  name: 'TriVira',
  tagline: 'Handmade in Jharkhand',

  // Website logo. Leave empty to use the built-in CSS logo.
  // Example: '/images/logo.png' (file in frontend/public/images) or a full https:// URL
  logoUrl: '', // PASTE_YOUR_LOGO_IMAGE_URL_HERE

  // Optional public contact email shown on the Contact page. Leave empty to hide it.
  contactEmail: '', // PASTE_YOUR_CONTACT_EMAIL_HERE

  // Address of the separate seller website (the SellerTribe project).
  // Set VITE_SELLER_SITE_URL in frontend/.env; locally it runs on http://localhost:5174
  sellerSiteUrl: (import.meta.env.VITE_SELLER_SITE_URL || 'http://localhost:5174').replace(/\/$/, ''),

  // Address of THIS website, used in shared product links (WhatsApp, Gmail, copy link ...).
  // Leave VITE_SITE_URL empty to use the address the visitor has open right now.
  siteUrl: (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, ''),
};

export default siteConfig;
