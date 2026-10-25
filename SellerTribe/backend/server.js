// server.js
// Entry point of the SellerTribe (seller website) backend. It:
//   1. loads settings from .env
//   2. sets up security, CORS, cookies and JSON parsing
//   3. registers the API routes (MVC: routes -> controllers -> models)
//   4. starts the server and connects to MongoDB
//
// It uses the SAME MongoDB database as TribalMarketplace, so every product uploaded here
// is shown on the marketplace website.

require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const { connectDB, isDatabaseConnected } = require('./config/db');
const { isCloudinaryConfigured } = require('./config/cloudinary');
const { isAdminPasswordConfigured } = require('./utils/adminAuth');
const { sendCsrfToken, verifyCsrfToken } = require('./middleware/csrfMiddleware');
const { requireDatabase } = require('./middleware/dbMiddleware');
const { apiLimiter } = require('./middleware/rateLimiters');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const PORT = process.env.PORT || 5001;
const isProduction = process.env.NODE_ENV === 'production';

/* ---------- Check required settings ---------- */

function isMissing(value) {
  return !value || value.startsWith('PASTE_');
}

if (isMissing(process.env.JWT_SECRET) || isMissing(process.env.AADHAAR_SECRET)) {
  console.error('\n❌ JWT_SECRET or AADHAAR_SECRET is not set.');
  console.error('   Open SellerTribe/backend/.env and paste a long random secret after each of them.');
  console.error('   Generate one with:  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"\n');
  process.exit(1);
}

// The frontend address(es) allowed to call this API. Several can be separated with commas.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

/* ---------- App setup ---------- */

const app = express();

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      // No origin = request from Postman / curl / same server. Otherwise it must be in the list.
      callback(null, !origin || allowedOrigins.includes(origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(cookieParser());

/* ---------- Routes ---------- */

app.get('/', (req, res) => {
  res.json({ success: true, message: 'SellerTribe API is running. Try GET /api/health' });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SellerTribe API is running',
    database: isDatabaseConnected() ? 'connected' : 'not connected',
    imageUploads: isCloudinaryConfigured() ? 'configured' : 'not configured',
  });
});

app.use('/api', apiLimiter);

app.get('/api/csrf-token', sendCsrfToken);
app.use('/api', verifyCsrfToken);

app.use('/api/auth', requireDatabase, authRoutes);
app.use('/api/products', requireDatabase, productRoutes);
app.use('/api/categories', requireDatabase, categoryRoutes);
app.use('/api/orders', requireDatabase, orderRoutes); // seller's orders
app.use('/api/notifications', requireDatabase, notificationRoutes); // seller's bell: new / cancelled orders
app.use('/api/admin', requireDatabase, adminRoutes); // team page: approve sellers, orders and earnings

app.use(notFound);
app.use(errorHandler);

/* ---------- Start ---------- */

app.listen(PORT, () => {
  console.log(`🚀 SellerTribe backend running on http://localhost:${PORT}  (${isProduction ? 'production' : 'development'})`);
  console.log(`   Allowed frontend origin(s): ${allowedOrigins.join(', ')}`);

  if (!isCloudinaryConfigured()) {
    console.warn('⚠️  Cloudinary is not configured - product photo uploads are disabled.');
    console.warn('   Paste your Cloudinary credentials into SellerTribe/backend/.env to enable them.');
  }
  if (!isAdminPasswordConfigured()) {
    console.warn('⚠️  ADMIN_PASSWORD is not set - the team cannot log in to approve sellers.');
    console.warn('   Add ADMIN_PASSWORD (at least 10 characters) to SellerTribe/backend/.env.');
  }
});

connectDB();

module.exports = app;
