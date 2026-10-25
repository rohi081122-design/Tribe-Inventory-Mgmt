// routes/categoryRoutes.js  ->  /api/categories

const express = require('express');
const { getCategories } = require('../controllers/categoryController');

const router = express.Router();

router.get('/', getCategories);

module.exports = router;
