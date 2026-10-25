// components/Logo.jsx
// Shows the logo image from siteConfig.logoUrl, or a CSS logo mark when no image is set.

import { useState } from 'react';
import siteConfig from '../data/siteConfig.js';
import { isUsableImageUrl } from '../utils/images.js';

function Logo({ size = 44 }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (isUsableImageUrl(siteConfig.logoUrl) && !imageFailed) {
    return (
      <img
        className="logo-image"
        src={siteConfig.logoUrl}
        alt=""
        width={size}
        height={size}
        onError={() => setImageFailed(true)}
      />
    );
  }

  // Fallback logo made only with CSS (see .logo-mark in navbar.css)
  return (
    <span className="logo-mark" style={{ width: size, height: size }} aria-hidden="true">
      <span className="logo-mark-letter">T</span>
    </span>
  );
}

export default Logo;
