// components/EmptyState.jsx
// Friendly message for empty lists ("No products yet", "No orders yet"...)
// "photo" is one of the small photos from data/photoIcons.js.

import PhotoIcon from './PhotoIcon.jsx';
import photoIcons from '../data/photoIcons.js';

function EmptyState({ photo = photoIcons.forest, title, message, children }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        <PhotoIcon photo={photo} className="empty-state-photo" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {message && <p className="empty-state-message">{message}</p>}
      {children && <div className="empty-state-actions">{children}</div>}
    </div>
  );
}

export default EmptyState;
