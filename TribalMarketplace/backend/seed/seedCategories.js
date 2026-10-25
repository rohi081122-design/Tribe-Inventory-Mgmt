// seed/seedCategories.js
// Saves the categories from seed/categories.js into MongoDB.
//
// - The server calls seedCategories({ onlyIfEmpty: true }) on startup, so a brand-new
//   database gets its categories automatically (and never gets duplicates on restart).
// - Run "npm run seed" to apply changes you made in seed/categories.js.
//   Categories are matched by their slug and updated in place ("upsert"), so running
//   the script many times never creates duplicates. Categories that were REMOVED from the
//   list are deleted, and their products become uncategorised.

const Category = require('../models/Category');
const Product = require('../models/Product');
const categoryData = require('./categories');
const { slugify } = require('../utils/validators');

async function seedCategories({ onlyIfEmpty = false } = {}) {
  if (onlyIfEmpty) {
    const existingCount = await Category.countDocuments();
    if (existingCount > 0) {
      return;
    }
  }

  for (const [index, category] of categoryData.entries()) {
    const slug = category.slug || slugify(category.name);

    await Category.updateOne(
      { slug },
      {
        $set: {
          name: category.name,
          slug,
          icon: category.icon || '',
          image: category.image || '',
          imageCredit: category.imageCredit || { text: '', url: '' },
          description: category.description || '',
          displayOrder: index + 1,
          subcategories: category.subcategories.map((name) => ({ name, slug: slugify(name) })),
        },
      },
      { upsert: true }
    );
  }

  // Delete categories that are no longer in seed/categories.js
  const listedSlugs = categoryData.map((category) => category.slug || slugify(category.name));
  const removed = await Category.find({ slug: { $nin: listedSlugs } });
  if (removed.length > 0) {
    const removedIds = removed.map((category) => category._id);
    await Product.updateMany(
      { category: { $in: removedIds } },
      { $set: { category: null, subcategory: '', subcategoryName: '' } }
    );
    await Category.deleteMany({ _id: { $in: removedIds } });
    console.log(`🗑️  Removed categories: ${removed.map((category) => category.name).join(', ')}`);
  }

  console.log(`🌱 Categories ready (${categoryData.length} main categories).`);
}

// This block only runs for "npm run seed" (not when the server imports this file)
if (require.main === module) {
  require('dotenv').config({ quiet: true });
  const mongoose = require('mongoose');

  (async () => {
    const uri = process.env.MONGO_URI;
    if (!uri || uri.startsWith('PASTE_')) {
      console.error('❌ MONGO_URI is not set. Paste your MongoDB connection string into backend/.env first.');
      process.exit(1);
    }

    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
      await seedCategories();
      console.log('✅ Category seeding finished.');
    } catch (error) {
      console.error('❌ Seeding failed:', error.message);
      process.exitCode = 1;
    } finally {
      await mongoose.disconnect();
    }
  })();
}

module.exports = { seedCategories };
