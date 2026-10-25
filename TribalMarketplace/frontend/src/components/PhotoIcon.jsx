// components/PhotoIcon.jsx
// A small photo that fills its (round) container, used instead of a decorative icon.
// The photos and their credits are listed in data/photoIcons.js.

function PhotoIcon({ photo, className = '' }) {
  if (!photo) return null;
  return <img src={photo.src} alt="" className={`photo-icon ${className}`} loading="lazy" width="160" height="160" />;
}

export default PhotoIcon;
