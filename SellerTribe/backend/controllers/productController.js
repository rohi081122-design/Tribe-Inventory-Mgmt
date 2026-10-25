const Product = require('../models/Product');
const Category = require('../models/Category');
const httpError = require('../utils/httpError');
const { isCloudinaryConfigured, uploadImageBuffer, deleteImage } = require('../config/cloudinary');
const { MAX_EXTRA_IMAGES, EXTRA_IMAGE_LABELS } = require('../config/productPhotos');
const { isRealImage } = require('../middleware/uploadMiddleware');
const { cleanString, cleanText, escapeRegex, isValidObjectId, slugify, checkLength } = require('../utils/validators');
const { addNameSearch, findProductsPage } = require('../utils/productQuery');

const MAX_PRICE = 10000000; // ₹1 crore
const MAX_STOCK = 100000;


// Reads and validates the text fields sent by the upload / edit form
function readProductForm(body) {
  const errors = {};

  const name = cleanText(body.name);
  checkLength(errors, 'name', name, { label: 'Product name', min: 2, max: 120, required: true });

  const priceText = cleanString(body.price);
  const price = Number(priceText);
  if (!priceText) {
    errors.price = 'Price is required';
  } else if (!Number.isFinite(price) || price <= 0) {
    errors.price = 'Price must be a positive number';
  } else if (price > MAX_PRICE) {
    errors.price = 'Price is too high';
  }

  // Every field of the form is required (only the extra photos are optional)
  const stockText = cleanString(body.stock);
  const stock = Number(stockText);
  if (stockText === '') {
    errors.stock = 'Available stock is required';
  } else if (!Number.isInteger(stock) || stock < 0 || stock > MAX_STOCK) {
    errors.stock = `Stock must be a whole number between 0 and ${MAX_STOCK}`;
  }

  const description = cleanText(body.description);
  checkLength(errors, 'description', description, { label: 'Description', min: 10, max: 2000, required: true });

  const village = cleanText(body.village);
  checkLength(errors, 'village', village, { label: 'Village', min: 2, max: 60, required: true });

  const district = cleanText(body.district);
  checkLength(errors, 'district', district, { label: 'District', min: 2, max: 60, required: true });

  return {
    errors,
    values: {
      name,
      price: Math.round(price * 100) / 100, // keep at most 2 decimal places
      description,
      stock,
      village,
      district,
    },
    // What the seller picked: category / subcategory from the lists, or "other" plus a typed name
    categoryChoice: {
      category: cleanString(body.category),
      subcategory: cleanString(body.subcategory).toLowerCase(),
      customCategory: body.customCategory,
      customSubcategory: body.customSubcategory,
    },
  };
}

// The value the form sends when the seller picks "Other (type your own)"
const OTHER = 'other';

// Typed category names may not be about food or drinks (Tribal Marketplace does not sell them)
const FOOD_WORDS =
  /\b(food|foods|drinks?|beverages?|snacks?|pickles?|achaa?r|honey|spices?|masala|millets?|pulses?|daa?l|sweets?|juices?|tea|ghee)\b/i;

// Reads a typed category or subcategory name ("Grass Crafts") and checks it
function readTypedName(errors, field, value, label) {
  const name = cleanText(value);
  checkLength(errors, field, name, { label, min: 2, max: 40, required: true });
  if (!errors[field] && !slugify(name)) {
    errors[field] = `${label} must contain letters or numbers`;
  } else if (!errors[field] && FOOD_WORDS.test(name)) {
    errors[field] = 'Food and drinks cannot be sold on Tribal Marketplace';
  }
  return name;
}

// Finds a subcategory of a category by its readable name ("dokra art" -> Dokra Art)
function findSubcategoryByName(category, name) {
  const wanted = name.toLowerCase();
  return category.subcategories.find((sub) => sub.name.toLowerCase() === wanted) || null;
}

