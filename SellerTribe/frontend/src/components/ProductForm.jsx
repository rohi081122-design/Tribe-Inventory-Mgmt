// components/ProductForm.jsx
// The form used by both "Upload Product" and "Edit Product".
// Every field is required: main photo, name, price, stock, category, subcategory, description,
// village and district. Only the extra photos (side view, top view ... up to 5) are optional.
// When no category or subcategory in the lists fits, the seller picks "Other (type your own)"
// and types the name. Food and drinks are not allowed on Tribal Marketplace.
// The parent page passes an onSubmit(formData, onProgress) function that calls the API.

import { useEffect, useRef, useState } from 'react';
import { categoryAPI, systemAPI } from '../services/api.js';
import ImageWithFallback from './ImageWithFallback.jsx';
import { CloseIcon, ImageIcon, PlusIcon } from './Icons.jsx';
import { MAX_EXTRA_PHOTOS, PHOTO_VIEWS } from '../data/photoViews.js';

const MAX_IMAGE_SIZE_MB = 5;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Value of the "Other (type your own)" option in the category and subcategory lists.
// The backend expects the same word (controllers/productController.js).
const OTHER = 'other';

// Returns an error message for a file that cannot be used, or '' when the file is fine
function checkImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return 'Please choose a JPEG, PNG or WebP photo';
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) return `Each photo must be ${MAX_IMAGE_SIZE_MB} MB or smaller`;
  return '';
}

// The first view ("Side view", "Top view" ...) that none of the photos uses yet
function nextFreeView(usedViews) {
  return PHOTO_VIEWS.find((view) => !usedViews.includes(view)) || 'Other view';
}

// Checks the form in the browser (the backend checks everything again)
function validateProduct(values, imageFile, imageRequired) {
  const errors = {};
  const name = values.name.trim();
  const price = Number(values.price);

  if (imageRequired && !imageFile) errors.image = 'Please choose a product photo';

  if (name.length < 2) errors.name = 'Please enter a product name (at least 2 characters)';
  else if (name.length > 120) errors.name = 'Product name must be at most 120 characters';

  if (values.price === '') errors.price = 'Please enter a price';
  else if (!Number.isFinite(price) || price <= 0) errors.price = 'Price must be a positive number';
  else if (price > 10000000) errors.price = 'Price is too high';

  const stock = Number(values.stock);
  if (String(values.stock).trim() === '') errors.stock = 'Please enter how many pieces you have';
  else if (!Number.isInteger(stock) || stock < 0 || stock > 100000) {
    errors.stock = 'Stock must be a whole number between 0 and 100000';
  }

  // Category and subcategory: chosen from the lists, or typed after choosing "Other"
  const typesSubcategory = values.category === OTHER || values.subcategory === OTHER;
  if (!values.category) errors.category = 'Please choose a category';
  else if (values.category === OTHER && values.customCategory.trim().length < 2) {
    errors.customCategory = 'Please type the category name (at least 2 characters)';
  }
  if (values.category && !typesSubcategory && !values.subcategory) errors.subcategory = 'Please choose a subcategory';
  else if (values.category && typesSubcategory && values.customSubcategory.trim().length < 2) {
    errors.customSubcategory = 'Please type the subcategory name (at least 2 characters)';
  }

  const description = values.description.trim();
  if (description.length < 10) errors.description = 'Please describe the product (at least 10 characters)';
  else if (description.length > 2000) errors.description = 'Description must be at most 2000 characters';

  if (values.village.trim().length < 2) errors.village = 'Please enter the village';
  if (values.district.trim().length < 2) errors.district = 'Please enter the district';

  return errors;
}

