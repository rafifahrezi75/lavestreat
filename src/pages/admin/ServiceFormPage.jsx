import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { ImageUploader } from '../../components/common/ImageUploader';
import { uploadImage } from '../../lib/cloudinary';
import { useToast } from '../../context/ToastContext';
import { servicesApi } from '../../lib/api';

export function ServiceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [pendingFile, setPendingFile] = useState(null);

  const [formData, setFormData] = useState({
    nama: '',
    kategori: 'cuci',
    deskripsi: '',
    harga: '',
    satuan: 'per pasang',
    foto: '',
    aktif: true
  });

  useEffect(() => {
    if (isEdit) {
      async function loadService() {
        try {
          const item = await servicesApi.getServiceById(id);
          if (item) {
            setFormData({
              nama: item.nama,
              kategori: item.kategori,
              deskripsi: item.deskripsi,
              harga: item.harga.toString(),
              satuan: item.satuan || 'per pasang',
              foto: item.foto || '',
              aktif: item.aktif !== false
            });
          } else {
            showToast('Layanan tidak ditemukan', 'danger');
            navigate('/admin/services');
          }
        } catch {
          showToast('Gagal memuat data layanan', 'danger');
          navigate('/admin/services');
        } finally {
          setLoading(false);
        }
      }
      loadService();
    }
  }, [id, isEdit, navigate, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.harga) {
      setFormError('Nama layanan dan harga wajib diisi.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      let finalFoto = formData.foto;
      if (pendingFile) {
        finalFoto = await uploadImage(pendingFile);
      }

      const payload = {
        ...formData,
        foto: finalFoto,
        harga: parseInt(formData.harga.toString().replace(/\D/g, ''), 10) || 0
      };

      if (isEdit) {
        await servicesApi.updateService(id, payload);
        showToast('Layanan berhasil diperbarui.');
      } else {
        await servicesApi.createService(payload);
        showToast('Layanan baru berhasil ditambahkan.');
      }
      navigate('/admin/services');
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan layanan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        Memuat formulir layanan...
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card noPadding rounded="2xl" className="border-slate-200/80 bg-white shadow-xs w-full overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                to="/admin/services"
                className="w-9 h-9 rounded-md border border-slate-200/90 text-slate-600 hover:text-brand-900 hover:bg-white flex items-center justify-center transition-colors shadow-2xs shrink-0"
                aria-label="Kembali"
                title="Kembali"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>

              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold font-display text-brand-900 tracking-tight truncate">
                  {isEdit ? 'Edit Layanan' : 'Tambah Layanan Baru'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">
                  {isEdit ? 'Perbarui informasi dan tarif layanan workshop.' : 'Lengkapi formulir untuk menambahkan layanan atau produk baru.'}
                </p>
              </div>
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-md shadow-xs shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Menyimpan...' : 'Simpan'}</span>
            </Button>
          </div>

          <div className="p-5 sm:p-7 flex flex-col gap-6">
            {formError && (
              <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-xs text-danger font-medium">
                {formError}
              </div>
            )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
            <div className="lg:col-span-7 flex flex-col gap-4">
              <Input
                label="Nama Layanan / Produk"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Contoh: Deep Clean Premium"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Kategori"
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  options={[
                    { value: 'cuci', label: 'Cuci Sepatu' },
                    { value: 'repaint', label: 'Repaint Sepatu' },
                    { value: 'sabun', label: 'Produk Perawatan (Cleaner / Refresher)' }
                  ]}
                  required
                />

                <Input
                  label="Satuan"
                  value={formData.satuan}
                  onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                  placeholder="per pasang / per botol"
                  required
                />
              </div>

              <Input
                label="Harga (Rupiah)"
                type="number"
                value={formData.harga}
                onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                placeholder="35000"
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-brand-900">
                  Deskripsi Lengkap
                </label>
                <textarea
                  rows={4}
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Jelaskan cakupan pengerjaan treatment ini..."
                  className="w-full rounded-lg border border-slate-200/90 bg-white p-3 text-sm text-ink-deep placeholder:text-slate-400 focus:border-brand-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="service-active"
                  checked={formData.aktif}
                  onChange={(e) => setFormData({ ...formData, aktif: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded-sm focus:ring-brand-600 border-slate-300"
                />
                <label htmlFor="service-active" className="text-xs font-medium text-brand-900 cursor-pointer">
                  Tampilkan layanan ini di katalog publik (Aktif)
                </label>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-4">
              <ImageUploader
                value={formData.foto}
                onChange={(url, file) => {
                  setFormData(prev => ({ ...prev, foto: url }));
                  setPendingFile(file || null);
                }}
                onRemove={() => {
                  setFormData(prev => ({ ...prev, foto: '' }));
                  setPendingFile(null);
                }}
                label="Foto Layanan (Cloudinary)"
              />
            </div>
          </div>
        </div>
      </form>
    </Card>
  </div>
  );
}
