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
    pos_y: 50,
    object_position: '50% 50%',
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
              pos_y: found.pos_y ?? 50,
              object_position: found.object_position || `50% ${found.pos_y ?? 50}%`,
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

          {(formData.before_url || formData.after_url) && (
            <div className="p-4 bg-brand-light/40 border border-brand-200/80 rounded-xl flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div>
                  <h3 className="text-xs font-bold text-brand-900 uppercase tracking-wide">
                    Atur Posisi Fokus Frame (Crop & Geser Tampilan)
                  </h3>
                  <p className="text-[11px] text-slate-wet">
                    Geser posisi vertikal agar bagian sepatu yang penting (atas atau sol bawah) tampil pas di dalam frame kartu 4:3.
                  </p>
                </div>
                <span className="text-xs font-semibold text-brand-600 px-2 py-0.5 bg-white border border-brand-200 rounded-md shrink-0">
                  Posisi: {formData.pos_y}%
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, pos_y: 15, object_position: '50% 15%' }))}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${formData.pos_y <= 25 ? 'bg-brand-600 text-white border-brand-600 font-semibold' : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-100'}`}
                >
                  Fokus Atas (Sepatu Tinggi)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, pos_y: 50, object_position: '50% 50%' }))}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${formData.pos_y > 25 && formData.pos_y < 75 ? 'bg-brand-600 text-white border-brand-600 font-semibold' : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-100'}`}
                >
                  Fokus Tengah (Standar)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, pos_y: 85, object_position: '50% 85%' }))}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${formData.pos_y >= 75 ? 'bg-brand-600 text-white border-brand-600 font-semibold' : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-100'}`}
                >
                  Fokus Bawah (Sol / Midsole)
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-wet shrink-0">Atas (0%)</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.pos_y}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      pos_y: val,
                      object_position: `50% ${val}%`
                    }));
                  }}
                  className="w-full accent-brand-600 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-wet shrink-0">Bawah (100%)</span>
              </div>

              <div className="mt-1">
                <span className="text-[11px] font-semibold text-slate-wet block mb-1.5">
                  Live Preview Frame Kartu (Rasio 4:3):
                </span>
                <div className="w-full max-w-sm mx-auto aspect-[4/3] rounded-xl overflow-hidden border border-brand-200 bg-slate-100 shadow-xs relative">
                  <div className="absolute inset-0 grid grid-cols-2">
                    <div className="relative overflow-hidden border-r border-white">
                      {formData.before_url ? (
                        <img
                          src={formData.before_url}
                          alt="Preview Sebelum"
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-150"
                          style={{ objectPosition: `50% ${formData.pos_y}%` }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-wet">
                          Belum ada foto
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 py-0.5 bg-black/50 text-center text-[9px] text-white font-bold uppercase">
                        Sebelum
                      </div>
                    </div>
                    <div className="relative overflow-hidden">
                      {formData.after_url ? (
                        <img
                          src={formData.after_url}
                          alt="Preview Sesudah"
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-150"
                          style={{ objectPosition: `50% ${formData.pos_y}%` }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-wet">
                          Belum ada foto
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 py-0.5 bg-brand-600/70 text-center text-[9px] text-white font-bold uppercase">
                        Sesudah
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
