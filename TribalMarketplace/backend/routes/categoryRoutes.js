// routes/categoryRoutes.js  ->  /api/categories/...
// ":id" can be a MongoDB id or a slug such as "tribal-jewellery"

const express = require('express');
const { getCategories, getCategory, getCategoryProducts } = require('../controllers/categoryController');

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategory);
router.get('/:id/products', getCategoryProducts);

module.exports = router;
