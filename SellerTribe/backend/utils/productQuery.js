// utils/productQuery.js
// Search, sorting and pagination for the seller's product list.

const Product = require('../models/Product');
const { cleanString, escapeRegex } = require('./validators');

// ?sort=... values the API understands
const SORT_OPTIONS = {
  newest: { createdAt: -1, _id: -1 },
  price_asc: { price: 1, _id: -1 },
  price_desc: { price: -1, _id: -1 },
  popular: { views: -1, createdAt: -1, _id: -1 },
};

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 48;

// Reads ?page= and ?limit= safely (always returns sensible numbers)
function readPagination(query) {
  const page = Math.max(1, parseInt(cleanString(query.page), 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(cleanString(query.limit), 10) || DEFAULT_LIMIT));
  return { page, limit, skip: (page - 1) * limit };
}

// Adds a case-insensitive "name contains ..." condition (partial matches work)
function addNameSearch(filter, searchValue) {
  const search = cleanString(searchValue).slice(0, 100);
  if (search) {
    filter.name = { $regex: escapeRegex(search), $options: 'i' };
  }
  return search;
}

// Runs the query for one page of products and counts the total in parallel
async function findProductsPage(filter, query) {
  const { page, limit, skip } = readPagination(query);
  const sortKey = cleanString(query.sort);
  const sort = SORT_OPTIONS[sortKey] ? sortKey : 'newest';

  const [products, totalProducts] = await Promise.all([
    Product.find(filter).sort(SORT_OPTIONS[sort]).skip(skip).limit(limit).populate('category', 'name slug'),
    Product.countDocuments(filter),
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

module.exports = { addNameSearch, findProductsPage };
