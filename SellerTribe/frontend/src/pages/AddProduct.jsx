// pages/AddProduct.jsx - upload a new product

import { Link, useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { productAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import pageHeaderPhotos, { headerPhotoStyle } from '../data/pageHeaderPhotos.js';
import '../styles/seller.css';

function AddProduct() {
  const { seller, isApproved } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Only sellers approved by the team can upload (the backend checks this too)
  if (!isApproved) {
    return (
      <div className="container page-section">
        <EmptyState
          icon="⏳"
          title="Your account is waiting for approval"
          message="Only sellers approved by the Tribal Marketplace team can upload products. You will be able to upload as soon as your account is approved."
        >
          <Link to="/" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </EmptyState>
      </div>
    );
  }

  // Village and district start with the seller's own address (they can be changed)
  const initialValues = {
    name: '',
    price: '',
    description: '',
    category: '',
    subcategory: '',
    customCategory: '', // typed after choosing "Other"
    customSubcategory: '',
    stock: '',
    village: seller.village || '',
    district: seller.district || '',
  };

  async function handleCreate(formData, onProgress) {
    const data = await productAPI.createProduct(formData, onProgress);
    showToast(data.message || 'Product uploaded.');
    navigate('/');
  }

  return (
    <div className="seller-page">
      <section className="page-header page-header-photo" style={headerPhotoStyle(pageHeaderPhotos.addProduct)}>
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Dashboard</Link> <span aria-hidden="true">/</span> <span>Upload Product</span>
          </nav>
          <h1>Upload a Product</h1>
          <p>
            Fill in all the details and choose a photo. You can also add more photos (side view, top view ...).
            The product appears on the marketplace as soon as you save it. Food and drinks cannot be sold here.
          </p>
        </div>
      </section>

      <div className="container page-section">
        <div className="dashboard-panel">
          <ProductForm initialValues={initialValues} imageRequired submitLabel="Upload Product" onSubmit={handleCreate} />
        </div>
      </div>
    </div>
  );
}

export default AddProduct;
