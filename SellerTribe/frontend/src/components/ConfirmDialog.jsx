// components/ConfirmDialog.jsx
// "Are you sure?" pop-up built on the browser's <dialog> element
// (which already handles focus and the Escape key for us).

import { useEffect, useRef } from 'react';

function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  busy = false,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);

  // Open or close the real <dialog> when the "open" prop changes
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleCancelEvent(event) {
    // Fired when the user presses Escape
    event.preventDefault();
    if (!busy) onCancel();
  }

  return (
    <dialog ref={dialogRef} className="confirm-dialog" onCancel={handleCancelEvent} aria-labelledby="confirm-dialog-title">
      <h2 id="confirm-dialog-title" className="confirm-dialog-title">
        {title}
      </h2>
      <p className="confirm-dialog-message">{message}</p>
      <div className="confirm-dialog-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={busy} autoFocus>
          {cancelText}
        </button>
        <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Please wait...' : confirmText}
        </button>
      </div>
    </dialog>
  );
}

export default ConfirmDialog;
