import React, { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { uploadImage } from '../../lib/cloudinary';
import { cn } from '../../lib/utils';

export function ImageUploader({
  value,
  onChange,
  label = 'Unggah Gambar',
  aspectRatio = 'aspect-video',
  className = ''
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
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
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err.message || 'Gagal mengunggah gambar');
    } finally {
      setUploading(false);
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
          <div className="absolute inset-0 bg-brand-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
            <label className="cursor-pointer bg-white text-brand-900 text-sm font-semibold px-4 py-2 rounded-full shadow-md hover:bg-brand-100 transition-colors">
              Ganti Foto
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      ) : (
        <label className="cursor-pointer border-2 border-dashed border-brand-200 rounded-card p-6 flex flex-col items-center justify-center gap-2 hover:border-brand-600 hover:bg-brand-100/30 transition-all text-center">
          <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>
          <div>
            <span className="text-sm font-semibold text-brand-900">
              {uploading ? 'Mengunggah...' : 'Klik untuk memilih gambar'}
            </span>
            <p className="text-xs text-slate-wet mt-0.5">PNG, JPG, atau WebP hingga 5MB</p>
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}

      {error && <span className="text-xs text-danger font-medium">{error}</span>}
    </div>
  );
}