// Works out the category and subcategory to save (both are required) and returns what we store.
//   - normally both come from the lists
//   - "Other" category: the seller types the category name AND the subcategory name
//   - "Other" subcategory: a listed category, with a typed subcategory name
// A typed name that already exists in our lists ("tribal jewellery") uses the real one, so the
// same category is never saved twice under slightly different spellings.
async function resolveCategory(choice, errors) {
  const result = { category: null, customCategory: '', subcategory: '', subcategoryName: '' };

  if (!choice.category) {
    errors.category = 'Please choose a category';
    return result;
  }

  let category = null;
  if (choice.category === OTHER) {
    const name = readTypedName(errors, 'customCategory', choice.customCategory, 'Category name');
    if (errors.customCategory) return result;
    category = await Category.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') });
    if (!category) result.customCategory = name; // a new category, decided by the seller
  } else {
    category = await Category.findByIdOrSlug(choice.category);
    if (!category) {
      errors.category = 'The selected category does not exist';
      return result;
    }
  }
  if (category) result.category = category._id;

  // A subcategory from the list
  if (choice.subcategory !== OTHER && choice.category !== OTHER) {
    if (!choice.subcategory) {
      errors.subcategory = 'Please choose a subcategory';
      return result;
    }
    const subcategory = category.findSubcategory(choice.subcategory);
    if (!subcategory) {
      errors.subcategory = 'The selected subcategory does not belong to this category';
      return result;
    }
    result.subcategory = subcategory.slug;
    result.subcategoryName = subcategory.name;
    return result;
  }

  // A typed subcategory
  const subName = readTypedName(errors, 'customSubcategory', choice.customSubcategory, 'Subcategory name');
  if (errors.customSubcategory) return result;
  const listed = category ? findSubcategoryByName(category, subName) : null;
  result.subcategory = listed ? listed.slug : slugify(subName);
  result.subcategoryName = listed ? listed.name : subName;
  return result;
}

// Reads a form field that contains JSON text.
// Returns `fallback` when the field was not sent, and null when the text is not valid JSON.
function readJsonField(value, fallback) {
  if (value === undefined) {
    return fallback;
  }
  try {
    return JSON.parse(String(value));
  } catch {
    return null;
  }
}

// Checks the optional extra photos (side view, top view ...) sent with the form.
//   newFiles      -> the new extra photo files (req.files.extraImages)
//   savedExtras   -> the extra photos the product already has (empty for a new product)
// The form also sends two JSON text fields:
//   extraImageLabels -> one view name per new file, e.g. ["Side view", "Top view"]
//   keepExtraImages  -> (edit only) the saved photos to keep, e.g. [{ "publicId": "...", "label": "Back view" }]
//                       When it is not sent, all saved photos are kept.
// Returns { keep, newLabels }: the saved photos that stay (with their possibly changed label)
// and the labels for the new files. Problems are written into `errors.extraImages`.
function readExtraPhotos(body, newFiles, savedExtras, errors) {
  const isAllowedLabel = (label) => EXTRA_IMAGE_LABELS.includes(label);

  // New photos
  const newLabels = readJsonField(body.extraImageLabels, newFiles.map(() => 'Other view'));
  if (!Array.isArray(newLabels) || newLabels.length !== newFiles.length || !newLabels.every(isAllowedLabel)) {
    errors.extraImages = 'Please choose a view (side, top ...) for every extra photo.';
    return { keep: [], newLabels: [] };
  }
  if (newFiles.some((file) => !isRealImage(file.buffer))) {
    errors.extraImages = 'One of the extra photos is not a valid JPEG, PNG or WebP image.';
    return { keep: [], newLabels: [] };
  }

  // Saved photos the seller wants to keep. Only photos of THIS product can be kept.
  const savedById = new Map(savedExtras.map((photo) => [photo.publicId, photo]));
  const keepList = readJsonField(
    body.keepExtraImages,
    savedExtras.map((photo) => ({ publicId: photo.publicId, label: photo.label }))
  );
  const keep = [];
  const keptIds = new Set();
  const keepListIsValid =
    Array.isArray(keepList) &&
    keepList.every((item) => {
      const saved = item && savedById.get(item.publicId);
      if (!saved || keptIds.has(saved.publicId) || !isAllowedLabel(item.label)) {
        return false;
      }
      keptIds.add(saved.publicId);
      keep.push({ url: saved.url, publicId: saved.publicId, label: item.label });
      return true;
    });

  if (!keepListIsValid) {
    errors.extraImages = 'The list of extra photos is not valid. Please reload the page and try again.';
    return { keep: [], newLabels: [] };
  }

  if (keep.length + newFiles.length > MAX_EXTRA_IMAGES) {
    errors.extraImages = `You can add at most ${MAX_EXTRA_IMAGES} extra photos.`;
  }

  return { keep, newLabels };
}

