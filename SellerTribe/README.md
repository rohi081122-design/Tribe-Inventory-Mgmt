# SellerTribe - Seller Website of Tribal Marketplace

SellerTribe is the **seller website** for [Tribal Marketplace](../TribalMarketplace). Artisans and local sellers:

1. **Register** with their name, contact number, Aadhaar number and address (village / town, district, state)
2. **Wait for approval** - only sellers **approved by the Tribal Marketplace team** can upload. The team approves sellers on the **Team page** (`/admin`).
3. **Log in** with their contact number **or** Aadhaar number
4. **Upload a product** with a photo and all its details - name, price, available stock, category, subcategory, description, village and district are **all required**. If no category or subcategory in the lists fits, the seller chooses **"Other (type your own)"** and types the name (see below). Food and drinks cannot be sold. If they like, they can add up to 5 more photos - side view, top view, back view, close-up ... - which buyers can slide through on the marketplace
5. **Handle orders** - buyers order on the marketplace (Cash on Delivery); the seller gets a **notification** (bell in the navbar) saying who ordered how many of which product, sees a **"Keep ready for delivery"** list, and confirms, ships and marks each order as delivered on the **Orders** page

The product is saved in the **same MongoDB database** that the marketplace reads, so it appears on the Tribal Marketplace website **immediately**. Approved sellers can also edit and delete their own products. If the team removes a seller's access, that seller can no longer upload and **all their products are hidden** from the marketplace (approving them again shows the products again).

> ⚠️ **Prototype login.** For now a seller logs in with only their number - there is **no password and no OTP**. Anyone who knows a seller's number could log in as them. This is fine for testing with dummy numbers, but add a password or an SMS OTP before real sellers use the site (see `backend/controllers/authController.js`).

---

## How the two websites work together

```text
   Seller's browser                              Buyer's browser
 ┌──────────────────────┐                     ┌──────────────────────────┐
 │ SellerTribe frontend │                     │ TribalMarketplace frontend│
 │ localhost:5174       │                     │ localhost:5173            │
 └──────────┬───────────┘                     └────────────┬─────────────┘
            │ register / upload / orders                   │ browse / cart / buy
 ┌──────────▼───────────┐                     ┌────────────▼─────────────┐
 │ SellerTribe backend  │                     │ TribalMarketplace backend│
 │ localhost:5001       │                     │ localhost:5000           │
 └───┬──────────────┬───┘                     └────────────┬─────────────┘
     │              │ products, sellers, order status      │ reads products, creates orders
     │        ┌─────▼──────────────────────────────────────▼─────┐
     │        │        MongoDB (one shared database)             │
     │        │  sellers · products · orders · categories · ...  │
     │        └──────────────────────────────────────────────────┘
     │ uploads photos
 ┌───▼──────────┐
 │  Cloudinary  │  (image URLs are saved with each product)
 └──────────────┘
```

- **Only SellerTribe writes products.** The marketplace backend is read-only for products and does not need Cloudinary keys.
- The marketplace shows only a seller's **name, village, district and state**. The contact number and Aadhaar details are never sent to the marketplace website.
- **Orders are created by the marketplace** (when a logged-in buyer checks out) and **managed here** (sellers change the status; the team sees earnings). The `Order` schema exists in both backends and must stay the same.
- Categories are created by the marketplace backend (from `TribalMarketplace/backend/seed/categories.js`). SellerTribe reads them for the category dropdowns.

---

## Folder structure

