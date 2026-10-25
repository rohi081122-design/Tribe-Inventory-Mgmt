// components/CategoryThumb.jsx
// Small round picture of a category: its photo, or a general handicrafts photo when there is
// no photo (or the photo fails to load).

import { useState } from 'react';
import PhotoIcon from './PhotoIcon.jsx';
import photoIcons from '../data/photoIcons.js';
import { isUsableImageUrl } from '../utils/images.js';

function CategoryThumb({ category, size = 60, className = '' }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = category && isUsableImageUrl(category.image) && !imageFailed;

  return (
    <span className={`category-thumb ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      {showImage ? (
        <img src={category.image} alt="" loading="lazy" onError={() => setImageFailed(true)} />
      ) : (
        <PhotoIcon photo={photoIcons.handicrafts} />
      )}
    </span>
  );
}

export default CategoryThumb;
