import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck } from '@phosphor-icons/react';
import { SliderCaptcha } from './SliderCaptcha';

export function SliderCaptchaModal({ isOpen, onClose, onSuccess, title = 'Verifikasi Keamanan' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSuccess = () => {
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 600);
  };

  const modalElement = (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-brand-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-brand-200 p-5 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-200/60">
          <div className="flex items-center gap-2 text-brand-900">
            <ShieldCheck size={20} weight="fill" className="text-brand-600 shrink-0" />
            <h3 className="font-display font-bold text-base">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-brand-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Tutup verifikasi"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <SliderCaptcha onSuccess={handleSuccess} />
      </div>
    </div>
  );

  return createPortal(modalElement, document.body);
}
