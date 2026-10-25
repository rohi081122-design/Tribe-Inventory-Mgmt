// pages/EditProduct.jsx
// Loads one of the seller's own products and shows the form.
// The backend refuses to return or change products that belong to someone else.

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../components/ProductForm.jsx';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import photoIcons from '../data/photoIcons.js';
import { productAPI } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import pageHeaderPhotos, { headerPhotoStyle } from '../data/pageHeaderPhotos.js';
import '../styles/seller.css';

function EditProduct() {
  const { id } = useParams();
  const { showToast } = useToast();
  const { seller, isApproved } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    productAPI
      .getMyProduct(id)
      .then((data) => setProduct(data.product))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpdate(formData, onProgress) {
    const data = await productAPI.updateProduct(id, formData, onProgress);
    showToast(data.message || 'Product updated.');
    navigate('/');
  }

  if (loading) {
    return <Loading text="Loading product..." fullPage />;
  }

  // Only sellers approved by the team can edit (the backend checks this too)
  if (!isApproved) {
    return (
      <div className="container page-section">
        <EmptyState
          icon="⏳"
          title="Your account is not approved"
          message="Only sellers approved by the Tribal Marketplace team can edit products."
        >
          <Link to="/" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </EmptyState>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container page-section">
        <EmptyState photo={photoIcons.emptyBasket} title="Product not available" message={error}>
          <Link to="/" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </EmptyState>
      </div>
    );
  }

  const initialValues = {
    name: product.name,
    price: String(product.price),
    description: product.description || '',
    // A category the seller typed earlier is shown as "Other" with its name
    category: product.category?._id || (product.customCategory ? 'other' : ''),
    subcategory: product.customCategory ? 'other' : product.subcategory || '',
    customCategory: product.customCategory || '',
    customSubcategory: product.subcategoryName || '',
    stock: typeof product.stock === 'number' ? String(product.stock) : '',
    // Older products may have no village / district yet: start with the seller's own address
    village: product.village || seller.village || '',
    district: product.district || seller.district || '',
  };

  return (
    <div className="seller-page">
      <section className="page-header page-header-photo" style={headerPhotoStyle(pageHeaderPhotos.editProduct)}>
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Dashboard</Link> <span aria-hidden="true">/</span> <span>Edit Product</span>
          </nav>
          <h1>Edit Product</h1>
          <p>Update the details of “{product.name}”. Changes appear on the marketplace right away.</p>
        </div>
      </section>

      <div className="container page-section">
        <div className="dashboard-panel">
          <ProductForm
            initialValues={initialValues}
            existingImageUrl={product.image?.url}
            existingExtraImages={product.extraImages || []}
            imageRequired={false}
            submitLabel="Save Changes"
            onSubmit={handleUpdate}
          />
        </div>
      </div>
    </div>
  );
}

export default EditProduct;
