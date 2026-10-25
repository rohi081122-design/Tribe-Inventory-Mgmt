// data/pageHeaderPhotos.js
// Photos shown behind the title of the main pages and behind the homepage "Sell your handmade products"
// section (under a dark overlay so the text stays readable).
// Category pages use their own category photo instead (see CategoryProducts.jsx).
//
// Fields:
//   url       - a file in frontend/public/images (for example '/images/banners/handmade.jpg') or a full https:// URL
//   position  - which part of the photo stays visible when it is cropped (CSS background-position)
//   credit    - photographer and licence, shown on the Photo Credits page. Not needed for the homepage banner
//               photos (already credited in data/slides.js) or for your own photos.
//   title     - name used on the Photo Credits page
//
// To use your own photo: put it in frontend/public/images/banners and change url.

const pageHeaderPhotos = {
  products: { url: '/images/banners/handmade.jpg', position: 'center 45%' }, // Dokra metal craft
  likes: { url: '/images/banners/handmade.jpg', position: 'center 70%' }, // My Likes page (same Dokra photo)
  categories: { url: '/images/banners/heritage.jpg', position: 'center top' }, // Sohrai wall painting, Hazaribagh
  about: { url: '/images/banners/sellers.jpg', position: 'center 35%' }, // artisan making lac bangles
  contact: { url: '/images/banners/natural.jpg', position: 'center 55%' }, // Hundru Falls, Ranchi
  checkout: {
    url: '/images/banners/delivery.jpg', // an India Post postman with his bicycle and letters
    position: 'center 40%',
    title: 'Checkout page',
    credit: { text: 'Photo: Harvinder Chandigarh, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=129426318' },
  },
  cart: {
    url: '/images/banners/cart.jpg', // a stall of colourful handwoven baskets at a handicrafts fair
    position: 'center 40%',
    title: 'Cart page',
    credit: { text: 'Photo: Salil Kumar Mukherjee, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=189510078' },
  },
  orders: {
    url: '/images/banners/orders.jpg', // a parcel being packed for delivery (My Orders and order details)
    position: 'center 40%',
    title: 'My Orders pages',
    credit: { text: 'Photo: The Bag N Box Man LTD, CC BY 2.0', url: 'https://www.flickr.com/photos/195311218@N08/52177106715' },
  },
  sellerPromo: {
    url: '/images/banners/artisan.jpg', // a basket weaver at work with bamboo strips
    position: 'center 45%',
    title: 'Homepage "Sell your handmade products" section',
    credit: { text: 'Photo: Alokavinash11, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=130229762' },
  },
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
