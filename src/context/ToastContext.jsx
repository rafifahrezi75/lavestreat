import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle } from '@phosphor-icons/react';

const ToastContext = createContext({
  showToast: () => {}
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between px-4 py-3 rounded-lg shadow-md border text-sm font-medium transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
              toast.type === 'danger'
                ? 'bg-brand-900 text-white border-danger/40 shadow-danger/10'
                : 'bg-brand-900 text-white border-brand-200/20 shadow-brand-900/15'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  toast.type === 'danger' ? 'bg-danger' : 'bg-success'
                }`}
              />
              <span className="text-sm leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-snow-foam/60 hover:text-snow-foam transition-colors p-1"
              aria-label="Tutup"
            >
              &times;
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
