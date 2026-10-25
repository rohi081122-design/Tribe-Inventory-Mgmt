const Category = require('../models/Category');

// @route  GET /api/categories
async function getCategories(req, res) {
  const categories = await Category.find()
    .select('name slug icon subcategories')
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  res.json({ success: true, categories });
}

module.exports = { getCategories };
