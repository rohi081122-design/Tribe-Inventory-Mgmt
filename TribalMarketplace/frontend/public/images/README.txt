Put your own website images (logo, banners, category pictures) in this folder.

Files in "public/images" are served from "/images/...". For example:

  frontend/public/images/logo.png        ->  "/images/logo.png"
  frontend/public/images/banner-1.jpg    ->  "/images/banner-1.jpg"

Then paste that path (or any full https:// image URL) into one of the placeholders:

  Logo ................ src/data/siteConfig.js   (PASTE_YOUR_LOGO_IMAGE_URL_HERE)
  Carousel banners .... src/data/slides.js       (PASTE_YOUR_CAROUSEL_BANNER_IMAGE_URL_HERE)
  Category images ..... backend/seed/categories.js (PASTE_YOUR_CATEGORY_IMAGE_URL_HERE),
                        then run "npm run seed" in the backend folder

Product images do NOT go here. Sellers upload them from the Add Product page and
they are stored on Cloudinary automatically.

While a placeholder is empty, the website shows a styled CSS background instead of a broken image.
Recommended banner size: 1600 x 600 pixels (or wider) in JPG or WebP format.
