const cloudinary = require('cloudinary').v2;

// All product images are stored inside this Cloudinary folder
const PRODUCT_IMAGE_FOLDER = 'tribal-marketplace/products';

// True only when all three credentials were pasted into backend/.env
function isCloudinaryConfigured() {
  const values = [
    process.env.CLOUDINARY_CLOUD_NAME,
    process.env.CLOUDINARY_API_KEY,
    process.env.CLOUDINARY_API_SECRET,
  ];
  return values.every((value) => value && !value.startsWith('PASTE_'));
}

// Gives the Cloudinary library our credentials (called before every upload/delete)
function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// Uploads an image kept in memory (a Buffer). The sample-product script passes its own folder.
function uploadImageBuffer(buffer, folder = PRODUCT_IMAGE_FOLDER) {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        // Shrink very large photos so pages load quickly (keeps the aspect ratio)
        transformation: [{ width: 1400, height: 1400, crop: 'limit' }],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
}

// Deletes one image by its public id. Errors are logged, not thrown,
// so a Cloudinary problem never blocks deleting/updating a product.
async function deleteImage(publicId) {
  if (!publicId || !isCloudinaryConfigured()) {
    return;
  }

  try {
    configureCloudinary();
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (error) {
    console.error(`Could not delete Cloudinary image "${publicId}":`, error.message);
  }
}

module.exports = { isCloudinaryConfigured, uploadImageBuffer, deleteImage };
