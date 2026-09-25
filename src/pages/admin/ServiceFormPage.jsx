import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { ImageUploader } from '../../components/common/ImageUploader';
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
      const payload = {
        ...formData,
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
      <div className="py-12 text-center text-slate-wet text-sm">
        Memuat formulir layanan...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-2.5">
        <Link
          to="/admin/services"
          className="p-1.5 rounded-lg border border-brand-200 text-brand-900 hover:bg-brand-100 transition-colors inline-flex items-center gap-1.5 text-xs font-medium"
          aria-label="Kembali"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Layanan</span>
        </Link>
      </div>

      <Card className="p-5 sm:p-6 border-brand-200 w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
                    { value: 'sabun', label: 'Sabun & Perawatan' }
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
                  className="w-full rounded-lg border border-brand-200 bg-white p-3 text-sm text-ink-deep placeholder:text-slate-wet/60 focus:border-brand-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="service-active"
                  checked={formData.aktif}
                  onChange={(e) => setFormData({ ...formData, aktif: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded-sm focus:ring-brand-600 border-brand-200"
                />
                <label htmlFor="service-active" className="text-xs font-medium text-brand-900 cursor-pointer">
                  Tampilkan layanan ini di katalog publik (Aktif)
                </label>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-4">
              <ImageUploader
                value={formData.foto}
                onChange={(url) => setFormData({ ...formData, foto: url })}
                label="Foto Layanan (Cloudinary)"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-brand-200 flex justify-end gap-2.5">
            <Link to="/admin/services">
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
              <span>{submitting ? 'Menyimpan...' : 'Simpan'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
