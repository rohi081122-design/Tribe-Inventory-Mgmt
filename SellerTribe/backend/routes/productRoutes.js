// routes/productRoutes.js  ->  /api/products/...
// Every route needs a logged-in seller. Adding, editing and deleting also need an APPROVED seller.
// Ownership is checked inside the controller.

const express = require('express');
const {
  getMyProducts,
  getMyProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protectSeller, requireApprovedSeller } = require('../middleware/authMiddleware');
const { uploadProductPhotos } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protectSeller);

// "/mine" must come BEFORE "/:id", otherwise Express would treat "mine" as an id
router.get('/mine', getMyProducts);
router.get('/:id', getMyProduct);

// requireApprovedSeller runs BEFORE the upload middleware, so photos from unapproved sellers are never processed
router.post('/', requireApprovedSeller, uploadProductPhotos, createProduct);
router.put('/:id', requireApprovedSeller, uploadProductPhotos, updateProduct);
router.delete('/:id', requireApprovedSeller, deleteProduct);

module.exports = router;
