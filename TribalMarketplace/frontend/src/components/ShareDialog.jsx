// components/ShareDialog.jsx
// The "Share this product" pop-up: WhatsApp, Gmail, Email, SMS, Facebook, Telegram,
// the phone's own share menu ("More apps") and a box with the link + Copy button.
// Built on the browser's <dialog> element, which already handles focus and the Escape key.

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ImageWithFallback from './ImageWithFallback.jsx';
import {
  ChatIcon,
  CheckIcon,
  CloseIcon,
  FacebookIcon,
  LinkIcon,
  MailIcon,
  MessageIcon,
  MoreIcon,
  SendIcon,
} from './Icons.jsx';
import { formatPrice } from '../utils/format.js';
import {
  canUseNativeShare,
  copyToClipboard,
  getProductShareText,
  getProductShareUrl,
  getShareOptions,
} from '../utils/share.js';

// Which icon each app gets (the keys come from getShareOptions in utils/share.js)
const OPTION_ICONS = {
  whatsapp: ChatIcon,
  gmail: MailIcon,
  email: MailIcon,
  sms: MessageIcon,
  facebook: FacebookIcon,
  telegram: SendIcon,
};

function ShareDialog({ product, onClose }) {
  const dialogRef = useRef(null);
  const linkInputRef = useRef(null);
  const titleId = useId();
  const [copied, setCopied] = useState(false);
  // Small message shown inside the pop-up (toasts would be hidden behind the dark background)
  const [notice, setNotice] = useState('');

  const shareUrl = getProductShareUrl(product);
  const options = getShareOptions(product);
  const showMoreApps = canUseNativeShare();

  // The pop-up is only on the page while it is open, so open it as soon as it appears
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  // "Copied" changes back to "Copy" after 2 seconds
  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  // dialog.close() fires the "close" event, and onClose then removes the pop-up
  function closeDialog() {
    dialogRef.current?.close();
  }

  function handleDialogClick(event) {
    // A click on the dark background lands on the <dialog> itself
    // (all the content is inside .share-dialog-inner)
    if (event.target === event.currentTarget) closeDialog();
  }

  async function handleCopy() {
    const done = await copyToClipboard(shareUrl, linkInputRef.current);
    if (done) {
      setCopied(true);
      setNotice('Link copied. Paste it anywhere to share this product.');
    } else {
      setNotice('Could not copy automatically. The link is selected: press Ctrl+C (or long-press it and tap Copy).');
    }
  }

  // The phone's own share menu (lists every app installed on the phone)
  async function handleMoreApps() {
    try {
      await navigator.share({ title: product.name, text: getProductShareText(product), url: shareUrl });
      closeDialog();
    } catch (error) {
      // AbortError = the person closed the share menu without choosing an app, which is fine
      if (error.name !== 'AbortError') setNotice('Could not open the share menu. Please copy the link instead.');
    }
  }

  // createPortal puts the pop-up at the end of <body>, outside the product card,
  // so the card's hover effects and links do not affect it
  return createPortal(
    <dialog
      ref={dialogRef}
      className="share-dialog"
      onClose={onClose}
      onClick={handleDialogClick}
      aria-labelledby={titleId}
    >
      <div className="share-dialog-inner">
        <div className="share-dialog-header">
          <h2 id={titleId} className="share-dialog-title">
            Share this product
          </h2>
          <button type="button" className="share-dialog-close" onClick={closeDialog} aria-label="Close">
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Which product is being shared */}
        <div className="share-product">
          <ImageWithFallback src={product.image?.url} alt="" label="Photo" width={160} className="share-product-image" />
          <div>
            <strong className="share-product-name">{product.name}</strong>
            <span className="share-product-price">{formatPrice(product.price)}</span>
          </div>
        </div>

        <h3 className="share-section-title">Share via</h3>
        <ul className="share-options">
          {options.map((option) => {
            const OptionIcon = OPTION_ICONS[option.key];
            return (
              <li key={option.key}>
                <a
                  href={option.href}
                  className={`share-option share-option-${option.key}`}
                  // Websites open in a new tab; email and SMS links open the phone's own app
                  target={option.newTab ? '_blank' : undefined}
                  rel={option.newTab ? 'noopener noreferrer' : undefined}
                  onClick={closeDialog}
                >
                  <span className="share-option-icon" aria-hidden="true">
                    <OptionIcon size={22} />
                  </span>
                  <span className="share-option-label">{option.label}</span>
                </a>
              </li>
            );
          })}

          {showMoreApps && (
            <li>
              <button type="button" className="share-option share-option-more" onClick={handleMoreApps}>
                <span className="share-option-icon" aria-hidden="true">
                  <MoreIcon size={22} />
                </span>
                <span className="share-option-label">More apps</span>
              </button>
            </li>
          )}
        </ul>

        <label className="share-section-title" htmlFor={`${titleId}-link`}>
          Or copy the link
        </label>
        <div className="share-link-row">
          <span className="share-link-icon" aria-hidden="true">
            <LinkIcon size={18} />
          </span>
          <input
            ref={linkInputRef}
            id={`${titleId}-link`}
            className="share-link-input"
            type="text"
            value={shareUrl}
            readOnly
            onFocus={(event) => event.target.select()}
          />
          <button type="button" className={`btn btn-primary btn-sm share-copy-button ${copied ? 'is-copied' : ''}`} onClick={handleCopy}>
            {copied ? (
              <>
                <CheckIcon size={16} /> Copied
              </>
            ) : (
              'Copy'
            )}
          </button>
        </div>

        <p className="share-notice" role="status" aria-live="polite">
          {notice}
        </p>
      </div>
    </dialog>,
    document.body
  );
}

export default ShareDialog;
