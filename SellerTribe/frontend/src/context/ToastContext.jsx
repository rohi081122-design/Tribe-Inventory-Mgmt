// context/ToastContext.jsx
// Small pop-up messages ("toasts") shown in the corner of the screen.
// Usage:  const { showToast } = useToast();  showToast('Product added', 'success');

import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

const TOAST_DURATION_MS = 4000;
let nextToastId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  // type: 'success' | 'error' | 'info'
  const showToast = useCallback(
    (message, type = 'success') => {
      const id = nextToastId++;
      setToasts((current) => [...current.slice(-2), { id, message, type }]); // show at most 3
      setTimeout(() => removeToast(id), TOAST_DURATION_MS);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
            <span className="toast-message">{toast.message}</span>
            <button type="button" className="toast-close" onClick={() => removeToast(toast.id)} aria-label="Close message">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