function ProductForm({
  initialValues,
  existingImageUrl = '',
  existingExtraImages = [],
  imageRequired = true,
  submitLabel,
  onSubmit,
}) {
  const [values, setValues] = useState(initialValues);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  // Extra photos. Saved ones have a publicId; new ones have a file and a local preview URL.
  const [extraPhotos, setExtraPhotos] = useState(() =>
    existingExtraImages.map((photo) => ({
      id: photo.publicId,
      publicId: photo.publicId,
      url: photo.url,
      label: PHOTO_VIEWS.includes(photo.label) ? photo.label : 'Other view',
      file: null,
    }))
  );
  const nextPhotoId = useRef(1);
  const extraPreviewUrls = useRef(new Set()); // local preview URLs to free when the form closes
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState('');
  const [uploadsConfigured, setUploadsConfigured] = useState(true);

  // Load categories for the dropdowns, and check whether photo uploads are set up on the server
  useEffect(() => {
    categoryAPI
      .getCategories()
      .then((data) => {
        setCategories(data.categories);
        // Editing a product whose subcategory the seller typed earlier: show it as "Other" + the name
        setValues((current) => {
          const category = data.categories.find((item) => item._id === current.category);
          if (!category || !current.subcategory || current.subcategory === OTHER) return current;
          const isListed = category.subcategories.some((sub) => sub.slug === current.subcategory);
          return isListed ? { ...current, customSubcategory: '' } : { ...current, subcategory: OTHER };
        });
      })
      .catch((error) => setCategoriesError(error.message));

    systemAPI
      .getHealth()
      .then((data) => setUploadsConfigured(data.imageUploads === 'configured'))
      .catch(() => setUploadsConfigured(true)); // unknown - let the backend answer on submit
  }, []);

  // Free the memory used by the preview image when it changes or the form closes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Free the previews of the extra photos when the form closes
  useEffect(() => {
    const urls = extraPreviewUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const selectedCategory = categories.find((category) => category._id === values.category);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => {
      // Changing the main category clears the subcategory.
      // A typed ("Other") category always gets a typed subcategory too.
      if (name === 'category') return { ...current, category: value, subcategory: value === OTHER ? OTHER : '' };
      return { ...current, [name]: value };
    });
    setErrors((current) => ({
      ...current,
      [name]: '',
      ...(name === 'category' ? { customCategory: '', subcategory: '', customSubcategory: '' } : {}),
      ...(name === 'subcategory' ? { customSubcategory: '' } : {}),
    }));
  }

  function selectImage(file) {
    if (!file) return;

    const fileError = checkImageFile(file);
    if (fileError) {
      setErrors((current) => ({ ...current, image: fileError }));
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrors((current) => ({ ...current, image: '' }));
  }

  function handleDrop(event) {
    event.preventDefault();
    selectImage(event.dataTransfer.files[0]);
  }

  /* ----- Extra photos (side view, top view ...) ----- */

  // Adds the chosen files, as long as there is room. Each one gets a view that is not used yet.
  function addExtraPhotos(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const freeSlots = MAX_EXTRA_PHOTOS - extraPhotos.length;
    const usedViews = extraPhotos.map((photo) => photo.label);
    const added = [];
    let problem = '';

    for (const file of files) {
      const fileError = checkImageFile(file);
      if (fileError) {
        problem = `${file.name}: ${fileError}`;
        continue;
      }
      if (added.length >= freeSlots) {
        problem = `You can add at most ${MAX_EXTRA_PHOTOS} extra photos.`;
        break;
      }

      const url = URL.createObjectURL(file);
      extraPreviewUrls.current.add(url);
      const label = nextFreeView(usedViews);
      usedViews.push(label);
      added.push({ id: `new-${nextPhotoId.current++}`, publicId: '', url, label, file });
    }

    setExtraPhotos((current) => [...current, ...added]);
    setErrors((current) => ({ ...current, extraImages: problem }));
  }

  function removeExtraPhoto(id) {
    const photo = extraPhotos.find((item) => item.id === id);
    if (photo?.file) {
      URL.revokeObjectURL(photo.url);
      extraPreviewUrls.current.delete(photo.url);
    }
    setExtraPhotos((current) => current.filter((item) => item.id !== id));
    setErrors((current) => ({ ...current, extraImages: '' }));
  }

  function changeExtraPhotoView(id, label) {
    setExtraPhotos((current) => current.map((item) => (item.id === id ? { ...item, label } : item)));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return; // prevents double submissions

    const formErrors = validateProduct(values, imageFile, imageRequired);
    setErrors(formErrors);
    setServerError('');
    if (Object.keys(formErrors).length > 0) {
      setServerError('Please correct the highlighted fields.');
      return;
    }

    // multipart/form-data is needed to send a file
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.append(key, String(value).trim()));
    if (imageFile) formData.append('image', imageFile);

    // Extra photos: the new files with their views, and the saved photos the seller kept.
    // Saved photos are always listed before new ones, so the backend keeps the same order.
    const newPhotos = extraPhotos.filter((photo) => photo.file);
    const keptPhotos = extraPhotos.filter((photo) => !photo.file);
    newPhotos.forEach((photo) => formData.append('extraImages', photo.file));
    formData.append('extraImageLabels', JSON.stringify(newPhotos.map((photo) => photo.label)));
    formData.append(
      'keepExtraImages',
      JSON.stringify(keptPhotos.map((photo) => ({ publicId: photo.publicId, label: photo.label })))
    );

    setSubmitting(true);
    setUploadProgress(0);
    try {
      await onSubmit(formData, setUploadProgress);
    } catch (error) {
      setServerError(error.message);
      setErrors(error.errors || {});
      setSubmitting(false);
    }
  }

  const imageToShow = previewUrl || existingImageUrl;
  const newPhotoCount = (imageFile ? 1 : 0) + extraPhotos.filter((photo) => photo.file).length;

  return (
    <form className="product-form" onSubmit={handleSubmit} noValidate>
      {!uploadsConfigured && (
        <div className="alert alert-warning">
          Photo uploads are not set up on the server yet. Add the Cloudinary credentials to{' '}
          <code>SellerTribe/backend/.env</code> and restart the backend.
        </div>
      )}
      {serverError && (
        <div className="alert alert-error" role="alert">
          {serverError}
        </div>
      )}

      <div className="product-form-grid">
        {/* ----- Left column: photo ----- */}
        <div className="product-form-image">
          <span className="form-label">
            Main Photo {imageRequired && <span className="required">*</span>}
          </span>

          <label
            className={`image-dropzone ${errors.image ? 'has-error' : ''}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            {imageToShow ? (
              <ImageWithFallback src={imageToShow} alt="Selected product" label="Product Photo" className="image-preview" />
            ) : (
              <span className="image-dropzone-empty">
                <ImageIcon size={44} />
                <strong>Tap to choose a photo</strong>
                <span>or drag and drop it here</span>
              </span>
            )}
            <input
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp"
              className="visually-hidden"
              onChange={(event) => selectImage(event.target.files[0])}
              disabled={submitting}
            />
          </label>

          <p className="form-hint">
            Buyers see this photo first. JPEG, PNG or WebP, up to {MAX_IMAGE_SIZE_MB} MB.
            {existingImageUrl && ' Choose a new photo only if you want to replace the current one.'}
          </p>
          {imageFile && <p className="form-hint">Selected: {imageFile.name}</p>}
          {errors.image && <p className="form-error">{errors.image}</p>}

          {/* Extra photos: side view, top view ... (optional) */}
          <div className="extra-photos">
            <span className="form-label">
              More Photos <span className="optional">(optional)</span>
            </span>
            <p className="form-hint extra-photos-hint">
              Add a side view, top view, back view or close-up, so buyers can see the product from every
              side. Up to {MAX_EXTRA_PHOTOS} photos.
            </p>

            <ul className="extra-photos-grid">
              {extraPhotos.map((photo, index) => (
                <li key={photo.id} className="extra-photo">
                  <div className="extra-photo-thumb">
                    <ImageWithFallback src={photo.url} alt={`Extra photo ${index + 1}`} label="Photo" width={200} />
                    <button
                      type="button"
                      className="extra-photo-remove"
                      onClick={() => removeExtraPhoto(photo.id)}
                      disabled={submitting}
                      aria-label={`Remove extra photo ${index + 1} (${photo.label})`}
                      title="Remove photo"
                    >
                      <CloseIcon size={14} />
                    </button>
                  </div>
                  <select
                    className="extra-photo-view"
                    value={photo.label}
                    onChange={(event) => changeExtraPhotoView(photo.id, event.target.value)}
                    disabled={submitting}
                    aria-label={`Which view does extra photo ${index + 1} show?`}
                  >
                    {PHOTO_VIEWS.map((view) => (
                      <option key={view} value={view}>
                        {view}
                      </option>
                    ))}
                  </select>
                </li>
              ))}

              {extraPhotos.length < MAX_EXTRA_PHOTOS && (
                <li className="extra-photo">
                  <label className="extra-photo-add">
                    <PlusIcon size={22} />
                    <span>Add photo</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="visually-hidden"
                      onChange={(event) => {
                        addExtraPhotos(event.target.files);
                        event.target.value = ''; // lets the seller choose the same file again later
                      }}
                      disabled={submitting}
                    />
                  </label>
                </li>
              )}
            </ul>
            {errors.extraImages && <p className="form-error">{errors.extraImages}</p>}
          </div>
        </div>

        {/* ----- Right column: details ----- */}
        <div className="product-form-fields">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Product Name <span className="required">*</span>
            </label>
            <input
              id="name"
              name="name"
              className={`form-control ${errors.name ? 'has-error' : ''}`}
              value={values.name}
              onChange={handleChange}
              placeholder="e.g. Handmade Bamboo Basket"
              maxLength={120}
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price" className="form-label">
                Price (₹) <span className="required">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                inputMode="decimal"
                min="1"
                step="0.01"
                className={`form-control ${errors.price ? 'has-error' : ''}`}
                value={values.price}
                onChange={handleChange}
                placeholder="e.g. 450"
              />
              {errors.price && <p className="form-error">{errors.price}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="stock" className="form-label">
                Available Stock <span className="required">*</span>
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                className={`form-control ${errors.stock ? 'has-error' : ''}`}
                value={values.stock}
                onChange={handleChange}
                placeholder="e.g. 10"
              />
              {errors.stock && <p className="form-error">{errors.stock}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                className={`form-control ${errors.category ? 'has-error' : ''}`}
                value={values.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
                <option value={OTHER}>Other (type your own)</option>
              </select>
              {/* Nothing in the list fits: the seller types the category */}
              {values.category === OTHER && (
                <>
                  <label htmlFor="customCategory" className="visually-hidden">
                    Your category name
                  </label>
                  <input
                    id="customCategory"
                    name="customCategory"
                    className={`form-control form-control-other ${errors.customCategory ? 'has-error' : ''}`}
                    value={values.customCategory}
                    onChange={handleChange}
                    placeholder="Type your category, e.g. Grass Crafts"
                    maxLength={40}
                  />
                  {errors.customCategory && <p className="form-error">{errors.customCategory}</p>}
                </>
              )}
              <p className="form-hint">
                Not in the list? Choose “Other” and type it. Food and drinks (honey, rice, dal, snacks ...) cannot be
                sold here.
              </p>
              {categoriesError && <p className="form-error">Could not load categories: {categoriesError}</p>}
              {errors.category && <p className="form-error">{errors.category}</p>}
            </div>

            <div className="form-group">
              <label htmlFor={values.category === OTHER ? 'customSubcategory' : 'subcategory'} className="form-label">
                Subcategory <span className="required">*</span>
              </label>
              {/* A typed category has no list of subcategories, so the subcategory is typed too */}
              {values.category !== OTHER && (
                <select
                  id="subcategory"
                  name="subcategory"
                  className={`form-control ${errors.subcategory ? 'has-error' : ''}`}
                  value={values.subcategory}
                  onChange={handleChange}
                  disabled={!selectedCategory}
                >
                  <option value="">{selectedCategory ? 'Select a subcategory' : 'Choose a category first'}</option>
                  {selectedCategory?.subcategories.map((sub) => (
                    <option key={sub.slug} value={sub.slug}>
                      {sub.name}
                    </option>
                  ))}
                  {selectedCategory && <option value={OTHER}>Other (type your own)</option>}
                </select>
              )}
              {(values.category === OTHER || values.subcategory === OTHER) && (
                <>
                  {values.category !== OTHER && (
                    <label htmlFor="customSubcategory" className="visually-hidden">
                      Your subcategory name
                    </label>
                  )}
                  <input
                    id="customSubcategory"
                    name="customSubcategory"
                    className={`form-control ${values.category === OTHER ? '' : 'form-control-other'} ${errors.customSubcategory ? 'has-error' : ''}`}
                    value={values.customSubcategory}
                    onChange={handleChange}
                    placeholder="Type your subcategory, e.g. Sabai Grass Mats"
                    maxLength={40}
                  />
                  {errors.customSubcategory && <p className="form-error">{errors.customSubcategory}</p>}
                </>
              )}
              {errors.subcategory && <p className="form-error">{errors.subcategory}</p>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className={`form-control ${errors.description ? 'has-error' : ''}`}
              value={values.description}
              onChange={handleChange}
              placeholder="Materials, size, how it is made..."
              maxLength={2000}
            />
            <p className="form-hint">{values.description.length} / 2000 characters</p>
            {errors.description && <p className="form-error">{errors.description}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="village" className="form-label">
                Village <span className="required">*</span>
              </label>
              <input
                id="village"
                name="village"
                className={`form-control ${errors.village ? 'has-error' : ''}`}
                value={values.village}
                onChange={handleChange}
                maxLength={60}
              />
              {errors.village && <p className="form-error">{errors.village}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="district" className="form-label">
                District <span className="required">*</span>
              </label>
              <input
                id="district"
                name="district"
                className={`form-control ${errors.district ? 'has-error' : ''}`}
                value={values.district}
                onChange={handleChange}
                maxLength={60}
              />
              {errors.district && <p className="form-error">{errors.district}</p>}
            </div>
          </div>

          {submitting && (
            <div className="upload-progress" role="status">
              <div className="upload-progress-bar">
                <span style={{ width: `${newPhotoCount > 0 ? uploadProgress : 100}%` }} />
              </div>
              <p>
                {newPhotoCount > 0 && uploadProgress < 100
                  ? `Uploading ${newPhotoCount > 1 ? `${newPhotoCount} photos` : 'photo'}... ${uploadProgress}%`
                  : 'Saving product, please wait...'}
              </p>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
            {submitting ? 'Saving...' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

export default ProductForm;
