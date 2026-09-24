import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg'
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-brand-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className={cn("relative w-full bg-white rounded-card shadow-xl border border-brand-200 p-6 z-10 max-h-[90vh] flex flex-col", maxWidth)}>
        <div className="flex items-center justify-between pb-4 border-b border-brand-200 shrink-0">
          <h3 id="modal-title" className="text-xl font-bold font-display text-brand-900">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-wet hover:text-brand-900 p-1.5 rounded-full hover:bg-brand-100 transition-colors"
            aria-label="Tutup jendela modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="pt-4 overflow-y-auto grow">
          {children}
        </div>
      </div>
    </div>
  );
}
