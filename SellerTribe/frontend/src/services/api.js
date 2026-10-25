// services/api.js
// Every call to the SellerTribe backend goes through this file.
//
// - The address comes from VITE_API_URL in frontend/.env
// - credentials: 'include' makes the browser send the HTTP-only seller login cookie
// - POST / PUT / DELETE requests send a CSRF token in the "X-CSRF-Token" header

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/$/, '');

const SERVER_UNREACHABLE_MESSAGE =
  'Cannot connect to the server. Please make sure the SellerTribe backend is running and try again.';

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

// { search: 'basket', page: 2, sort: '' } -> "?search=basket&page=2"
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
async function request(path, { method = 'GET', body, retry = true } = {}) {
  const options = { method, credentials: 'include', headers: {} };

  if (method !== 'GET') {
    options.headers['X-CSRF-Token'] = await getCsrfToken();
  }

  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
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

// Sends a form with a photo using XMLHttpRequest, because (unlike fetch)
// it can report upload progress. onProgress receives a number from 0 to 100.
async function sendFormWithProgress(path, method, formData, onProgress, retry = true) {
  const token = await getCsrfToken();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, `${API_URL}${path}`);
    xhr.withCredentials = true;
    xhr.setRequestHeader('X-CSRF-Token', token);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = {};
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else if (xhr.status === 403 && data.code === 'CSRF_INVALID' && retry) {
        getCsrfToken(true)
          .then(() => sendFormWithProgress(path, method, formData, onProgress, false))
          .then(resolve, reject);
      } else {
        reject(new ApiError(data.message || `Request failed (status ${xhr.status})`, xhr.status, data.errors));
      }
    };

    xhr.onerror = () => reject(new ApiError(SERVER_UNREACHABLE_MESSAGE));
    xhr.send(formData);
  });
}

/* ---------- API helpers used by the pages ---------- */

export const authAPI = {
  // { name, phone, aadhaar, village, district, state }
  register: (sellerData) => request('/auth/register', { method: 'POST', body: sellerData }),
  // identifier = contact number OR Aadhaar number
  login: (identifier) => request('/auth/login', { method: 'POST', body: { identifier } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getCurrentSeller: () => request('/auth/me'),
};

export const productAPI = {
  // params: { search, sort, page, limit }
  getMyProducts: (params) => request(`/products/mine${buildQuery(params)}`),
  getMyProduct: (id) => request(`/products/${encodeURIComponent(id)}`),
  createProduct: (formData, onProgress) => sendFormWithProgress('/products', 'POST', formData, onProgress),
  updateProduct: (id, formData, onProgress) =>
    sendFormWithProgress(`/products/${encodeURIComponent(id)}`, 'PUT', formData, onProgress),
  deleteProduct: (id) => request(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

export const categoryAPI = {
  getCategories: () => request('/categories'),
};

// Orders that buyers placed for this seller's products
export const orderAPI = {
  // status: '' (all) | 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  getMyOrders: (status) => request(`/orders${buildQuery({ status })}`),
  // How many pieces of each product to keep ready (orders not shipped yet)
  getDemand: () => request('/orders/demand'),
  updateStatus: (orderId, status) =>
    request(`/orders/${encodeURIComponent(orderId)}/status`, { method: 'PATCH', body: { status } }),
};

// The bell in the navbar: new and cancelled orders
export const notificationAPI = {
  getMine: () => request('/notifications'),
  markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),
  markRead: (id) => request(`/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' }),
};

// For the Tribal Marketplace team (the /admin page)
export const adminAPI = {
  getOrders: () => request('/admin/orders'),
  getNotifications: () => request('/admin/notifications'),
  markNotificationsRead: () => request('/admin/notifications/read-all', { method: 'PATCH' }),
  // Customer queries from the marketplace Contact Us page. status: 'pending' | 'resolved' | 'all'
  getQueries: (status, limit) => request(`/admin/queries${buildQuery({ status, limit })}`),
  resolveQuery: (id) => request(`/admin/queries/${encodeURIComponent(id)}/resolve`, { method: 'PATCH' }),
  reopenQuery: (id) => request(`/admin/queries/${encodeURIComponent(id)}/reopen`, { method: 'PATCH' }),
  login: (password) => request('/admin/login', { method: 'POST', body: { password } }),
  logout: () => request('/admin/logout', { method: 'POST' }),
  getStatus: () => request('/admin/me'),
  // status: 'pending' | 'approved' | 'all'
  getSellers: (status) => request(`/admin/sellers${buildQuery({ status })}`),
  setApproval: (sellerId, approved) =>
    request(`/admin/sellers/${encodeURIComponent(sellerId)}/approval`, { method: 'PATCH', body: { approved } }),
};

export const systemAPI = {
  // Tells us whether MongoDB and Cloudinary are configured on the server
  getHealth: () => request('/health'),
};
