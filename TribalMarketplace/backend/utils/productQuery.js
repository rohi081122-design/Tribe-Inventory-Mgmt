// utils/productQuery.js
// Shared logic for product listings: search, sorting and pagination.
// Used by productController and categoryController so the rules stay the same everywhere.

const Product = require('../models/Product');
const Category = require('../models/Category');
const { cleanString, escapeRegex } = require('./validators');

// ?sort=... values the API understands
const SORT_OPTIONS = {
  newest: { createdAt: -1, _id: -1 },
  price_asc: { price: 1, _id: -1 },
  price_desc: { price: -1, _id: -1 },
  popular: { views: -1, createdAt: -1, _id: -1 },
};

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;

// Seller fields that are safe to show to everyone (never the contact number or Aadhaar)
const PUBLIC_SELLER_FIELDS = 'name village district state';

// Reads ?page= and ?limit= safely (always returns sensible numbers)
function readPagination(query, defaultLimit = DEFAULT_LIMIT) {
  const page = Math.max(1, parseInt(cleanString(query.page), 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(cleanString(query.limit), 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

function readSort(query) {
  const sortKey = cleanString(query.sort);
  return SORT_OPTIONS[sortKey] ? sortKey : 'newest';
}

// "Baskets" -> "basket", so plural searches still match (very simple, but helpful)
function simplifyWord(word) {
  return word.length > 3 && word.endsWith('s') ? word.slice(0, -1) : word;
}

// Adds a search condition to the filter.
// Every word the user types must appear somewhere in the product: its name, description,
// subcategory, village, district, main category name or a category the seller typed ("Other"). Matching ignores upper/lower case
// and partial words work ("bamb" finds "Bamboo").
// Example: "lamp bamboo" finds "Bamboo Table Lamp"; "jewellery" finds everything in Tribal Jewellery.
async function addTextSearch(filter, searchValue) {
  const search = cleanString(searchValue).slice(0, 100);
  const words = search.split(/\s+/).filter(Boolean).slice(0, 6).map(simplifyWord);
  if (words.length === 0) {
    return search;
  }

  const conditions = await Promise.all(
    words.map(async (word) => {
      const pattern = { $regex: escapeRegex(word), $options: 'i' };
      const matchingCategories = await Category.find({ name: pattern }).select('_id');
      return {
        $or: [
          { name: pattern },
          { description: pattern },
          { subcategoryName: pattern },
          { customCategory: pattern }, // a category the seller typed ("Other")
          { village: pattern },
          { district: pattern },
          { category: { $in: matchingCategories.map((category) => category._id) } },
        ],
      };
    })
  );

  filter.$and = [...(filter.$and || []), ...conditions];
  return search;
}

// Runs the query for one page of products and counts the total in parallel
async function findProductsPage(filter, query, defaultLimit = DEFAULT_LIMIT) {
  const { page, limit, skip } = readPagination(query, defaultLimit);
  const sort = readSort(query);

  // Never show products of sellers whose access was removed by the team
  const visibleFilter = { ...filter, hidden: { $ne: true } };

  const [products, totalProducts] = await Promise.all([
    Product.find(visibleFilter)
      .sort(SORT_OPTIONS[sort])
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug')
      .populate('seller', PUBLIC_SELLER_FIELDS),
    Product.countDocuments(visibleFilter),
  ]);

  return {
    products,
    page,
    limit,
    sort,
    totalProducts,
    totalPages: Math.max(1, Math.ceil(totalProducts / limit)),
  };
}

module.exports = {
  PUBLIC_SELLER_FIELDS,
  readPagination,
  addTextSearch,
  findProductsPage,
};
