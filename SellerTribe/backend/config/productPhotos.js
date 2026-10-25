// Besides the main photo, a product can have this many extra photos
const MAX_EXTRA_IMAGES = 5;

// Which view an extra photo shows. The seller picks one of these for every extra photo.
const EXTRA_IMAGE_LABELS = [
  'Side view',
  'Top view',
  'Back view',
  'Front view',
  'Bottom view',
  'Close-up',
  'In use',
  'Other view',
];

module.exports = { MAX_EXTRA_IMAGES, EXTRA_IMAGE_LABELS };
