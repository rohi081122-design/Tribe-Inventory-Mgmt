// utils/images.js - helpers for image URLs

// True when the value looks like a real image address we can try to load.
// Empty placeholders ("") or leftover "PASTE_..." text return false.
// "blob:" URLs are the local previews created for a file chosen in the upload form.
export function isUsableImageUrl(url) {
  if (typeof url !== 'string') {
    return false;
  }
  const value = url.trim();
  return ['https://', 'http://', '/', 'blob:'].some((start) => value.startsWith(start));
}

// Asks Cloudinary for a smaller, automatically compressed version of an image.
// "https://res.cloudinary.com/demo/image/upload/v1/pic.jpg"
//   -> "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_600/v1/pic.jpg"
export function optimizedImageUrl(url, width = 600) {
  if (!isUsableImageUrl(url) || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
}
