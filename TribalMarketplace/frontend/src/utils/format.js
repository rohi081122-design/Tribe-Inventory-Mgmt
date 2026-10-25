// utils/format.js - small helpers for showing values nicely

const rupeeFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

// 1250 -> "₹1,250"
export function formatPrice(amount) {
  return rupeeFormatter.format(Number(amount) || 0);
}

// "2026-03-01T10:00:00Z" -> "1 Mar 2026"
export function formatDate(dateValue) {
  if (!dateValue) {
    return '';
  }
  return new Date(dateValue).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Builds "Village, District" from a product (falls back to the seller's profile)
export function getProductLocation(product) {
  if (!product) {
    return '';
  }
  const village = product.village || product.seller?.village || '';
  const district = product.district || product.seller?.district || '';
  return [village, district].filter(Boolean).join(', ');
}

// Text describing stock: null/undefined means the seller did not say
export function getStockInfo(stock) {
  if (typeof stock !== 'number') {
    return { label: 'Stock not specified', status: 'unknown' };
  }
  if (stock === 0) {
    return { label: 'Out of stock', status: 'out' };
  }
  if (stock <= 5) {
    return { label: `Only ${stock} left`, status: 'low' };
  }
  return { label: `In stock (${stock} available)`, status: 'in' };
}

// "Sunita Devi" -> "SD"
export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}
