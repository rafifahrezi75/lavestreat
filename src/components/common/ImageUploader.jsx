import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ImageUploader({
  value,
  onChange,
  onRemove,
  label = 'Unggah Gambar',
  aspectRatio = 'aspect-video',
  className = '',
  disabled = false
}) {
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Hanya file gambar (JPG, PNG, WebP) yang diperbolehkan');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 5 MB');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      const previewUrl = reader.result;
      if (onChange) {
        onChange(previewUrl, file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    } else if (onChange) {
      onChange('', null);
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && <span className="text-sm font-semibold text-brand-900">{label}</span>}

      {value ? (
        <div className="relative rounded-card overflow-hidden border border-brand-200 group">
          <img
            src={value}
            alt="Preview"
            className={cn('w-full object-cover bg-brand-100', aspectRatio)}
          />
          <div className="absolute inset-0 bg-brand-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
            <label className="cursor-pointer bg-white text-brand-900 text-xs font-semibold px-3 py-1.5 rounded-md shadow-md hover:bg-brand-100 transition-colors">
              Ganti Foto
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
              />
            </label>
            <button
              type="button"
              onClick={handleRemove}
              className="bg-danger text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-md hover:bg-danger/90 transition-colors cursor-pointer"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <label className="cursor-pointer border-2 border-dashed border-brand-200 rounded-card p-6 flex flex-col items-center justify-center gap-2 hover:border-brand-600 hover:bg-brand-100/30 transition-all text-center">
          <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <span className="text-sm font-semibold text-brand-900">
              Pilih foto gambar
            </span>
            <p className="text-xs text-slate-wet mt-0.5">PNG, JPG, atau WebP hingga 5MB</p>
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled}
          />
        </label>
      )}

      {error && <span className="text-xs text-danger font-medium">{error}</span>}
    </div>
  );
}
