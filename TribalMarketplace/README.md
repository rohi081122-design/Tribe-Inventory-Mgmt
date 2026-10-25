# Tribal Marketplace

An e-commerce website where buyers can discover products made by tribal artisans and local sellers from Jharkhand: handicrafts, bamboo products, tribal jewellery, tribal art and eco-friendly products.

> **No food or drinks.** Tribal Marketplace does not sell anything to eat or drink (no honey, mahua, millets, rice, dal, pickles or snacks). There are no food categories, and sellers are told so on the upload form.

The project has a **React (Vite) frontend** and a **Node.js + Express backend** built with the **MVC** pattern. Data is stored in **MongoDB**.

**Sellers use a separate website: [SellerTribe](../SellerTribe).** There they register, log in and upload product photos. SellerTribe saves products in the same MongoDB database, so they appear here immediately.

> This is a college project. Buyers can place orders with **Cash on Delivery**; online payment (UPI / card) is **not** implemented yet.

---

## Contents

1. [Project overview](#1-project-overview)
2. [Features](#2-features)
3. [Technologies used](#3-technologies-used)
4. [Folder structure](#4-folder-structure)
5. [Prerequisites](#5-prerequisites)
6. [Installation](#6-installation)
7. [MongoDB setup](#7-mongodb-setup)
8. [Environment variables](#8-environment-variables)
9. [Running the websites](#9-running-the-websites)
10. [Sellers and product uploads](#10-sellers-and-product-uploads)
11. [Buying, orders, platform and delivery charges](#11-buying-orders-platform-and-delivery-charges)
12. [Search and categories](#12-search-and-categories)
13. [Common errors and troubleshooting](#13-common-errors-and-troubleshooting)
14. [API reference](#14-api-reference)
15. [Images and placeholders](#15-images-and-placeholders)
16. [Security notes](#16-security-notes)
17. [Deployment notes](#17-deployment-notes)

---

## 1. Project overview

| Who | Where | What they can do |
| --- | --- | --- |
| **Visitor** | This website | Browse the homepage, categories, search and filter products, view product details and prices, send a contact query (with their mobile number) to the team |
| **Buyer** (registered) | This website | Everything a visitor can do, plus: **like** products (❤️), use the cart, **Buy Now**, place Cash on Delivery orders, see and cancel their orders |
| **Seller** | **SellerTribe** website | Register with name, contact number, Aadhaar and address; **after the team approves them**, upload, edit and delete their own products |

```text
SellerTribe (sellers, :5174 → API :5001) ──writes──►  MongoDB  ◄──reads── Tribal Marketplace (buyers, :5173 → API :5000)
```

---

## 2. Features

**Shopping**

- Homepage with an automatic sliding banner (carousel), a search box, featured categories, popular products, recently added products, a handicrafts section, a forest and eco-friendly products section, a "become a seller" section and an about section
- 7 main categories with subcategories, loaded from MongoDB (no food categories)
- Smart search on the server: every word you type is matched against the product name, description, category, subcategory and place (partial words, any order, upper/lower case and simple plurals all work)
- **Live search suggestions (autocomplete)** in the navbar and homepage search boxes: with every letter typed, matching products from the database appear below the box with photo, name (typed letters highlighted), category and price. Up / Down arrows + Enter, Escape, click outside, "See all results", loading and "no products found" messages; works on phones, tablets and desktops
- Filters: category, subcategory. Sorting: price low to high, price high to low, recently added, most popular
- Server-side pagination (12 products per page)
- Product details page with a photo slider (main photo + side view, top view ... when the seller added them; arrows, thumbnails, swipe), seller information (name and location only), stock status and related products
- Shopping cart for logged-in buyers, saved in the browser (add, change quantity, remove, subtotal). Prices are re-checked with the server when the cart opens.
- **Like button (❤️)** on every product card and on the product page. Clicking it turns the heart red and adds the product to the buyer's **My Likes** list (heart icon with a number in the navbar, page `/likes`); clicking the red heart again removes it, and on the My Likes page the product disappears from the list straight away. The list is saved in the buyer's account, so it is the same on every device. Visitors who click a heart are asked to log in first.
- Browser tab icon (favicon) in the same style as the logo

**Buying and orders** (login required)

- **Add to Cart** and **Buy Now** work only after logging in or registering. Visitors are sent to the login page and brought back afterwards.
- Every product line has a **platform charge** (5% of the price, minimum ₹10) on top of the seller's price. This is how Tribal Marketplace earns money. The product page shows the price, the platform charge and the total before buying.
- **Delivery charge by distance**: delivery is free within 50 km of the seller; farther away the buyer pays ₹1 per km beyond the zone (min ₹30, max ₹500). It is shown under the platform charge on the product page (for the logged-in buyer's district), in the cart and at checkout, where it updates as soon as the district or state changes.
- Checkout page with delivery address and **Cash on Delivery**. Prices, platform charges, delivery charges and stock are calculated on the server.
- Every new or cancelled order sends a **notification** to the seller (SellerTribe bell: "keep 3 × Dokra Horse ready") and to the team (who ordered what from which seller).
- **My Orders** page and an order details page with the progress (placed → confirmed → shipped → delivered). Buyers can cancel an order until the seller confirms it.

**Buyer accounts**

- Register and log in with email and password
- Passwords hashed with **bcrypt**
- Login token (**JWT**) stored in an **HTTP-only cookie**, with **CSRF protection**

**Other**

- "Become a Seller" / "Sell with us" links that open the SellerTribe website
- About page and Contact page (messages are saved in MongoDB)
- 404 page
- Responsive design from 320 px phones to large desktop screens
- Styled placeholders wherever an image is missing, so broken images never appear

---

## 3. Technologies used

| Part | Technology |
| --- | --- |
| Frontend | React 19, React Router 7, Vite, plain CSS (Flexbox, Grid, media queries) |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Authentication | JWT (jsonwebtoken), bcrypt (`bcryptjs`, a pure JavaScript version of bcrypt that installs easily on Windows) |
| Security helpers | helmet, cors, cookie-parser, express-rate-limit |
| Development | nodemon (restarts the backend automatically) |
| Images | Product photos are uploaded to Cloudinary by the **SellerTribe** website; this site only displays the saved URLs |

No TypeScript, no CSS frameworks and no Next.js are used.

---

## 4. Folder structure

```text
TribalMarketplace/
├── README.md
├── .gitignore
│
├── backend/                         Express REST API (MVC)
│   ├── server.js                    Starts the app: security, CORS, routes, MongoDB connection
│   ├── package.json                 Backend dependencies and scripts
│   ├── nodemon.json                 Restart on code or .env changes during development
│   ├── .env.example                 Template for your secrets  ->  copy to .env
│   ├── config/
│   │   ├── db.js                    Connects to MongoDB (clear error messages, retries)
│   │   ├── platformFee.js           THE PLATFORM CHARGE RULES (percent + minimum, from .env)
│   │   ├── deliveryCharge.js        THE DELIVERY CHARGE RULES (free zone, per km, min, max, from .env)
│   │   └── places.js                Map positions of districts / states, distance between seller and buyer
│   ├── models/                      M - MongoDB schemas
│   │   ├── User.js                  Buyer accounts (password hashing, liked products)
│   │   ├── Seller.js                Public seller details (name, village, district, state)
│   │   ├── Product.js               Products (same schema as SellerTribe)
│   │   ├── Category.js              Categories with subcategories
│   │   ├── Order.js                 Orders (same schema as SellerTribe)
│   │   ├── Notification.js          Order notifications for sellers and the team (same schema as SellerTribe)
│   │   └── Contact.js               Contact Us queries (name, email, mobile, subject, message, pending / resolved)
│   ├── controllers/                 C - request handling logic
│   │   ├── authController.js        Buyer register, login, logout, current user
│   │   ├── productController.js     List, search and view products (read-only)
│   │   ├── categoryController.js    Categories and their products
│   │   ├── orderController.js       Price quote (with delivery charge), place order, my orders, cancel
│   │   ├── likeController.js        The buyer's like list: list, like, unlike
│   │   └── contactController.js     Save Contact Us queries (checks the 10-digit mobile number)
│   ├── routes/                      URL -> controller mapping
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── likeRoutes.js
│   │   └── contactRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js        protect (login required) + loadUserIfLoggedIn
│   │   ├── csrfMiddleware.js        CSRF token for cookie-based login
│   │   ├── rateLimiters.js          Limits for login, register and contact
│   │   ├── dbMiddleware.js          Clear 503 message when MongoDB is not connected
│   │   └── errorMiddleware.js       404 + central error handler
│   ├── utils/
│   │   ├── validators.js            Input cleaning and checks
│   │   ├── authCookie.js            Creates the JWT and the cookie settings
│   │   ├── productQuery.js          Shared search / sort / pagination logic
│   │   └── orderNotifications.js    Creates the seller / team notifications for new and cancelled orders
│   └── seed/
│       ├── categories.js            THE LIST OF CATEGORIES (edit this to add more)
│       └── seedCategories.js        Saves the categories into MongoDB (npm run seed)
│
└── frontend/                        React app (V - the "view")
    ├── index.html
    ├── package.json                 Frontend dependencies and scripts
    ├── vite.config.js
    ├── .env.example                 VITE_API_URL, VITE_SELLER_SITE_URL  ->  copy to .env
    ├── public/favicon.svg           Browser tab icon (favicon-32.png and apple-touch-icon.png are PNG copies)
    ├── public/images/               Put your own logo / banner images here
    └── src/
        ├── main.jsx                 Starts React, router and the app-wide providers
        ├── App.jsx                  Layout + all routes
        ├── services/api.js          ALL calls to the backend (fetch, cookies, CSRF)
        ├── context/
        │   ├── AuthContext.jsx      Logged-in buyer (login / register / logout)
        │   ├── CartContext.jsx      Cart of the logged-in buyer (localStorage)
        │   ├── LikesContext.jsx     The buyer's liked products (saved on the server)
        │   └── ToastContext.jsx     Small pop-up messages
        ├── hooks/                   useProducts (homepage lists), useFeeRules (platform charge rules),
        │                            useSearchSuggestions (live search suggestions: waits for a pause,
        │                            cancels old requests, remembers recent answers)
        ├── data/
        │   ├── slides.js            Carousel slides (text, image URL, button, link)
        │   ├── pageHeaderPhotos.js  Photos behind page titles (Products, Categories, About, Contact, Cart, Checkout, My Orders)
        │   │                        and the homepage seller section
        │   ├── photoIcons.js        Small round photos used instead of decorative icons (with credits)
        │   └── siteConfig.js        Site name, logo URL, contact email, seller website address
        ├── utils/                   Price formatting, image URL helpers, order status labels
        ├── components/              Navbar, Footer, HeroCarousel, SearchBar + SearchSuggestions (autocomplete), ProductCard, ProductGrid,
        │                            CategoryMenu, Pagination, EmptyState, ImageWithFallback, Logo,
        │                            Icons, Loading, ProtectedRoute, ScrollToTop, SectionHeader,
        │                            CategoryThumb, ConfirmDialog, ProductGallery, LikeButton (❤️)
        ├── pages/                   Home, About, Contact, Categories, CategoryProducts,
        │                            Products (search results), ProductDetails, Cart, Checkout,
        │                            MyOrders, OrderDetails, Likes (My Likes), Login, Register,
        │                            Credits (photo credits),
        │                            NotFound
        └── styles/                  Plain CSS files (global.css holds the colour theme)
```

---

## 5. Prerequisites

1. **Node.js 22 LTS or newer** (minimum 20.19) from <https://nodejs.org>. Check in PowerShell:
   ```powershell
   node --version
   npm --version
   ```
2. **A MongoDB database**: a free MongoDB Atlas account (recommended) or MongoDB Community Server installed locally.
3. The **SellerTribe** project (in the same `TribePro` folder) so sellers can upload products.

---

## 6. Installation

Open **PowerShell**:

```powershell
cd C:\Users\balli\Desktop\TribePro\TribalMarketplace\backend
npm install
Copy-Item .env.example .env
notepad .env        # paste your values (section 8)

cd ..\frontend
npm install
Copy-Item .env.example .env
```

Then set up SellerTribe the same way (see `SellerTribe/README.md`).

---

## 7. MongoDB setup

### Option A - MongoDB Atlas (cloud, free)

1. Sign in at <https://cloud.mongodb.com> and create a **free cluster**.
2. **Database Access** → *Add New Database User* → choose a username and password (avoid `@`, `:` and `/` in the password, or URL-encode them).
3. **Network Access** → *Add IP Address* → *Add Current IP Address*.
4. **Database** → *Connect* → *Drivers* → copy the connection string and add a database name after `.net/`:
   ```text
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/tribal_marketplace?retryWrites=true&w=majority
   ```

### Option B - Local MongoDB

```text
mongodb://127.0.0.1:27017/tribal_marketplace
```

Paste the string after `MONGO_URI=` in **both** `TribalMarketplace/backend/.env` and `SellerTribe/backend/.env`. Both websites must use the **same** database.

The categories are created automatically the first time this backend connects to an empty database.

---

## 8. Environment variables

### `backend/.env` (secret - never commit this file)

```env
MONGO_URI=PASTE_YOUR_MONGODB_CONNECTION_URL_HERE
PORT=5000
JWT_SECRET=PASTE_YOUR_OWN_LONG_RANDOM_SECRET_HERE
CLIENT_URL=http://localhost:5173
NODE_ENV=development
PLATFORM_FEE_PERCENT=5
PLATFORM_FEE_MIN=10
DELIVERY_FREE_ZONE_KM=50
DELIVERY_CHARGE_PER_KM=1
DELIVERY_MIN_CHARGE=30
DELIVERY_MAX_CHARGE=500
```

| Variable | What to put there |
| --- | --- |
| `MONGO_URI` | Your MongoDB connection string (the same one SellerTribe uses) |
| `PORT` | `5000` |
| `JWT_SECRET` | A long random text. Generate one in PowerShell: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `CLIENT_URL` | Address of this frontend: `http://localhost:5173` |
| `NODE_ENV` | `development` on your computer, `production` when deployed |
| `PLATFORM_FEE_PERCENT` | Platform charge in percent of each product line (default `5`) |
| `PLATFORM_FEE_MIN` | Smallest platform charge per product line in rupees (default `10`) |
| `DELIVERY_FREE_ZONE_KM` | Delivery is free within this many km of the seller (default `50`) |
| `DELIVERY_CHARGE_PER_KM` | Rupees per km beyond the free zone (default `1`) |
| `DELIVERY_MIN_CHARGE` | Smallest delivery charge outside the zone, in rupees (default `30`) |
| `DELIVERY_MAX_CHARGE` | Largest delivery charge, in rupees (default `500`) |

No Cloudinary keys are needed here; they belong in `SellerTribe/backend/.env`. The backend **will not start** while `JWT_SECRET` still contains the placeholder text.

### `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_SELLER_SITE_URL=http://localhost:5174
```

Only put **public** values here. After changing `frontend/.env`, restart `npm run dev`.

---

## 9. Running the websites

Use **4 terminals** (in VS Code: **Ctrl + `**, then **+** for each new one):

| Terminal | Folder | Command | Address |
| --- | --- | --- | --- |
| 1 | `TribalMarketplace\backend` | `npm run dev` | http://localhost:5000 |
| 2 | `TribalMarketplace\frontend` | `npm run dev` | **http://localhost:5173** (buyers) |
| 3 | `SellerTribe\backend` | `npm run dev` | http://localhost:5001 |
| 4 | `SellerTribe\frontend` | `npm run dev` | **http://localhost:5174** (sellers) |

Example for terminal 1:

```powershell
cd C:\Users\balli\Desktop\TribePro\TribalMarketplace\backend
npm run dev
```

The backend prints `✅ MongoDB connected` and `🌱 Categories ready`. Check it at <http://localhost:5000/api/health>.

| Script | What it does |
| --- | --- |
| `npm run dev` | Start with auto restart (backend) / development server (frontend) |
| `npm start` | Start the backend normally (used when deployed) |
| `npm run seed` | Backend: save the categories from `seed/categories.js` into MongoDB (safe to run many times) |
| `npm run build` | Frontend: production build into `frontend/dist` |

---

## 10. Sellers and product uploads

Sellers do everything on the **SellerTribe** website (http://localhost:5174):

1. **Register** with name, contact number, Aadhaar number and address
2. **Wait for approval** - only sellers approved by the Tribal Marketplace team (on the SellerTribe Team page, `/admin`) can upload
3. **Log in** with the contact number or the Aadhaar number (prototype: no password yet)
4. **Upload** a product with a photo and all its details (name, price, stock, category, subcategory, description, village, district - every field is required; extra photos are optional)

The product appears on this marketplace immediately (homepage, search, category pages and product details). This marketplace shows only the seller's name, village, district and state, never the contact number or Aadhaar details.

All "Become a Seller" links on this website open SellerTribe. The address comes from `VITE_SELLER_SITE_URL`.

### Sample products

39 sample products with real photos (no food items) can be added (or removed) from the SellerTribe backend:

```powershell
cd C:\Users\balli\Desktop\TribePro\SellerTribe\backend
npm run seed:demo          # add the sample products
npm run seed:demo:remove   # remove them again (photos and demo seller too)
```

They belong to a seller called "Tribal Marketplace Demo Store" and their descriptions end with "Sample listing" and the photo credit. See `SellerTribe/README.md`.

---

## 11. Buying, orders, platform and delivery charges

**Login first.** Visitors can browse everything, but **Add to Cart**, **Buy Now**, the cart, checkout and My Orders need a buyer account. Clicking one of them while logged out opens the login page; after logging in (or registering) the buyer comes back to where they were, for example straight to the checkout.

**Platform charge.** For every product line in an order:

```text
platform charge = 5% of (price × quantity), but at least ₹10
total to pay    = products + platform charges
```

| Example | Products | Platform charge | Buyer pays |
| --- | --- | --- | --- |
| 1 × ₹120 leaf plates | ₹120 | ₹10 (minimum) | ₹130 |
| 2 × ₹650 masks | ₹1,300 | ₹65 (5%) | ₹1,365 |

The seller receives the product amount; the platform charge is Tribal Marketplace's income. Change the numbers with `PLATFORM_FEE_PERCENT` and `PLATFORM_FEE_MIN` in `backend/.env` (nodemon restarts the backend automatically). The product page, cart and checkout show the charge before the buyer orders. **The server always calculates prices and charges from the database**; nothing the browser sends can change them.

**Delivery charge.** Each seller sends their own parcel, so every order (one per seller) gets a delivery charge from the distance between the seller's district and the buyer's delivery district:

```text
distance        = straight distance between the district headquarters × 1.3 (roads are not straight)
inside 50 km    = free delivery
farther away    = ₹1 × (distance - 50 km), at least ₹30 and at most ₹500
total to pay    = products + platform charges + delivery charges
```

| Seller in Ranchi → buyer in | Distance | Delivery charge |
| --- | --- | --- |
| Khunti | ≈ 40 km | Free |
| Hazaribagh | ≈ 94 km | ₹44 |
| Dhanbad | ≈ 162 km | ₹112 |
| Kolkata | ≈ 422 km | ₹372 |
| New Delhi | ≈ 1,299 km | ₹500 (maximum) |

- The map positions are in `backend/config/places.js`: all 24 Jharkhand districts, the main districts of the neighbouring states and big cities, and every state capital. A district that is not in the list counts as its state capital. Add more districts there (name, latitude, longitude, other spellings).
- At checkout the **State** is chosen from a list (so the distance can always be worked out) and the **District** field suggests the known districts. The delivery charge updates half a second after the buyer stops typing.
- The product page shows the charge for the logged-in buyer's own district (from their account); visitors see the rules. The final charge is always calculated by the server when the order is placed and is saved in the order (`deliveryCharge`, `deliveryDistanceKm`).
- Change the numbers with the `DELIVERY_...` values in `backend/.env`. The delivery charge goes to the seller to pay for sending the parcel.

**Placing an order.**

1. **Buy Now** on a product page (or **Proceed to Checkout** in the cart)
2. Enter the delivery address (name, mobile number, address, village, district, state, PIN code)
3. Payment: **Cash on Delivery** (online payment can be added later)
4. **Place Order**: the stock goes down. If the cart has products from several sellers, one order is created per seller (each with its own delivery charge).
5. The seller gets a notification on SellerTribe (bell in the navbar: who ordered how many of which product, so they can keep it ready), and the team sees who ordered what on the SellerTribe Team page.

**After ordering.**

| Status | Who changes it | Notes |
| --- | --- | --- |
| Order placed | - | The buyer can still cancel (stock goes back) |
| Confirmed by seller | Seller on SellerTribe → Orders | The buyer can no longer cancel |
| Shipped | Seller | |
| Delivered | Seller | Cash collected; the platform charge counts as earned |
| Cancelled | Buyer (before confirmation) or seller (before shipping) | Stock goes back |

Buyers follow their orders on **My Orders**. Sellers manage them on the SellerTribe **Orders** page, and the team sees all orders and the platform charges on the SellerTribe Team page (`/admin` → **Orders & earnings**).

---

## 12. Search and categories

- **Live suggestions (autocomplete):** as soon as you type in a search box, up to 8 matching products appear below it (photo, name with the typed letters highlighted, category, price). Best matches first: names that start with the text ("Bam" -> Bamboo ...), then names with a word starting with it ("Small Bamboo Tray"), names containing it, names containing all typed words in any order, and finally products whose category matches ("jewel" -> Tribal Jewellery). With only 1-2 letters, only word beginnings count, so "B" suggests Bamboo and Beaded products. Click a suggestion (or choose it with Up / Down and press Enter) to open the product; Enter with nothing chosen, or **See all results**, opens the full results page. Escape, a click outside or an empty box closes the list. The browser waits for a short pause in typing, cancels outdated requests and remembers recent answers, so the server is not asked on every key press.
- **Search:** type in the navbar search box and press Enter. Every word must appear somewhere in the product - its name, description, category, subcategory, village or district. Matching is partial and ignores upper/lower case: "dok" finds Dokra items, "jewellery" lists the whole Tribal Jewellery category, "lamp bamboo" finds "Bamboo Table Lamp". An empty search shows all products.
- **Filters and sorting:** on the results page choose a category, subcategory and sort order. The filters are kept in the URL.
- **Categories page:** click a category card to see its subcategories, then click a subcategory to see its products.
- **Categories typed by sellers:** when nothing in the lists fits, a seller can choose "Other" and type their own category / subcategory (saved as `customCategory` / `subcategoryName`). Such products show that name on the product card and page, and search and the live suggestions find them; a typed main category has no category page.
- All searching, filtering, sorting and pagination happen in MongoDB.

### Adding a new category or subcategory

1. Open `backend/seed/categories.js`.
2. Add a new category object, or add a name to a `subcategories` list.
3. Run `npm run seed` in the `backend` folder.

Both websites read categories from the database, so no React code needs to change.

---

## 13. Common errors and troubleshooting

| Problem | Solution |
| --- | --- |
| **`npm : File ... npm.ps1 cannot be loaded because running scripts is disabled`** | Run once: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then reopen PowerShell |
| **`❌ JWT_SECRET is not set`** | Paste a random secret after `JWT_SECRET=` in `backend/.env` |
| **`❌ MONGO_URI is not set`** | Paste your connection string after `MONGO_URI=` |
| **`bad auth` / Authentication failed** | Wrong database username or password in `MONGO_URI` (special characters must be URL-encoded, `@` → `%40`) |
| **Could not reach MongoDB in time** | In Atlas → *Network Access*, add your current IP address. Some college networks block MongoDB; try a mobile hotspot. |
| **Website shows "Cannot connect to the server"** | The backend is not running. Start terminal 1 and check <http://localhost:5000/api/health>. |
| **A seller's product does not appear** | `MONGO_URI` must be identical in both projects' `.env` files |
| **"Become a Seller" opens nothing** | Start SellerTribe (terminals 3 and 4), or check `VITE_SELLER_SITE_URL` |
| **"Security check failed. Please refresh the page"** | Refresh the page. Open the site at `http://localhost:5173` (not `127.0.0.1`). |
| **CORS error in the browser console** | `CLIENT_URL` must match the address in the browser bar exactly |
| **`Port 5173 is already in use`** | Another frontend is running. Close it first. |
| **`EADDRINUSE ... :5000`** | Another backend is already running. Close the other terminal. |
| **No categories on the website** | Check that the backend shows "Categories ready", or run `npm run seed` |
| **"Add to Cart" / "Buy Now" opens the login page** | This is intended: only logged-in buyers can use the cart and buy. Log in or register. |
| **"Only N of ... left in stock" at checkout** | Someone bought it first. Lower the quantity or remove the product. |

---

## 14. API reference

Base URL: `http://localhost:5000/api`. All responses are JSON: `{ "success": true, ... }` or `{ "success": false, "message": "..." }`.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/health` | Public | Server and database status |
| GET | `/csrf-token` | Public | CSRF token (the frontend does this automatically) |
| POST | `/auth/register` | Public | Create a buyer account |
| POST | `/auth/login` | Public | Log in (sets the HTTP-only cookie) |
| POST | `/auth/logout` | Public | Log out |
| GET | `/auth/me` | Public | Current buyer, or `null` |
| GET | `/products` | Public | List / search. Query: `search`, `category` (id or slug), `subcategory`, `sort` (`newest`, `price_asc`, `price_desc`, `popular`), `page`, `limit` (max 48), `ids` |
| GET | `/products/suggestions` | Public | Live search suggestions. Query: `q` (the typed text), `limit` (default 8, max 10). Returns `products: [{ _id, name, price, imageUrl, category: { name, slug }, subcategoryName, stock, matchedBy }]`, best matches first |
| GET | `/products/:id` | Public | One product |
| GET | `/categories` | Public | All categories with subcategories and product counts |
| GET | `/categories/:id` | Public | One category (id or slug) |
| GET | `/categories/:id/products` | Public | Products in a category. Query: `subcategory`, `search`, `sort`, `page`, `limit` |
| POST | `/contact` | Public (rate limited: 5 saved queries per hour; failed attempts do not count) | Save a Contact Us query `{ name, email, phone, subject, message }` - `phone` = 10-digit Indian mobile number (spaces, dashes and +91 are allowed). Saved as **pending**; the team answers it on the SellerTribe Team page -> **Customer Queries** |
| GET | `/orders/fee-rules` | Public | Platform charge rules `{ percent, minimum }` and delivery rules `delivery: { freeZoneKm, perKm, minimum, maximum }` |
| GET | `/orders/places` | Public | `{ states, districts }` for the checkout address form |
| GET | `/orders/delivery-estimate` | Public | Delivery charge from a product's seller to a place. Query: `product`, `district`, `state` -> `estimate: { distanceKm, deliveryCharge, from, to }` (or `null`) |
| POST | `/orders/quote` | Buyer | Price breakdown without ordering. Body: `{ items: [{ productId, quantity }], delivery: { district, state } }` (without `delivery`, `deliveryCharge` is `null`) |
| POST | `/orders` | Buyer | Place a Cash on Delivery order. Body: `{ items, delivery: { fullName, phone, address, village, district, state, pincode } }` (`state` must be an Indian state / union territory). Also creates the seller and team notifications |
| GET | `/orders/mine` | Buyer | The buyer's own orders (newest first) |
| GET | `/orders/:id` | Buyer | One of the buyer's own orders |
| POST | `/orders/:id/cancel` | Buyer | Cancel an own order that is still "placed" |
| GET | `/likes` | Buyer | The buyer's liked products, newest like first: `{ productIds, products }` (hidden or deleted products are left out) |
| POST | `/likes/:productId` | Buyer | Like a product (liking twice changes nothing; at most 500 likes) |
| DELETE | `/likes/:productId` | Buyer | Unlike a product |

"Buyer" means the request needs the buyer login cookie (otherwise `401`). Product upload, edit and delete, and changing an order's status, are in the SellerTribe API (see `SellerTribe/README.md`).

---

## 15. Images and placeholders

No images are included in the project. Wherever an image can be used there is a clearly marked placeholder. While a placeholder is empty, a styled CSS background is shown instead of a broken image.

| Image | Where to paste the URL |
| --- | --- |
| Logo | `frontend/src/data/siteConfig.js` → `logoUrl` (`PASTE_YOUR_LOGO_IMAGE_URL_HERE`) |
| Browser tab icon (favicon) | Replace `frontend/public/favicon.svg`, `favicon-32.png` (32 × 32) and `apple-touch-icon.png` (180 × 180, used when a phone saves the site to the home screen) |
| Carousel banners | `frontend/src/data/slides.js` → `imageUrl` of each slide. The current banners are in `frontend/public/images/banners/` |
| Page header photos (All Products, Categories, About, Contact, Cart, Checkout, My Orders) and the homepage "Sell your handmade products" section | `frontend/src/data/pageHeaderPhotos.js` → `url` and `position` for each. Files are in `frontend/public/images/banners/` |
| Small round pictures (About cards, homepage points, Contact cards, empty pages) | `frontend/src/data/photoIcons.js` → `src` of each photo. The files are 160 × 160 px squares in `frontend/public/images/photo-icons/` |
| Category images | `backend/seed/categories.js` → `image` and `imageCredit`, then run `npm run seed`. The current photos are in `frontend/public/images/categories/` |
| Product images | Uploaded by sellers on SellerTribe (stored on Cloudinary). The sample products use openly licensed photos. |

You can use a full `https://` URL, or put a file in `frontend/public/images/` and use a path such as `/images/banner-1.jpg`.

### Photo credits

The carousel banners, the category pictures and the small round pictures are Creative Commons photos from Wikimedia Commons and Flickr. All credits are listed on the **Photo Credits** page (`/credits`, linked in the footer). Banner credits also appear in the corner of each banner (details in `frontend/src/data/slides.js`); category credits are stored in `backend/seed/categories.js`.

Banners:

| Banner | Photo | Licence |
| --- | --- | --- |
| `heritage.jpg` | Sohrai wall painting, Isko village, Hazaribagh - Kingshuk Mondal | CC BY 4.0 |
| `handmade.jpg` | Dokra craft - Susannaanas | CC BY-SA 4.0 |
| `sellers.jpg` | Making lac bangles at Aadi Mahotsav - Goutam1962 | CC BY-SA 4.0 |
| `natural.jpg` | Hundru Falls, Jharkhand - Kingshuk Mondal | CC BY 4.0 |

If you replace them with your own photos, you can remove the `credit` / `imageCredit` fields.

---

## 16. Security notes

- Buyer passwords hashed with bcrypt and never returned by the API
- JWT in an HTTP-only cookie (`SameSite=Lax` locally; `SameSite=None; Secure` in production)
- CSRF protection (double-submit token) for every POST request
- CORS limited to the address in `CLIENT_URL`
- Products are read-only on this API, so buyers cannot create, change or delete them
- Cart, checkout and orders need a logged-in buyer; a buyer can only see and cancel their own orders
- Prices, platform charges, delivery charges and totals are calculated on the server from the database, never taken from the browser
- Stock is reduced in one database step per product, so two buyers cannot both buy the last item; failed or cancelled orders give the stock back
- Order status changes check the current status in the same step, so a buyer cancelling and a seller confirming at the same moment cannot both succeed
- Products of sellers whose access was removed by the team (`hidden: true`) are never listed, searched, counted or shown
- Seller contact numbers and Aadhaar details are never selected or sent by this API
- Input validation and cleaning on the server; search text is escaped
- Rate limiting for login, registration and the contact form
- Secure HTTP headers with helmet. Internal error details are not sent to users.

This is a learning project and has not had a professional security review. See `SellerTribe/README.md` for the seller-login prototype warning.

---

## 17. Deployment notes

**Backend environment variables**

```env
NODE_ENV=production
CLIENT_URL=https://your-marketplace-frontend.example
MONGO_URI=...the same Atlas connection string as SellerTribe...
JWT_SECRET=...a long random secret...
PLATFORM_FEE_PERCENT=5
PLATFORM_FEE_MIN=10
DELIVERY_FREE_ZONE_KM=50
DELIVERY_CHARGE_PER_KM=1
DELIVERY_MIN_CHARGE=30
DELIVERY_MAX_CHARGE=500
```

- Build command `npm install`, start command `npm start`. The backend must use **HTTPS** in production (the login cookie is `Secure`).

**Frontend**

- Set `VITE_API_URL=https://your-marketplace-backend.example/api` and `VITE_SELLER_SITE_URL=https://your-sellertribe-frontend.example` **before** building.
- Build command `npm run build`, publish folder `dist`. Configure your host to serve `index.html` for all paths (on Netlify, add a `_redirects` file containing `/*  /index.html  200`).