```text
SellerTribe/
├── README.md
├── .gitignore
│
├── backend/                         Express REST API (MVC)
│   ├── server.js                    Starts the app: security, CORS, routes, MongoDB connection
│   ├── package.json
│   ├── nodemon.json                 Restart on code or .env changes
│   ├── .env.example                 Template for your secrets  ->  copy to .env
│   ├── config/
│   │   ├── db.js                    Connects to MongoDB
│   │   ├── cloudinary.js            Uploads / deletes product photos
│   │   └── productPhotos.js         Extra photo rules: at most 5, allowed views (Side view, Top view ...)
│   ├── models/
│   │   ├── Seller.js                Seller accounts (Aadhaar stored only as a protected hash)
│   │   ├── Product.js               Products (same schema as the marketplace)
│   │   ├── Order.js                 Orders (same schema as the marketplace)
│   │   ├── Notification.js          Bell notifications for sellers and the team (same schema as the marketplace)
│   │   ├── Contact.js               Customer queries from the marketplace Contact Us page (same schema as the marketplace)
│   │   ├── Buyer.js                 READ-ONLY view of marketplace buyer accounts (name + email for the team page)
│   │   └── Category.js              Categories (read-only here)
│   ├── controllers/
│   │   ├── authController.js        Register, login (number only), logout, current seller
│   │   ├── productController.js     My products, upload, edit, delete (ownership checked)
│   │   ├── categoryController.js    Category list for the upload form
│   │   ├── orderController.js       Seller's orders, "keep ready" list, change order status (stock back on cancel)
│   │   ├── notificationController.js The seller's bell: list, mark as read
│   │   ├── queryController.js       Team: customer queries - list, mark as resolved, move back to pending
│   │   └── adminController.js       Team login, seller list, approve / remove access, orders & earnings,
│   │                                team notifications
│   ├── routes/                      authRoutes.js, productRoutes.js, categoryRoutes.js, orderRoutes.js,
│   │                                notificationRoutes.js, adminRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js        protectSeller (login required), requireApprovedSeller
│   │   ├── adminMiddleware.js       protectAdmin - team login required
│   │   ├── csrfMiddleware.js        CSRF token for cookie-based login
│   │   ├── uploadMiddleware.js      Multer: photo type / size checks
│   │   ├── rateLimiters.js          Limits login / registration attempts
│   │   ├── dbMiddleware.js          Clear message when MongoDB is not connected
│   │   └── errorMiddleware.js       404 + central error handler
│   ├── seed/
│   │   ├── demoProducts.js         Sample products (name, price, photo URL, credit)
│   │   └── seedDemoProducts.js     npm run seed:demo / seed:demo:remove
│   └── utils/
│       ├── aadhaar.js               Aadhaar hashing (HMAC) and format checks
│       ├── authCookie.js            Seller JWT cookie ("sellerToken")
│       ├── adminAuth.js             Team password check and team cookie ("sellerTribeAdmin")
│       ├── productQuery.js          Search / sort / pagination
│       ├── validators.js            Input cleaning and checks
│       └── httpError.js             Errors with a status code
│
└── frontend/                        React (Vite) app
    ├── index.html
    ├── package.json
    ├── vite.config.js               Runs on port 5174
    ├── .env.example                 VITE_API_URL, VITE_MARKETPLACE_URL  ->  copy to .env
    ├── public/favicon.svg           Browser tab icon ("S" logo); favicon-32.png and apple-touch-icon.png are PNG copies
    └── src/
        ├── main.jsx, App.jsx        Start-up and routes
        ├── services/api.js          All calls to the backend (cookies, CSRF, upload progress)
        ├── context/                 AuthContext (logged-in seller), ToastContext (pop-up messages)
        ├── data/siteConfig.js       Site name and marketplace address
        ├── data/pageHeaderPhotos.js Photos behind the page titles (Dashboard, Upload, Edit, Orders, Team page);
        │                            the files are in public/images/banners (same photos as the marketplace,
        │                            credited on the marketplace Photo Credits page)
        ├── data/photoIcons.js       Small photos on the dashboard cards and empty pages (credits on the
        │                            marketplace Photo Credits page, linked in the footer)
        ├── components/              Navbar, Footer, ProductForm, SellerProductTable, ConfirmDialog,
        │                            NotificationBell (new / cancelled orders), DemandPanel ("Keep ready
        │                            for delivery"), AdminOrders (team: orders & earnings),
        │                            AdminQueries (team: customer queries), ...
        ├── pages/
        │   ├── Login.jsx            Login + registration tabs
        │   ├── Dashboard.jsx        Seller details, numbers, product list
        │   ├── AddProduct.jsx       Upload a product
        │   ├── EditProduct.jsx      Edit a product
        │   ├── Orders.jsx           Orders from buyers: confirm, ship, deliver, cancel (/orders)
        │   ├── Admin.jsx            Team page: approve sellers, orders & earnings (/admin)
        │   └── NotFound.jsx
        ├── utils/                   Price formatting, image helpers, order status labels
        └── styles/                  global.css, layout.css, auth.css, seller.css, admin.css, orders.css
```

