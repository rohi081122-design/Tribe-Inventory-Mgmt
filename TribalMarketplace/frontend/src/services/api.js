// services/api.js
// Every call to the backend goes through this file, so the backend address is set in ONE place.
//
// - The address comes from VITE_API_URL in frontend/.env
// - credentials: 'include' makes the browser send the HTTP-only login cookie
// - POST requests send a CSRF token in the "X-CSRF-Token" header

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const SERVER_UNREACHABLE_MESSAGE =
  'Cannot connect to the server. Please make sure the backend is running and try again.';

// Error object with the HTTP status and field errors from the backend
export class ApiError extends Error {
  constructor(message, status = 0, errors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

/* ---------- CSRF token ---------- */

let csrfToken = null;

async function getCsrfToken(forceNew = false) {
  if (!csrfToken || forceNew) {
    const data = await request('/csrf-token');
    csrfToken = data.csrfToken;
  }
  return csrfToken;
}

/* ---------- Helpers ---------- */

// { search: 'basket', page: 2, category: '' } -> "?search=basket&page=2"
function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// Main request function used by all the API helpers below
// signal (optional) lets the caller cancel the request, e.g. when the search text changes again
async function request(path, { method = 'GET', body, retry = true, signal } = {}) {
  const options = { method, credentials: 'include', headers: {}, signal };

  if (method !== 'GET') {
    options.headers['X-CSRF-Token'] = await getCsrfToken();
  }

  if (body instanceof FormData) {
    options.body = body; // the browser sets the multipart Content-Type itself
  } else if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch (error) {
    if (error.name === 'AbortError') throw error; // cancelled on purpose - not a server problem
    throw new ApiError(SERVER_UNREACHABLE_MESSAGE);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // The CSRF token may have expired: fetch a new one and try once more
    if (response.status === 403 && data.code === 'CSRF_INVALID' && retry) {
      await getCsrfToken(true);
      return request(path, { method, body, retry: false });
    }
    throw new ApiError(data.message || `Request failed (status ${response.status})`, response.status, data.errors);
  }

  return data;
}

/* ---------- API helpers used by the pages ---------- */

export const authAPI = {
  register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getCurrentUser: () => request('/auth/me'),
};

// Products are read-only here (sellers upload them on the SellerTribe website)
export const productAPI = {
  // params: { search, category, subcategory, sort, page, limit, ids }
  getProducts: (params) => request(`/products${buildQuery(params)}`),
  getProduct: (id) => request(`/products/${encodeURIComponent(id)}`),
  // Live suggestions for the search box: { products: [{ _id, name, price, imageUrl, category, ... }] }
  getSuggestions: (text, signal) => request(`/products/suggestions${buildQuery({ q: text })}`, { signal }),
};

export const categoryAPI = {
  getCategories: () => request('/categories'),
  getCategory: (idOrSlug) => request(`/categories/${encodeURIComponent(idOrSlug)}`),
  // params: { subcategory, search, sort, page, limit }
  getCategoryProducts: (idOrSlug, params) =>
    request(`/categories/${encodeURIComponent(idOrSlug)}/products${buildQuery(params)}`),
};

// Checkout and orders (all except getFeeRules need a logged-in buyer)
export const orderAPI = {
  // { percent, minimum, delivery } - how the platform charge and the delivery charge are calculated
  getFeeRules: () => request('/orders/fee-rules'),
  // { states, districts } for the delivery address form
  getPlaces: () => request('/orders/places'),
  // Delivery charge from a product's seller to a district + state (for the product page)
  getDeliveryEstimate: (productId, district, state) =>
    request(`/orders/delivery-estimate${buildQuery({ product: productId, district, state })}`),
  // items: [{ productId, quantity }], delivery: { district, state } (optional)
  // -> price breakdown from the server, including the delivery charge (no order is placed)
  getQuote: (items, delivery) => request('/orders/quote', { method: 'POST', body: { items, delivery } }),
  placeOrder: (items, delivery) => request('/orders', { method: 'POST', body: { items, delivery } }),
  getMyOrders: () => request('/orders/mine'),
  getOrder: (id) => request(`/orders/${encodeURIComponent(id)}`),
  cancelOrder: (id) => request(`/orders/${encodeURIComponent(id)}/cancel`, { method: 'POST' }),
};

// The logged-in buyer's liked products (❤️)
export const likeAPI = {
  // { productIds, products } - newest like first
  getLikes: () => request('/likes'),
  like: (productId) => request(`/likes/${encodeURIComponent(productId)}`, { method: 'POST' }),
  unlike: (productId) => request(`/likes/${encodeURIComponent(productId)}`, { method: 'DELETE' }),
};

export const contactAPI = {
  sendMessage: (messageData) => request('/contact', { method: 'POST', body: messageData }),
};
