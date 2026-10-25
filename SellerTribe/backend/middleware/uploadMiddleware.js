// middleware/uploadMiddleware.js
// Reads the product photos from a multipart/form-data request using multer.
// The files are kept in memory (not on disk) and then sent to Cloudinary by the controller.
//   "image"       -> the main photo (1 file)
//   "extraImages" -> optional extra photos: side view, top view ... (up to MAX_EXTRA_IMAGES files)

const multer = require('multer');
const { MAX_EXTRA_IMAGES } = require('../config/productPhotos');

const MAX_IMAGE_SIZE_MB = 5;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE_MB * 1024 * 1024, // per photo
    files: 1 + MAX_EXTRA_IMAGES,
    fields: 20,
    fieldSize: 20 * 1024, // 20 KB per text field is plenty
  },
  fileFilter(req, file, callback) {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      callback(null, true);
    } else {
      const error = new Error('Only JPEG, PNG and WebP images are allowed.');
      error.statusCode = 400;
      callback(error);
    }
  },
});

const readProductPhotos = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'extraImages', maxCount: MAX_EXTRA_IMAGES },
]);

// Wraps multer so that upload problems become friendly 400 responses.
// Afterwards req.files.image and req.files.extraImages are arrays of files (missing when none were sent).
function uploadProductPhotos(req, res, next) {
  readProductPhotos(req, res, (error) => {
    if (!error) {
      return next();
    }

    let message = error.message;
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        message = `Each photo must be ${MAX_IMAGE_SIZE_MB} MB or smaller.`;
      } else if (error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE') {
        message = `You can add one main photo and at most ${MAX_EXTRA_IMAGES} extra photos.`;
      } else {
        message = `Image upload problem: ${error.message}`;
      }
    }

    return res.status(400).json({ success: false, message });
  });
}

// The browser-reported file type can be faked, so we also check the first bytes of the file
// ("magic numbers") to make sure it really is a JPEG, PNG or WebP image.
function isRealImage(buffer) {
  if (!buffer || buffer.length < 12) {
    return false;
  }

  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isWebp =
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';

  return isJpeg || isPng || isWebp;
}

module.exports = { uploadProductPhotos, isRealImage, MAX_IMAGE_SIZE_MB };
