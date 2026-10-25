// controllers/productController.js
// Listing, searching and viewing products, and live search suggestions for the search box.
// Products are created, edited and deleted by sellers on the separate SellerTribe website,
// so this marketplace API only READS them.

const Product = require('../models/Product');
const Category = require('../models/Category');
const { cleanString, escapeRegex, isValidObjectId } = require('../utils/validators');
const { PUBLIC_SELLER_FIELDS, addTextSearch, findProductsPage } = require('../utils/productQuery');

const MAX_IDS_PER_REQUEST = 48;
const DEFAULT_SUGGESTIONS = 8;
const MAX_SUGGESTIONS = 10;

// @route  GET /api/products
// @query  search, category (id or slug), subcategory (slug), sort, page, limit, ids (comma separated)
// @access Public
async function getProducts(req, res) {
  const filter = {};
  const search = await addTextSearch(filter, req.query.search);

  const categoryValue = cleanString(req.query.category);
  if (categoryValue) {
    const category = await Category.findByIdOrSlug(categoryValue);
    if (!category) {
      return res.json({ success: true, search, products: [], page: 1, totalPages: 1, totalProducts: 0 });
    }
    filter.category = category._id;
  }

  const subcategory = cleanString(req.query.subcategory).toLowerCase();
  if (subcategory) {
    filter.subcategory = subcategory;
  }

  // ?ids=id1,id2,... lets the cart fetch the latest price of the products inside it
  const idsText = cleanString(req.query.ids);
  if (idsText) {
    const ids = idsText.split(',').map((id) => id.trim()).filter(isValidObjectId).slice(0, MAX_IDS_PER_REQUEST);
    filter._id = { $in: ids };
  }

  const result = await findProductsPage(filter, req.query);
  res.json({ success: true, search, ...result });
}

// @route  GET /api/products/suggestions?q=bam&limit=8
// @access Public
// Live suggestions for the search box (autocomplete). Upper/lower case does not matter.
// Best matches come first:
//   0. the name STARTS with the text            "Bam"    -> "Bamboo Basket with Handle"
//   1. a word in the name starts with the text  "lamp"   -> "Bamboo Table Lamp"
//   2. the name contains the text               "boo"    -> "Bamboo Floor Mat"
//   3. the name contains every typed word       "lamp bamboo" -> "Bamboo Table Lamp"
//   4. the category or subcategory matches      "jewel"  -> products in Tribal Jewellery
// Inside each group, the most viewed products come first.
// With only 1-2 letters, only names / categories with a word STARTING with them are used,
// so "b" suggests "Bamboo ..." and "Beaded ..." instead of every name that has a "b" somewhere.
async function getSuggestions(req, res) {
  const query = cleanString(req.query.q).replace(/\s+/g, ' ').slice(0, 60);
  const limit = Math.min(MAX_SUGGESTIONS, Math.max(1, parseInt(cleanString(req.query.limit), 10) || DEFAULT_SUGGESTIONS));
  if (!query) {
    return res.json({ success: true, query, products: [] });
  }

  const escaped = escapeRegex(query);
  const words = query.split(' ').slice(0, 5);
  const isShort = query.length < 3;
  const startsWith = new RegExp(`^${escaped}`, 'i');
  const wordStart = new RegExp(`(^|[^a-z0-9])${escaped}`, 'i');
  const textMatch = isShort ? wordStart : new RegExp(escaped, 'i');

  const matchingCategories = await Category.find({ name: textMatch }).select('_id');
  const conditions = [
    { name: textMatch },
    { subcategoryName: textMatch },
    { customCategory: textMatch }, // a category the seller typed ("Other")
    { category: { $in: matchingCategories.map((category) => category._id) } },
  ];
  if (words.length > 1) {
    conditions.push({ $and: words.map((word) => ({ name: new RegExp(escapeRegex(word), 'i') })) });
  }

  const visible = { hidden: { $ne: true } };
  const fields = 'name price image category customCategory subcategoryName stock views';
  const [startMatches, otherMatches] = await Promise.all([
    // Names that start with the text are asked for separately, so they are never crowded out
    Product.find({ ...visible, name: startsWith }).select(fields).sort({ views: -1, createdAt: -1 }).limit(limit),
    Product.find({ ...visible, $or: conditions }).select(fields).sort({ views: -1, createdAt: -1 }).limit(60),
  ]);

  // Join both lists (without duplicates) and sort them by how well they match
  const seen = new Set();
  const candidates = [...startMatches, ...otherMatches].filter((product) => {
    const id = String(product._id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  const lowerWords = words.map((word) => word.toLowerCase());
  function matchRank(product) {
    const name = product.name.toLowerCase();
    if (startsWith.test(product.name)) return 0;
    if (wordStart.test(product.name)) return 1;
    if (!isShort && name.includes(query.toLowerCase())) return 2;
    if (lowerWords.length > 1 && lowerWords.every((word) => name.includes(word))) return 3;
    return 4;
  }
  const ranked = candidates
    .map((product, index) => ({ product, rank: matchRank(product), index }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .slice(0, limit);

  await Product.populate(
    ranked.map((item) => item.product),
    { path: 'category', select: 'name slug' }
  );

  res.json({
    success: true,
    query,
    // Only what the dropdown needs (keeps the response small and fast)
    products: ranked.map(({ product, rank }) => ({
      _id: product._id,
      name: product.name,
      price: product.price,
      imageUrl: product.image ? product.image.url : '',
      category: product.category
        ? { name: product.category.name, slug: product.category.slug }
        : product.customCategory
          ? { name: product.customCategory, slug: '' } // typed by the seller - no category page
          : null,
      subcategoryName: product.subcategoryName || '',
      stock: product.stock,
      matchedBy: rank === 4 ? 'category' : 'name',
    })),
  });
}

// @route  GET /api/products/:id
// @access Public
async function getProductById(req, res) {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  // Hidden products (seller's access removed) are treated as "not found"
  const product = await Product.findOne({ _id: id, hidden: { $ne: true } })
    .populate('category', 'name slug subcategories')
    .populate('seller', PUBLIC_SELLER_FIELDS);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  // Count this visit (used for "Popular products")
  await Product.updateOne({ _id: product._id }, { $inc: { views: 1 } });

  res.json({ success: true, product });
}

module.exports = { getProducts, getSuggestions, getProductById };
