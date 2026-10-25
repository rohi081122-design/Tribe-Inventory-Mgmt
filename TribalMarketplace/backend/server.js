// server.js
// Entry point of the marketplace (buyer) backend.
// Sellers upload products through the separate SellerTribe backend, which uses the same database.
// It:
//   1. loads settings from .env
//   2. sets up security, CORS, cookies and JSON parsing
//   3. registers the API routes (MVC: routes -> controllers -> models)
//   4. starts the server and connects to MongoDB

require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const { connectDB, isDatabaseConnected } = require('./config/db');
const { seedCategories } = require('./seed/seedCategories');
const { sendCsrfToken, verifyCsrfToken } = require('./middleware/csrfMiddleware');
const { requireDatabase } = require('./middleware/dbMiddleware');
const { apiLimiter } = require('./middleware/rateLimiters');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const contactRoutes = require('./routes/contactRoutes');
const orderRoutes = require('./routes/orderRoutes');
const likeRoutes = require('./routes/likeRoutes');

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

/* ---------- Check required settings ---------- */

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.startsWith('PASTE_')) {
  console.error('\n❌ JWT_SECRET is not set.');
  console.error('   Open backend/.env and paste a long random secret after JWT_SECRET=');
  console.error('   Generate one with:  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"\n');
  process.exit(1);
}
if (jwtSecret.length < 32) {
  console.warn('⚠️  JWT_SECRET is shorter than 32 characters. Use a longer random secret.');
}

// The frontend address(es) allowed to call this API. Several can be separated with commas.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

/* ---------- App setup ---------- */

const app = express();

// On hosting platforms (Render, Railway...) the app runs behind a proxy.
// This lets secure cookies and rate limiting see the real visitor.
if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(helmet()); // sets safe HTTP headers

app.use(
  cors({
    origin(origin, callback) {
      // No origin = request from Postman / curl / same server. Otherwise it must be in the list.
      callback(null, !origin || allowedOrigins.includes(origin));
    },
    credentials: true, // allow the auth cookie to be sent
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'], // DELETE is used to unlike a product
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(cookieParser());

/* ---------- Routes ---------- */

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Tribal Marketplace API is running. Try GET /api/health' });
});

// Quick status check (useful while setting up)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    database: isDatabaseConnected() ? 'connected' : 'not connected',
  });
});

app.use('/api', apiLimiter);

// CSRF token for the frontend (see middleware/csrfMiddleware.js)
app.get('/api/csrf-token', sendCsrfToken);
app.use('/api', verifyCsrfToken);

// Everything below needs MongoDB
app.use('/api/auth', requireDatabase, authRoutes);
app.use('/api/products', requireDatabase, productRoutes);
app.use('/api/categories', requireDatabase, categoryRoutes);
app.use('/api/contact', requireDatabase, contactRoutes);
app.use('/api/orders', requireDatabase, orderRoutes); // checkout and buyer orders
app.use('/api/likes', requireDatabase, likeRoutes); // the buyer's liked products

// 404 for unknown routes, then the central error handler (must be last)
app.use(notFound);
app.use(errorHandler);

/* ---------- Start ---------- */

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}  (${isProduction ? 'production' : 'development'})`);
  console.log(`   Allowed frontend origin(s): ${allowedOrigins.join(', ')}`);
});

// Connect to MongoDB. When connected, create the default categories if the database is empty.
connectDB(() => seedCategories({ onlyIfEmpty: true }));

module.exports = app;
