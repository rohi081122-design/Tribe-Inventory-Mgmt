// utils/share.js
// Everything needed to share a product: its full link, a short message and
// the "share" links of apps like WhatsApp, Gmail and SMS.
// These links are public web addresses, so no API key or app setup is needed.

import siteConfig from '../data/siteConfig.js';
import { formatPrice, getProductLocation } from './format.js';

// Full address of a product page, for example https://yoursite.com/products/abc123
export function getProductShareUrl(product) {
  return `${siteConfig.siteUrl}/products/${product._id}`;
}

// The message that is sent together with the link
export function getProductShareText(product) {
  const location = getProductLocation(product);
  const madeIn = location ? `, handmade in ${location}` : '';
  return `Check out "${product.name}" (${formatPrice(product.price)})${madeIn} on ${siteConfig.name}:`;
}

// The list of apps shown in the share pop-up.
//   key   -> used for the icon and the colour (see ShareDialog.jsx and share.css)
//   href  -> the link that opens the app with the message already filled in
//   newTab -> true for websites; email/SMS links open the phone's own app instead
export function getShareOptions(product) {
  const url = getProductShareUrl(product);
  const text = getProductShareText(product);
  const fullMessage = `${text}\n${url}`;
  const subject = `${product.name} - ${siteConfig.name}`;

  // encodeURIComponent turns spaces, quotes, ₹ and new lines into a URL-safe form
  const encode = encodeURIComponent;

  return [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encode(fullMessage)}`,
      newTab: true,
    },
    {
      key: 'gmail',
      label: 'Gmail',
      href: `https://mail.google.com/mail/?view=cm&fs=1&su=${encode(subject)}&body=${encode(fullMessage)}`,
      newTab: true,
    },
    {
      key: 'email',
      label: 'Email',
      href: `mailto:?subject=${encode(subject)}&body=${encode(fullMessage)}`,
      newTab: false,
    },
    {
      key: 'sms',
      label: 'Message',
      // "sms:?&body=" works on both Android and iPhone
      href: `sms:?&body=${encode(fullMessage)}`,
      newTab: false,
    },
    {
      key: 'facebook',
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encode(url)}`,
      newTab: true,
    },
    {
      key: 'telegram',
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encode(url)}&text=${encode(text)}`,
      newTab: true,
    },
  ];
}

// True when the browser has its own share menu (most phones do).
// That menu lists every app on the phone: Instagram, Messenger, Bluetooth and so on.
export function canUseNativeShare() {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

// Copy text to the clipboard. Returns true when it worked.
// fallbackInput = an <input> that already shows the text; it is used by the old copy
// method when the modern one is not allowed (for example on http:// addresses).
export async function copyToClipboard(text, fallbackInput) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Not allowed - try the old method below
    }
  }

  if (!fallbackInput) return false;
  fallbackInput.focus();
  fallbackInput.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  }
}