---

## Setup

Requirements: Node.js 22 LTS or newer (minimum 20.19), the same MongoDB database as the marketplace, and a Cloudinary account.

### 1. Install packages (PowerShell)

```powershell
cd C:\Users\balli\Desktop\TribePro\SellerTribe\backend
npm install

cd ..\frontend
npm install
```

### 2. `backend/.env`

```powershell
cd C:\Users\balli\Desktop\TribePro\SellerTribe\backend
Copy-Item .env.example .env
notepad .env
```

| Variable | What to put there |
| --- | --- |
| `MONGO_URI` | **The same** connection string as `TribalMarketplace/backend/.env` |
| `PORT` | `5001` |
| `JWT_SECRET` | A long random text, **different** from the marketplace's secret |
| `AADHAAR_SECRET` | Another long random text. **Never change it later**, or existing sellers cannot log in with their Aadhaar number. |
| `CLIENT_URL` | `http://localhost:5174` |
| `NODE_ENV` | `development` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | From Cloudinary → Settings → API Keys |
| `ADMIN_PASSWORD` | The **team password** for the Team page (`/admin`), where sellers are approved. At least 10 characters. Share it only with your team. |

Generate a random secret in PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. `frontend/.env`

```powershell
cd C:\Users\balli\Desktop\TribePro\SellerTribe\frontend
Copy-Item .env.example .env
```

```env
VITE_API_URL=http://localhost:5001/api
VITE_MARKETPLACE_URL=http://localhost:5173
```

---

## Running both websites (4 terminals)

