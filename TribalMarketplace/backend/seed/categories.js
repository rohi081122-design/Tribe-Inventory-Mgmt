// seed/categories.js
// The starting list of categories and subcategories.
//
// To add a new category or subcategory:
//   1. Add it to this list (slugs for subcategories are created automatically)
//   2. Run "npm run seed" inside the backend folder
// To remove a category: delete it from this list and run "npm run seed". Products that were in it
// are kept, but become "uncategorised".
//
// RULE: Tribal Marketplace does NOT sell food or drinks (no honey, mahua, millets, rice, dal,
// pickles, snacks ...). Do not add food categories or subcategories here.
// The frontend reads categories from the API, so no frontend code needs to change.
//
// image:       a photo in TribalMarketplace/frontend/public/images/categories (or a full https:// URL).
//              Leave it empty ('') to show the emoji icon instead.
// imageCredit: photographer + licence, required for the Creative Commons photos used now.
//              Shown on the Photo Credits page. Remove it when you use your own photos.

const categories = [
  {
    name: 'Handicrafts and Tribal Art',
    slug: 'handicrafts-tribal-art',
    icon: '🏺',
    description: 'Dokra metal craft, terracotta, wood carving and traditional paintings.',
    image: '/images/categories/handicrafts-tribal-art.jpg', // file in TribalMarketplace/frontend/public/images/categories
    imageCredit: { text: 'Photo: Footlooseinme, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=87534805' },
    subcategories: [
      'Dokra Art',
      'Terracotta Art',
      'Wooden Handicrafts',
      'Tribal Paintings',
      'Handmade Decorative Items',
    ],
  },
  {
    name: 'Bamboo and Cane Products',
    slug: 'bamboo-cane-products',
    icon: '🎋',
    description: 'Baskets, furniture, decor and everyday items woven from bamboo and cane.',
    image: '/images/categories/bamboo-cane-products.jpg', // file in TribalMarketplace/frontend/public/images/categories
    imageCredit: { text: 'Photo: Thamizhpparithi Maari, CC BY-SA 3.0', url: 'https://commons.wikimedia.org/w/index.php?curid=17755278' },
    subcategories: ['Bamboo Baskets', 'Bamboo Home Decor', 'Cane Products', 'Bamboo Furniture', 'Bamboo Utility Items'],
  },
  {
    name: 'Tribal Jewellery',
    slug: 'tribal-jewellery',
    icon: '📿',
    description: 'Necklaces, earrings, bangles and beadwork made by hand.',
    image: '/images/categories/tribal-jewellery.jpg', // file in TribalMarketplace/frontend/public/images/categories
    imageCredit: { text: 'Photo: Sampoddar007, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=87355312' },
    subcategories: ['Tribal Necklaces', 'Earrings', 'Bangles and Bracelets', 'Beaded Jewellery', 'Dokra Jewellery', 'Anklets'],
  },
  {
    name: 'Forest Products',
    slug: 'forest-products',
    icon: '🌳',
    description: 'Lac, sal leaves and other natural materials collected from the forest.',
    image: '/images/categories/forest-products.jpg', // file in TribalMarketplace/frontend/public/images/categories
    imageCredit: { text: 'Photo: Xzantiyamoloy, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=133233926' },
    subcategories: ['Lac Products', 'Sal Leaf Products'],
  },
  {
    name: 'Home and Kitchen',
    slug: 'home-kitchen',
    icon: '🧺',
    description: 'Clay utensils, terracotta pots, wooden and bamboo kitchenware.',
    image: '/images/categories/home-kitchen.jpg', // file in TribalMarketplace/frontend/public/images/categories
    imageCredit: { text: 'Photo: Sam Howzit, CC BY 2.0', url: 'https://www.flickr.com/photos/12508217@N08/6086355843' },
    subcategories: [
      'Clay Utensils',
      'Terracotta Pots',
      'Wooden Kitchenware',
      'Bamboo Kitchenware',
      'Handmade Storage Baskets',
    ],
  },
  {
    name: 'Eco-Friendly Products',
    slug: 'eco-friendly-products',
    icon: '🍃',
    description: 'Leaf plates, leaf bowls, natural fibre goods and reusable bags.',
    image: '/images/categories/eco-friendly-products.jpg', // file in TribalMarketplace/frontend/public/images/categories
    imageCredit: { text: 'Photo: Gannu03, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=182550925' },
    subcategories: ['Sal Leaf Plates', 'Leaf Bowls', 'Natural Fibre Products', 'Reusable Handmade Bags'],
  },
  {
    name: 'Tribal Culture',
    slug: 'tribal-culture',
    icon: '🥁',
    description: 'Musical instruments, cultural artifacts and handmade souvenirs.',
    image: '/images/categories/tribal-culture.jpg', // file in TribalMarketplace/frontend/public/images/categories
    imageCredit: { text: 'Photo: Digantatalukdar, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/w/index.php?curid=57421040' },
    subcategories: [
      'Traditional Musical Instruments',
      'Cultural Artifacts',
      'Handmade Souvenirs',
      'Traditional Decorative Items',
    ],
  },
];

module.exports = categories;
