// components/SellerProductTable.jsx
// Table of the seller's own products with View, Edit and Delete buttons.
// On small screens each row is displayed as a card (see seller.css).

import { Link } from 'react-router-dom';
import ImageWithFallback from './ImageWithFallback.jsx';
import { EditIcon, StoreIcon, TrashIcon } from './Icons.jsx';
import { formatDate, formatPrice, getStockInfo } from '../utils/format.js';
import siteConfig from '../data/siteConfig.js';

// canManage = false hides the Edit / Delete buttons (seller not approved by the team)
function SellerProductTable({ products, onDeleteClick, canManage = true }) {
  return (
    <div className="seller-table-wrapper">
      <table className="seller-table">
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Category</th>
            <th scope="col">Price</th>
            <th scope="col">Stock</th>
            <th scope="col">Views</th>
            <th scope="col">Uploaded</th>
            <th scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const stock = getStockInfo(product.stock);
            const marketplaceLink = `${siteConfig.marketplaceUrl}/products/${product._id}`;
            return (
              <tr key={product._id}>
                <td data-label="Product">
                  <div className="seller-table-product">
                    <ImageWithFallback src={product.image?.url} alt="" label="Photo" width={120} className="seller-table-thumb" />
                    <span className="seller-table-name">{product.name}</span>
                  </div>
                </td>
                <td data-label="Category">
                  {product.category || product.customCategory ? (
                    <span>
                      {/* A category the seller typed ("Other") is shown with "(own)" after it */}
                      {product.category ? product.category.name : `${product.customCategory} (own)`}
                      {product.subcategoryName && <small className="seller-table-sub">{product.subcategoryName}</small>}
                    </span>
                  ) : (
                    <span className="text-muted">Not set</span>
                  )}
                </td>
                <td data-label="Price" className="seller-table-price">
                  {formatPrice(product.price)}
                </td>
                <td data-label="Stock">
                  <span className={`stock-pill stock-${stock.status}`}>
                    {typeof product.stock === 'number' ? product.stock : 'Not set'}
                  </span>
                </td>
                <td data-label="Views">{product.views || 0}</td>
                <td data-label="Uploaded">{formatDate(product.createdAt)}</td>
                <td className="seller-table-actions">
                  {/* Opens the product on the buyer marketplace */}
                  <a href={marketplaceLink} className="btn btn-ghost btn-sm" title="See how buyers see it">
                    <StoreIcon size={16} /> View
                  </a>
                  {canManage && (
                    <>
                      <Link to={`/products/${product._id}/edit`} className="btn btn-outline btn-sm">
                        <EditIcon size={16} /> Edit
                      </Link>
                      <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => onDeleteClick(product)}>
                        <TrashIcon size={16} /> Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default SellerProductTable;