function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

function sendValidationErrors(res, errors) {
  return res.status(400).json({ success: false, message: 'Please correct the highlighted fields.', errors });
}

// Uploads the image file to Cloudinary and returns { url, publicId }
async function uploadToCloudinary(file) {
  if (!isCloudinaryConfigured()) {
    throw httpError(
      503,
      'Image uploads are not set up yet. Add your Cloudinary credentials to SellerTribe/backend/.env and restart the backend.'
    );
  }

  try {
    const result = await uploadImageBuffer(file.buffer);
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error('Cloudinary upload failed:', error.message);
    throw httpError(502, 'The image could not be uploaded. Please try again, or check the Cloudinary credentials.');
  }
}

// Uploads several files at the same time and returns a list of { url, publicId } in the same order.
// If one upload fails, the photos that did upload are deleted again, so nothing is left unused.
async function uploadAllToCloudinary(files) {
  const results = await Promise.allSettled(files.map(uploadToCloudinary));
  const uploaded = results.filter((result) => result.status === 'fulfilled').map((result) => result.value);
  const failure = results.find((result) => result.status === 'rejected');

  if (failure) {
    await deleteImages(uploaded.map((image) => image.publicId));
    throw failure.reason;
  }
  return uploaded;
}

async function deleteImages(publicIds) {
  await Promise.all(publicIds.map((publicId) => deleteImage(publicId)));
}

// Every Cloudinary image id of a product: the main photo and the extra photos
function getAllImageIds(product) {
  const extraIds = (product.extraImages || []).map((photo) => photo.publicId);
  return [product.image?.publicId, ...extraIds].filter(Boolean);
}

// Deletes an image from Cloudinary only if no OTHER product uses the same image
async function deleteImageIfUnused(publicId, productId) {
  if (!publicId) {
    return;
  }
  const usedByAnotherProduct = await Product.exists({
    _id: { $ne: productId },
    $or: [{ 'image.publicId': publicId }, { 'extraImages.publicId': publicId }],
  });
  if (!usedByAnotherProduct) {
    await deleteImage(publicId);
  }
}

// Loads a product and makes sure the logged-in seller owns it
async function findOwnProduct(productId, seller) {
  if (!isValidObjectId(productId)) {
    throw httpError(404, 'Product not found.');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw httpError(404, 'Product not found.');
  }

  if (!product.seller.equals(seller._id)) {
    throw httpError(403, 'You can only manage your own products.');
  }

  return product;
}

// Simple dashboard numbers for one seller
async function getSellerStats(sellerId) {
  const [summary] = await Product.aggregate([
    { $match: { seller: sellerId } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalStock: { $sum: { $ifNull: ['$stock', 0] } },
        totalViews: { $sum: '$views' },
        outOfStock: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } },
      },
    },
  ]);

  return summary
    ? {
        totalProducts: summary.totalProducts,
        totalStock: summary.totalStock,
        totalViews: summary.totalViews,
        outOfStock: summary.outOfStock,
      }
    : { totalProducts: 0, totalStock: 0, totalViews: 0, outOfStock: 0 };
}

/* ------------------------------------------------------------------ */
/* Controllers                                                         */
/* ------------------------------------------------------------------ */

// @route  GET /api/products/mine   (?search, sort, page, limit)
async function getMyProducts(req, res) {
  const filter = { seller: req.seller._id };
  const search = addNameSearch(filter, req.query.search);

  const [result, stats] = await Promise.all([findProductsPage(filter, req.query), getSellerStats(req.seller._id)]);

  res.json({ success: true, search, ...result, stats });
}

// @route  GET /api/products/:id   (only the seller's own product, used by the edit page)
async function getMyProduct(req, res) {
  const product = await findOwnProduct(req.params.id, req.seller);
  await product.populate('category', 'name slug');
  res.json({ success: true, product });
}

