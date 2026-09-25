import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ImageUploader } from '../../components/common/ImageUploader';
import { useToast } from '../../context/ToastContext';
import { galleryApi, servicesApi } from '../../lib/api';

export function GalleryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [services, setServices] = useState([]);

  const [formData, setFormData] = useState({
    before_url: '',
    after_url: '',
    caption: '',
    layanan_terkait: '',
    invoice: '',
    customer_name: '',
    tampil_di_home: true
  });

  useEffect(() => {
    async function init() {
      try {
        const sList = await servicesApi.getServices(false);
        setServices(sList.filter(s => s.aktif));

        if (isEdit) {
          const gList = await galleryApi.getGallery(false);
          const found = gList.find(g => g.id === id);
          if (found) {
            setFormData({
              before_url: found.before_url,
              after_url: found.after_url,
              caption: found.caption,
              layanan_terkait: found.layanan_terkait || '',
              invoice: found.invoice || found.order_id || '',
              customer_name: found.customer_name || '',
              tampil_di_home: found.tampil_di_home !== false
            });
          } else {
            showToast('Item galeri tidak ditemukan', 'danger');
            navigate('/admin/gallery');
          }
        }
      } catch {
        showToast('Gagal memuat data formulir galeri', 'danger');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id, isEdit, navigate, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.before_url || !formData.after_url) {
      setFormError('Kedua foto (Sebelum dan Sesudah) wajib diunggah.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      if (isEdit) {
        await galleryApi.updateGalleryItem(id, formData);
        showToast('Foto galeri berhasil diperbarui.');
      } else {
        await galleryApi.createGalleryItem(formData);
        showToast('Foto galeri berhasil ditambahkan.');
      }
      navigate('/admin/gallery');
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan galeri.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-wet text-sm">
        Memuat formulir galeri...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-2.5">
        <Link
          to="/admin/gallery"
          className="p-1.5 rounded-lg border border-brand-200 text-brand-900 hover:bg-brand-100 transition-colors inline-flex items-center gap-1.5 text-xs font-medium"
          aria-label="Kembali"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Galeri</span>
        </Link>
      </div>

      <Card className="p-5 sm:p-6 border-brand-200 w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && (
            <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-xs text-danger font-medium">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ImageUploader
              value={formData.before_url}
              onChange={(url) => setFormData({ ...formData, before_url: url })}
              label="1. Foto Sebelum (Before) *"
            />
            <ImageUploader
              value={formData.after_url}
              onChange={(url) => setFormData({ ...formData, after_url: url })}
              label="2. Foto Sesudah (After) *"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="No. Invoice / Pesanan (Opsional)"
              value={formData.invoice}
              onChange={(e) => setFormData({ ...formData, invoice: e.target.value })}
              placeholder="Contoh: INV-2026-0012 atau ORD-1001"
            />
            <Input
              label="Nama Pemilik / Pelanggan (Opsional)"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              placeholder="Contoh: Dimas Pratama"
            />
          </div>

          <Input
            label="Keterangan / Caption"
            value={formData.caption}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            placeholder="Contoh: Restorasi warna canvas hitam pudar menjadi pekat kembali."
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-brand-900">
              Layanan Terkait (Join Master Layanan)
            </label>
            <select
              value={formData.layanan_terkait}
              onChange={(e) => setFormData({ ...formData, layanan_terkait: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-brand-200 bg-white text-xs sm:text-sm text-brand-900 focus:outline-hidden focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors"
            >
              <option value="">-- Pilih layanan terkait (opsional) --</option>
              {services.map((s) => (
                <option key={s.id} value={s.nama}>
                  {s.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="gallery-home"
              checked={formData.tampil_di_home}
              onChange={(e) => setFormData({ ...formData, tampil_di_home: e.target.checked })}
              className="w-4 h-4 text-brand-600 rounded-sm focus:ring-brand-600 border-brand-200"
            />
            <label htmlFor="gallery-home" className="text-xs font-medium text-brand-900 cursor-pointer">
              Tampilkan di halaman utama (Beranda)
            </label>
          </div>

          <div className="pt-4 border-t border-brand-200 flex justify-end gap-2.5">
            <Link to="/admin/gallery">
              <Button type="button" variant="secondary" size="sm">
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{submitting ? 'Menyimpan...' : 'Simpan Foto'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
