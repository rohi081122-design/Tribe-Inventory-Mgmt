// data/photoViews.js
// Optional extra product photos (side view, top view ...).
// The backend has the same rules in SellerTribe/backend/config/productPhotos.js - keep them the same.

// Besides the main photo, a product can have this many extra photos
export const MAX_EXTRA_PHOTOS = 5;

// Which view an extra photo shows. A new photo gets the first view that is not used yet.
export const PHOTO_VIEWS = [
  'Side view',
  'Top view',
  'Back view',
  'Front view',
  'Bottom view',
  'Close-up',
  'In use',
  'Other view',
];
