// components/ShareButton.jsx
// The Share button. Anyone can use it (no login needed).
// Clicking it opens the share pop-up (ShareDialog.jsx) with WhatsApp, Gmail, SMS, copy link ...
//   variant "card"    -> small round button on a product card (under the heart)
//   variant "details" -> button with the word "Share" on the product page

import { useState } from 'react';
import ShareDialog from './ShareDialog.jsx';
import { ShareIcon } from './Icons.jsx';
import '../styles/share.css';

function ShareButton({ product, variant = 'card' }) {
  const [isOpen, setIsOpen] = useState(false);

  function handleClick(event) {
    event.preventDefault(); // the button can sit on top of a link
    event.stopPropagation();
    setIsOpen(true);
  }

  return (
    <>
      <button
        type="button"
        className={`share-button share-button-${variant}`}
        onClick={handleClick}
        aria-haspopup="dialog"
        aria-label={`Share ${product.name}`}
        title="Share this product"
      >
        <ShareIcon size={variant === 'card' ? 18 : 20} />
        {variant === 'details' && <span>Share</span>}
      </button>

      {/* The pop-up is only added to the page while it is open */}
      {isOpen && <ShareDialog product={product} onClose={() => setIsOpen(false)} />}
    </>
  );
}

export default ShareButton;
