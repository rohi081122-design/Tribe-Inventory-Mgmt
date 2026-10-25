// components/ImageWithFallback.jsx
// Shows an image, or a styled CSS placeholder when the URL is empty or the image fails to load.
// This way the website never shows a broken-image icon.

import { useState } from 'react';
import { ImageIcon } from './Icons.jsx';
import { isUsableImageUrl, optimizedImageUrl } from '../utils/images.js';

function ImageWithFallback({ src, alt, label = 'Product Image', width = 600, className = '', loading = 'lazy' }) {
  // Remember which URL failed, so a new URL (for example after editing) is tried again
  const [failedSrc, setFailedSrc] = useState(null);

  const canShowImage = isUsableImageUrl(src) && failedSrc !== src;

  if (!canShowImage) {
    return (
      <div className={`image-placeholder ${className}`} role="img" aria-label={alt || label}>
        <ImageIcon size={32} />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={optimizedImageUrl(src, width)}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => setFailedSrc(src)}
    />
  );
}

export default ImageWithFallback;