In VS Code, open a terminal with **Ctrl + `** and click **+** for each new one.

| Terminal | Folder | Command | Address |
| --- | --- | --- | --- |
| 1 | `TribalMarketplace\backend` | `npm run dev` | http://localhost:5000 |
| 2 | `TribalMarketplace\frontend` | `npm run dev` | http://localhost:5173 (buyers) |
| 3 | `SellerTribe\backend` | `npm run dev` | http://localhost:5001 |
| 4 | `SellerTribe\frontend` | `npm run dev` | http://localhost:5174 (sellers) |

Start the marketplace backend at least once first: it creates the categories in the database.

**Try it:**

1. Open http://localhost:5174 → **New Seller? Register**, and fill in the form (dummy numbers are fine, for example contact `9876543210` and Aadhaar `123456789012`). The dashboard says **"waiting for approval"** and there is no upload button yet.
2. In another browser window open http://localhost:5174/admin (also linked as **Team login** in the footer) and log in with the team password (`ADMIN_PASSWORD` from `backend/.env`). Find the seller under **Waiting for approval** and click **Approve**.
3. Back on the seller dashboard, click **Check again** (or refresh). Click **Upload Product**, choose a photo, fill in every field (name, price, stock, category, subcategory, description, village, district) and save.

**"Other" category or subcategory.** Both lists end with **Other (type your own)**:

- **Category → Other:** a box appears to type the category name (e.g. "Grass Crafts"), and the subcategory is typed too (e.g. "Sabai Grass Mats"). The product is saved with `category: null` and `customCategory: "Grass Crafts"`. On the marketplace it shows "Grass Crafts › Sabai Grass Mats" and is found by search, but it has no category page of its own.
- **Subcategory → Other:** choose a category from the list and type only the subcategory (e.g. Handicrafts › "Stone Carving"). The product appears on that category's page.
- A typed name that already exists in the lists (any upper / lower case, e.g. "tribal jewellery" or "dokra art") uses the real category / subcategory, so nothing is saved twice.
- Typed names: 2 to 40 characters, with letters or numbers. Names about food or drinks (honey, snacks, pickles, spices, dal ...) are refused.
- The dashboard table marks a typed category with "(own)". The team can add a popular typed category to the main list in `TribalMarketplace/backend/seed/categories.js` (then run `npm run seed` there).
4. Open http://localhost:5173: the product appears under **Recently Added**, in search and in its category.
5. To test removing access: on the Team page open **Approved**, click **Remove access** - the seller's products disappear from the marketplace.

## Team page (approving sellers)

- Address: **http://localhost:5174/admin** (footer link "Team login").
- Log in with `ADMIN_PASSWORD`. This is a separate login from sellers - a seller account can never open the team page.
- Tabs: **Waiting for approval** (new registrations), **Approved**, **All sellers**. Each row shows the seller's name, contact number, masked Aadhaar, address, registration date and number of products.
- **Approve** - the seller can upload, edit and delete their products.
- **Remove access** - the seller cannot upload, edit or delete, and all their products are hidden from the marketplace. Approving them again makes the products visible again.
- The rule is enforced by the backend: an unapproved seller gets an error even if they try to upload without the website.
- **Orders & earnings** (button at the top of the Team page, with a number for new notifications) - shows **which buyer ordered what from which seller**:
  - **Latest order notifications** - e.g. "Rahul Kumar (rahul@example.com) ordered 2 × Dokra Horse from Sunita Store. Total ₹830 ..." for every new order, and a note when a buyer or seller cancels. **Mark all as read** clears the number.
  - a table of every order: order number and date, the buyer's marketplace account (name + email) and delivery address / mobile number, the products and quantities, the seller, and the money (total, platform charge, delivery charge with distance)
  - **Platform charges earned** - from **delivered** orders (the cash has been collected)
  - **Platform charges expected** - from all orders that are not cancelled
  - number of active / total orders, the product sales value and the delivery charges
- **Customer Queries** (button at the top of the Team page, with the number of pending queries) - every question sent from the marketplace **Contact Us** page, newest first:
  - each query shows the customer's name, **mobile number** (tap to call - it opens the phone dialer with a `tel:` link), **email** (tap to write - a `mailto:` link with the subject already filled in), the subject, the message, the date and time it was sent, and its status (**Pending** / **Resolved**)
  - **View full query** opens all the details with the complete message and **Call** / **Send email** buttons
  - after helping the customer, click **Mark as Resolved**: the status is saved in MongoDB, the query leaves the Pending list at once (no page reload) and a confirmation message appears
  - resolved queries are **never deleted** - see them in the **Resolved** or **All queries** tab (with the date they were resolved). **Move back to Pending** undoes a resolve made by mistake.
  - older messages sent before the mobile number field existed show "No mobile number" (reply by email)

---

## Orders (for sellers)

When a logged-in buyer orders a product on the marketplace:

- the **bell** in the navbar shows a red number, and the seller sees a pop-up message within 30 seconds (the website checks every 30 seconds while it is open). Clicking the bell lists the notifications, e.g. *"Rahul Kumar ordered 2 × Dokra Horse. Please keep them ready for delivery to Khunti, Jharkhand."* Clicking one opens the Orders page and marks it as read.
- the **Keep ready for delivery** box (on the Dashboard and the Orders page) adds up all new and confirmed orders per product: how many pieces to prepare, from how many orders, and how many are still in stock. Shipped, delivered and cancelled orders are not counted.
- the order appears on **http://localhost:5174/orders** (navbar → **Orders**). Each order card shows the products, the delivery address and mobile number, and the money:

| Line | Meaning |
| --- | --- |
| Collect from buyer (cash) | Total the buyer pays on delivery = products + platform charge + delivery charge |
| Your earning (products) | The product amount (price × quantity) |
| Delivery charge | Paid by buyers who live outside the free delivery zone (50 km around the seller); it covers the cost of sending the parcel. Shows the approximate distance. |
| Platform charge (Tribal Marketplace) | 5% per product line, minimum ₹10 - Tribal Marketplace's income |

Buttons move the order along: **Confirm order** → **Mark as shipped** → **Mark as delivered**. **Cancel order** is possible before shipping and puts the stock back. Buyers can cancel by themselves only until the seller confirms. Use the filter chips (New, Confirmed, Shipped, Delivered, Cancelled) to find orders.

Sellers whose access was removed can still see their orders but cannot change them. The platform charge and the delivery charge are set in `TribalMarketplace/backend/.env` (`PLATFORM_FEE_PERCENT`, `PLATFORM_FEE_MIN`, `DELIVERY_FREE_ZONE_KM`, `DELIVERY_CHARGE_PER_KM`, `DELIVERY_MIN_CHARGE`, `DELIVERY_MAX_CHARGE`). The distance is worked out from the seller's district and the buyer's delivery district, so sellers should register with their real district.

---

## Sample products (real photos)

To fill the marketplace with example products, run in `SellerTribe\backend`:

```powershell
npm run seed:demo          # adds 39 sample products with real photos (no food items)
npm run seed:demo:remove   # removes them again (products, their photos and the demo seller)
```

- The products belong to a demo seller, **"Tribal Marketplace Demo Store"**, which the script creates as an **approved** seller. You can log in as this seller on SellerTribe with contact number **9000000001** to edit or delete them.
- The photos are openly licensed (Creative Commons / public domain) photos from Wikimedia Commons and Flickr. The script downloads them and uploads them to the `tribal-marketplace/demo` folder in your Cloudinary.
- Each product description ends with "Sample listing" and the photographer credit, as the licences require.
- The list lives in `backend/seed/demoProducts.js`. If you delete an item from the file and run `npm run seed:demo` again, that sample product is removed. Running the command twice never creates duplicates.

---

## API reference (`http://localhost:5001/api`)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/health` | Public | Database and photo-upload status |
| GET | `/csrf-token` | Public | CSRF token (the frontend gets it automatically) |
| POST | `/auth/register` | Public | `{ name, phone, aadhaar, village, district, state }` |
| POST | `/auth/login` | Public | `{ identifier }` = 10-digit contact number or 12-digit Aadhaar number |
| POST | `/auth/logout` | Public | Log out |
| GET | `/auth/me` | Public | Current seller, or `null` |
| GET | `/products/mine` | Seller | Own products + stats. Query: `search`, `sort`, `page`, `limit` |
| GET | `/products/:id` | Seller (owner) | One own product (for editing) |
| POST | `/products` | **Approved** seller | Upload (multipart form with an `image` file, plus optional `extraImages` files and `extraImageLabels` = JSON list of views like `["Side view"]`). `category` / `subcategory` may be `other`; then send `customCategory` / `customSubcategory` with the typed names |
| PUT | `/products/:id` | **Approved** seller (owner) | Edit (photos optional; `keepExtraImages` = JSON list of saved extra photos to keep, `[{ publicId, label }]`) |
| DELETE | `/products/:id` | **Approved** seller (owner) | Delete (also removes the Cloudinary photos) |
| GET | `/categories` | Public | Categories for the dropdowns |
| POST | `/admin/login` | Public (rate limited) | `{ password }` = `ADMIN_PASSWORD` |
| POST | `/admin/logout` | Public | Team logout |
| GET | `/admin/me` | Public | `{ isAdmin, isConfigured }` |
| GET | `/admin/sellers` | Team | Sellers + product counts. Query: `status` = `pending`, `approved` or `all` |
| PATCH | `/admin/sellers/:id/approval` | Team | `{ approved: true }` to approve, `{ approved: false }` to remove access (hides their products) |
| GET | `/admin/orders` | Team | All orders (newest 200, with the buyer's name + email) + `summary`: `totalOrders`, `activeOrders`, `deliveredOrders`, `salesValue`, `platformFeeExpected`, `platformFeeEarned`, `deliveryCharges` |
| GET | `/admin/notifications` | Team | Latest 30 team notifications + `unreadCount` |
| PATCH | `/admin/notifications/read-all` | Team | Mark all team notifications as read |
| GET | `/admin/queries` | Team | Customer queries from the Contact Us page, newest first, + `counts: { pending, resolved, all }`. Query: `status` = `pending` (default), `resolved` or `all`; `limit` (max 300) |
| PATCH | `/admin/queries/:id/resolve` | Team | Mark a query as resolved (saves `resolvedAt`; the query is kept) |
| PATCH | `/admin/queries/:id/reopen` | Team | Move a resolved query back to pending |
| GET | `/orders` | Seller | Own orders + `statusCounts`. Query: `status` = `placed`, `confirmed`, `shipped`, `delivered` or `cancelled` |
| GET | `/orders/demand` | Seller | "Keep ready" list: per product, pieces ordered in new + confirmed orders, number of orders, stock left |
| GET | `/notifications` | Seller | Own latest 20 notifications + `unreadCount` |
| PATCH | `/notifications/read-all` | Seller | Mark all own notifications as read |
| PATCH | `/notifications/:id/read` | Seller (owner) | Mark one notification as read |
| PATCH | `/orders/:id/status` | **Approved** seller (owner) | `{ status }`: placed → confirmed / cancelled, confirmed → shipped / cancelled, shipped → delivered |

Unapproved sellers get `403` with `code: "SELLER_NOT_APPROVED"` when they try to upload, edit or delete, or change an order. Orders and their notifications are **created** by the marketplace API (`POST /api/orders` on port 5000), not here.

---

## Privacy and security notes

- The **Aadhaar number is never stored as plain text**. The database keeps only an HMAC hash (a one-way fingerprint made with `AADHAAR_SECRET`) and the last 4 digits for display (`XXXX XXXX 1234`).
- The contact number and Aadhaar details are never shown on the marketplace.
- The seller login cookie is HTTP-only and called `sellerToken`, so it never clashes with the buyer login cookie of the marketplace (browsers share cookies between `localhost` ports).
- Only sellers approved by the team can add, edit or delete products (checked by the backend on every request).
- The team page uses a separate password (`ADMIN_PASSWORD`) and a separate HTTP-only cookie; it is compared in constant time and login attempts are rate limited. Use a strong password and share it only with your team.
- CSRF protection, CORS limited to `CLIENT_URL`, rate limiting on login and registration, photo type / size / content checks, and an ownership check on every product change.
- A seller sees and changes **only their own orders**. Status changes follow fixed steps and are checked against the current status in one database step, so a buyer's cancel and a seller's confirm cannot both succeed. The buyer's mobile number and address are shown only to the seller of that order and to the team.
- Collecting Aadhaar numbers from real people carries legal responsibilities in India (the Aadhaar Act and data-protection rules). For a real launch, get proper advice, and consider verifying sellers another way.
- **Before real use:** add a password or an OTP to the login.

## Common problems

| Problem | Solution |
| --- | --- |
| `❌ JWT_SECRET or AADHAAR_SECRET is not set` | Paste random secrets into `SellerTribe/backend/.env` |
| "Cannot connect to the server" | Start the SellerTribe backend (terminal 3) |
| Uploaded product does not appear on the marketplace | Both `.env` files must use **the same** `MONGO_URI` |
| Category dropdown is empty | Start the marketplace backend once (it creates the categories) |
| "No seller account was found with this number" | Register first, or check for a typing mistake |
| "Photo uploads are not set up yet" | Fill in the three Cloudinary values in `SellerTribe/backend/.env` |
| Seller sees "waiting for approval" / no Upload button | Approve the seller on the Team page (`/admin`), then click **Check again** on the dashboard |
| "Team login is not set up" | Add `ADMIN_PASSWORD` (at least 10 characters) to `SellerTribe/backend/.env` and restart the backend |
| "Wrong team password" | Use the exact `ADMIN_PASSWORD` value from `SellerTribe/backend/.env` |
| `Port 5174 is already in use` | Another SellerTribe frontend is running. Close it first. |
| No **Orders** page / orders do not appear | Check that both backends use the same `MONGO_URI`. Orders appear after a buyer places one on the marketplace. |
| "This order was just changed" | The buyer cancelled (or the page was old). Reload the Orders page. |
