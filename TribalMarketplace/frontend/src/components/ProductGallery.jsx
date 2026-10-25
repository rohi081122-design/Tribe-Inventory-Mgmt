// components/ProductGallery.jsx
// Photo slider on the product details page.
// Shows the main photo first, then the extra photos the seller added (side view, top view ...).
// - previous / next arrows, and small thumbnails to jump to a photo
// - swipe on touch screens, arrow keys on the keyboard
// - a tag on the photo says which view it shows, e.g. "Side view"
// - with only one photo it looks like a normal product image (no arrows, no thumbnails)

import { useRef, useState } from 'react';
import ImageWithFallback from './ImageWithFallback.jsx';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons.jsx';
import '../styles/product-gallery.css';

const SWIPE_DISTANCE_PX = 50;

function ProductGallery({ product }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStart = useRef(null);

  // The main photo has no label; extra photos have one, e.g. "Side view"
  const photos = [
    { url: product.image?.url, label: '' },
    ...(product.extraImages || []).map((photo) => ({ url: photo.url, label: photo.label || '' })),
  ];
  const totalPhotos = photos.length;
  const hasManyPhotos = totalPhotos > 1;
  const currentPhoto = photos[currentIndex] || photos[0];

  function showPhoto(index) {
    // Going past the last photo starts again from the first one (and the other way round)
    setCurrentIndex((index + totalPhotos) % totalPhotos);
  }

  function handleKeyDown(event) {
    if (!hasManyPhotos) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(currentIndex + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPhoto(currentIndex - 1);
    }
  }

  /* ----- Touch swipe ----- */

  function handleTouchStart(event) {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event) {
    if (!touchStart.current) return;
    const touch = event.changedTouches[0];
    const distanceX = touch.clientX - touchStart.current.x;
    const distanceY = touch.clientY - touchStart.current.y;
    touchStart.current = null;

    // Ignore mostly-vertical movements (the user is scrolling the page)
    if (hasManyPhotos && Math.abs(distanceX) > SWIPE_DISTANCE_PX && Math.abs(distanceX) > Math.abs(distanceY)) {
      showPhoto(distanceX < 0 ? currentIndex + 1 : currentIndex - 1);
    }
  }

  // Text for screen readers and image alt texts, e.g. "Bamboo Basket - Side view"
  function describePhoto(photo, index) {
    if (photo.label) return `${product.name} - ${photo.label}`;
    return index === 0 ? product.name : `${product.name} - photo ${index + 1}`;
  }

  return (
    <section
      className={`product-gallery ${hasManyPhotos ? 'has-thumbs' : ''}`}
      aria-roledescription="carousel"
      aria-label="Product photos"
      onKeyDown={handleKeyDown}
    >
      <div className="product-gallery-stage" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="product-gallery-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {photos.map((photo, index) => (
            <div
              key={`${photo.url}-${index}`}
              className="product-gallery-slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${totalPhotos}`}
              aria-hidden={index !== currentIndex}
            >
              {/* All photos load straight away, so sliding never shows an empty frame */}
              <ImageWithFallback
                src={photo.url}
                alt={describePhoto(photo, index)}
                label="Product Image"
                width={1000}
                loading="eager"
              />
            </div>
          ))}
        </div>

        {currentPhoto.label && <span className="product-gallery-label">{currentPhoto.label}</span>}

        {hasManyPhotos && (
          <>
            <button
              type="button"
              className="product-gallery-arrow product-gallery-arrow-prev"
              onClick={() => showPhoto(currentIndex - 1)}
              aria-label="Previous photo"
            >
              <ChevronLeftIcon size={22} />
            </button>
            <button
              type="button"
              className="product-gallery-arrow product-gallery-arrow-next"
              onClick={() => showPhoto(currentIndex + 1)}
              aria-label="Next photo"
            >
              <ChevronRightIcon size={22} />
            </button>
            <span className="product-gallery-counter" aria-live="polite">
              {currentIndex + 1} / {totalPhotos}
            </span>
          </>
        )}
      </div>

      {/* Small photos to jump straight to a view */}
      {hasManyPhotos && (
        <div className="product-gallery-thumbs">
          {photos.map((photo, index) => (
            <button
              key={`${photo.url}-${index}`}
              type="button"
              className={`product-gallery-thumb ${index === currentIndex ? 'is-active' : ''}`}
              onClick={() => showPhoto(index)}
              aria-label={`Show photo ${index + 1}${photo.label ? `: ${photo.label}` : ''}`}
              aria-current={index === currentIndex ? 'true' : undefined}
              title={photo.label || 'Main photo'}
            >
              <ImageWithFallback src={photo.url} alt="" label="Photo" width={160} loading="eager" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductGallery;
