// seed/seedDemoProducts.js
// Adds (or removes) the SAMPLE products from seed/demoProducts.js.
//
//   npm run seed:demo          -> creates the demo seller, uploads each photo to Cloudinary
//                                 and saves the products (products that already exist are skipped).
//                                 Demo-seller products that are NO LONGER listed in demoProducts.js
//                                 are deleted, so the file always decides which samples exist.
//   npm run seed:demo:remove   -> deletes all products of the demo seller, their Cloudinary photos
//                                 and the demo seller account
//
// Because both websites share one database, the products appear on the marketplace straight away.

require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');

const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { isCloudinaryConfigured, uploadImageBuffer, deleteImage } = require('../config/cloudinary');
const { isRealImage } = require('../middleware/uploadMiddleware');
const { hashAadhaar } = require('../utils/aadhaar');
const { DEMO_SELLER, DEMO_PRODUCTS } = require('./demoProducts');

const DEMO_IMAGE_FOLDER = 'tribal-marketplace/demo';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Downloads a photo and checks that it really is an image
async function downloadPhoto(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'TribalMarketplace-demo-seed/1.0 (college project)' },
  });
  if (!response.ok) {
    throw new Error(`photo download failed (HTTP ${response.status})`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!isRealImage(buffer)) {
    throw new Error('the downloaded file is not a JPEG, PNG or WebP image');
  }
  return buffer;
}

// Finds the demo seller, or creates it the first time
async function getDemoSeller() {
  const existing = await Seller.findOne({ phone: DEMO_SELLER.phone });
  if (existing) {
    // The demo seller is always an approved seller, and its products are visible
    if (!existing.isApproved) {
      existing.isApproved = true;
      existing.approvedAt = new Date();
      await existing.save();
    }
    await Product.updateMany({ seller: existing._id }, { hidden: false });
    return existing;
  }
  return Seller.create({
    name: DEMO_SELLER.name,
    phone: DEMO_SELLER.phone,
    aadhaarHash: hashAadhaar(DEMO_SELLER.aadhaar),
    aadhaarLast4: DEMO_SELLER.aadhaar.slice(-4),
    village: DEMO_SELLER.village,
    district: DEMO_SELLER.district,
    state: DEMO_SELLER.state,
    isApproved: true,
    approvedAt: new Date(),
  });
}

async function addDemoProducts() {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured. Add the Cloudinary keys to SellerTribe/backend/.env first.');
  }

  const categories = await Category.find();
  if (categories.length === 0) {
    throw new Error('No categories found. Start the TribalMarketplace backend once (it creates the categories).');
  }
  const categoryBySlug = {};
  categories.forEach((category) => {
    categoryBySlug[category.slug] = category;
  });

  const seller = await getDemoSeller();
  let added = 0;

  let updated = 0;

  for (const item of DEMO_PRODUCTS) {
    const category = categoryBySlug[item.category];
    const subcategory = category ? category.findSubcategory(item.subcategory) : null;

    // Running the script again never creates duplicates. Older sample products only get the
    // details that the upload form now requires (village, district, subcategory) filled in.
    const existing = await Product.findOne({ seller: seller._id, name: item.name });
    if (existing) {
      existing.village = existing.village || DEMO_SELLER.village;
      existing.district = existing.district || DEMO_SELLER.district;
      if (!existing.subcategory && subcategory) {
        existing.subcategory = subcategory.slug;
        existing.subcategoryName = subcategory.name;
      }
      if (existing.isModified()) {
        await existing.save();
        updated++;
        console.log(`   ✏️  details filled in: ${item.name}`);
      } else {
        console.log(`   • already exists: ${item.name}`);
      }
      continue;
    }

    try {
      const photo = await downloadPhoto(item.photo.url);
      const uploaded = await uploadImageBuffer(photo, DEMO_IMAGE_FOLDER);

      await Product.create({
        name: item.name,
        price: item.price,
        stock: item.stock,
        // The photo credit is shown with the description (required by the photo licences)
        description: `${item.description}\n\nSample listing. ${item.photo.credit}`,
        category: category ? category._id : null,
        subcategory: subcategory ? subcategory.slug : '',
        subcategoryName: subcategory ? subcategory.name : '',
        village: DEMO_SELLER.village,
        district: DEMO_SELLER.district,
        image: { url: uploaded.secure_url, publicId: uploaded.public_id },
        seller: seller._id,
      });

      added++;
      console.log(`   ✅ added: ${item.name}`);
    } catch (error) {
      console.log(`   ⚠️  skipped ${item.name}: ${error.message}`);
    }

    await wait(300); // be gentle with the photo websites
  }

  // Remove demo products that were taken out of demoProducts.js
  const listedNames = DEMO_PRODUCTS.map((item) => item.name);
  const unlisted = await Product.find({ seller: seller._id, name: { $nin: listedNames } });
  for (const product of unlisted) {
    await deleteProductImages(product);
    await product.deleteOne();
    console.log(`   🗑️  removed (no longer in demoProducts.js): ${product.name}`);
  }

  console.log(`\n🌱 ${added} sample products added and ${updated} updated for "${seller.name}".`);
  console.log(`   Demo seller login on SellerTribe: contact number ${DEMO_SELLER.phone}`);
}

// Deletes the main photo and any extra photos (side view, top view ...) of a product from Cloudinary
async function deleteProductImages(product) {
  const photos = [product.image, ...(product.extraImages || [])];
  for (const photo of photos) {
    await deleteImage(photo.publicId);
  }
}

async function removeDemoProducts() {
  const seller = await Seller.findOne({ phone: DEMO_SELLER.phone });
  if (!seller) {
    console.log('No demo seller found - nothing to remove.');
    return;
  }

  const products = await Product.find({ seller: seller._id });
  for (const product of products) {
    await deleteProductImages(product);
    await product.deleteOne();
  }
  await seller.deleteOne();

  console.log(`🗑️  Removed ${products.length} sample products, their photos and the demo seller.`);
}

(async () => {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.startsWith('PASTE_') || !process.env.AADHAAR_SECRET) {
    console.error('❌ MONGO_URI and AADHAAR_SECRET must be set in SellerTribe/backend/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    if (process.argv.includes('--remove')) {
      await removeDemoProducts();
    } else {
      await addDemoProducts();
    }
  } catch (error) {
    console.error('❌', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
