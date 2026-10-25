// data/pageHeaderPhotos.js
// Photos shown behind the page titles of the seller website (under a dark overlay so the
// text stays readable) - the same style as the marketplace.
//
// The photos are the marketplace's openly licensed banner photos (copied to public/images/banners).
// Their photographer credits are listed on the marketplace Photo Credits page (linked in the footer).
//
// Fields:
//   url       - a file in frontend/public/images (for example '/images/banners/artisan.jpg') or a full https:// URL
//   position  - which part of the photo stays visible when it is cropped (CSS background-position)
//
// To use your own photo: put it in frontend/public/images/banners and change url.

const pageHeaderPhotos = {
  dashboard: { url: '/images/banners/sellers.jpg', position: 'center 20%' }, // artisan making lac bangles
  addProduct: { url: '/images/banners/artisan.jpg', position: 'center 45%' }, // basket weaver at work
  editProduct: { url: '/images/banners/handmade.jpg', position: 'center 45%' }, // Dokra metal craft
  orders: { url: '/images/banners/orders.jpg', position: 'center 40%' }, // a parcel being packed
  admin: { url: '/images/banners/heritage.jpg', position: 'center top' }, // Sohrai wall painting, Hazaribagh
};

// Style for <section className="page-header page-header-photo" style={headerPhotoStyle(...)}>
// The CSS (global.css) puts the dark overlay on top of this photo.
export function headerPhotoStyle(photo) {
  if (!photo || !photo.url) return undefined;
  return {
    '--header-photo': `url("${photo.url}")`,
    '--header-photo-position': photo.position || 'center',
  };
}

export default pageHeaderPhotos;
