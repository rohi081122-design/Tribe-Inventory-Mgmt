// controllers/categoryController.js
// Categories with their subcategories, and the products inside a category.

const Category = require('../models/Category');
const Product = require('../models/Product');
const { cleanString } = require('../utils/validators');
const { addTextSearch, findProductsPage } = require('../utils/productQuery');

// Adds "productCount" to every category and subcategory
async function addProductCounts(categories) {
  // One query that counts products per (category, subcategory) pair
  const counts = await Product.aggregate([
    { $match: { category: { $ne: null }, hidden: { $ne: true } } },
    { $group: { _id: { category: '$category', subcategory: '$subcategory' }, count: { $sum: 1 } } },
  ]);

  // countMap["<categoryId>"] = total, countMap["<categoryId>:<subSlug>"] = subcategory total
  const countMap = {};
  counts.forEach(({ _id, count }) => {
    const categoryKey = _id.category.toString();
    countMap[categoryKey] = (countMap[categoryKey] || 0) + count;
    if (_id.subcategory) {
      countMap[`${categoryKey}:${_id.subcategory}`] = count;
    }
  });

  return categories.map((category) => {
    const categoryKey = category._id.toString();
    return {
      ...category,
      productCount: countMap[categoryKey] || 0,
      subcategories: category.subcategories.map((sub) => ({
        ...sub,
        productCount: countMap[`${categoryKey}:${sub.slug}`] || 0,
      })),
    };
  });
}

// @route  GET /api/categories
// @access Public
async function getCategories(req, res) {
  // .lean() returns plain JavaScript objects, which are faster and easy to extend
  const categories = await Category.find().select('-__v').sort({ displayOrder: 1, name: 1 }).lean();
  const categoriesWithCounts = await addProductCounts(categories);

  res.json({ success: true, categories: categoriesWithCounts });
}

// @route  GET /api/categories/:id   (id or slug)
// @access Public
async function getCategory(req, res) {
  const category = await Category.findByIdOrSlug(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found.' });
  }

  const [categoryWithCounts] = await addProductCounts([category.toJSON()]);
  res.json({ success: true, category: categoryWithCounts });
}

// @route  GET /api/categories/:id/products   (id or slug)
// @query  subcategory (slug), search, sort, page, limit
// @access Public
async function getCategoryProducts(req, res) {
  const category = await Category.findByIdOrSlug(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found.' });
  }

  const filter = { category: category._id };

  const subcategorySlug = cleanString(req.query.subcategory).toLowerCase();
  if (subcategorySlug) {
    if (!category.findSubcategory(subcategorySlug)) {
      return res.status(404).json({ success: false, message: 'This subcategory does not exist in this category.' });
    }
    filter.subcategory = subcategorySlug;
  }

  const search = await addTextSearch(filter, req.query.search);
  const result = await findProductsPage(filter, req.query);

  res.json({ success: true, category, search, ...result });
}

module.exports = { getCategories, getCategory, getCategoryProducts };
