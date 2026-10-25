// routes/productRoutes.js  ->  /api/products/...
// Read-only: sellers add and manage products on the SellerTribe website.

const express = require('express');
const { getProducts, getSuggestions, getProductById } = require('../controllers/productController');

const router = express.Router();

router.get('/', getProducts);
router.get('/suggestions', getSuggestions); // live search suggestions - must come before '/:id'
router.get('/:id', getProductById);

module.exports = router;