// @route  POST /api/products
// multipart/form-data with an "image" file (main photo) and optional "extraImages" files
async function createProduct(req, res) {
  const { errors, values, categoryChoice } = readProductForm(req.body);
  const categoryInfo = await resolveCategory(categoryChoice, errors);

  const mainFile = req.files?.image?.[0];
  const extraFiles = req.files?.extraImages || [];

  if (!mainFile) {
    errors.image = 'Please choose a product photo';
  } else if (!isRealImage(mainFile.buffer)) {
    errors.image = 'This file is not a valid JPEG, PNG or WebP image';
  }
  // A new product has no saved extra photos yet, so only new files are read
  const { newLabels } = readExtraPhotos(req.body, extraFiles, [], errors);

  if (hasErrors(errors)) {
    return sendValidationErrors(res, errors);
  }

  // Upload only after everything else is valid. The main photo is the first one in the list.
  const [image, ...uploadedExtras] = await uploadAllToCloudinary([mainFile, ...extraFiles]);
  const extraImages = uploadedExtras.map((photo, index) => ({ ...photo, label: newLabels[index] }));

  try {
    const product = await Product.create({
      ...values,
      ...categoryInfo,
      image,
      extraImages,
      seller: req.seller._id, // from the login cookie, never from the request body
    });
    await product.populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product uploaded! It is now visible on the marketplace.',
      product,
    });
  } catch (error) {
    // Saving failed, so remove the uploaded photos instead of leaving them unused in Cloudinary
    await deleteImages([image, ...extraImages].map((photo) => photo.publicId));
    throw error;
  }
}

// @route  PUT /api/products/:id
// multipart/form-data. The "image" file is optional (only to replace the main photo).
// New extra photos come as "extraImages" files; keepExtraImages says which saved ones stay.
async function updateProduct(req, res) {
  // Check ownership first, before doing any other work
  const product = await findOwnProduct(req.params.id, req.seller);

  const { errors, values, categoryChoice } = readProductForm(req.body);
  const categoryInfo = await resolveCategory(categoryChoice, errors);

  const mainFile = req.files?.image?.[0];
  const extraFiles = req.files?.extraImages || [];

  if (mainFile && !isRealImage(mainFile.buffer)) {
    errors.image = 'This file is not a valid JPEG, PNG or WebP image';
  }
  const { keep, newLabels } = readExtraPhotos(req.body, extraFiles, product.extraImages, errors);

  if (hasErrors(errors)) {
    return sendValidationErrors(res, errors);
  }

  // Remember the current photos, so the ones that are no longer used can be deleted after saving
  const oldImageIds = getAllImageIds(product);

  // Upload the new photos (the main photo first, if there is one)
  const uploaded = await uploadAllToCloudinary(mainFile ? [mainFile, ...extraFiles] : extraFiles);
  const newImage = mainFile ? uploaded[0] : null;
  const newExtras = (mainFile ? uploaded.slice(1) : uploaded).map((photo, index) => ({
    ...photo,
    label: newLabels[index],
  }));

  product.set({ ...values, ...categoryInfo });
  if (newImage) {
    product.image = newImage;
  }
  // Saved photos the seller kept come first, then the new ones (the same order as in the form)
  product.extraImages = [...keep, ...newExtras];

  try {
    await product.save();
  } catch (error) {
    await deleteImages(uploaded.map((photo) => photo.publicId));
    throw error;
  }

  // The changes are saved, so photos that were replaced or removed can go from Cloudinary
  const stillUsed = new Set(getAllImageIds(product));
  for (const publicId of oldImageIds) {
    if (!stillUsed.has(publicId)) {
      await deleteImageIfUnused(publicId, product._id);
    }
  }

  await product.populate('category', 'name slug');
  res.json({ success: true, message: 'Product updated successfully.', product });
}

// @route  DELETE /api/products/:id
async function deleteProduct(req, res) {
  const product = await findOwnProduct(req.params.id, req.seller);
  const imageIds = getAllImageIds(product);

  await product.deleteOne();
  for (const publicId of imageIds) {
    await deleteImageIfUnused(publicId, product._id);
  }

  res.json({ success: true, message: 'Product deleted. It is no longer shown on the marketplace.' });
}

module.exports = {
  getMyProducts,
  getMyProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
