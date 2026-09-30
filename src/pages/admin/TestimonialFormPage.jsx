import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { testimonialsApi } from '../../lib/api';

export function TestimonialFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    nama_pelanggan: searchParams.get('nama') || '',
    isi: '',
    rating: '5',
    foto_url: '',
    tampil: true,
    is_anonymous: false
  });

  useEffect(() => {
    if (isEdit) {
      async function loadTestimonial() {
        try {
          const list = await testimonialsApi.getTestimonials(false);
          const found = list.find(t => t.id === id);
          if (found) {
            setFormData({
              nama_pelanggan: found.nama_pelanggan,
              isi: found.isi,
              rating: (found.rating || 5).toString(),
              foto_url: found.foto_url || '',
              tampil: found.tampil !== false,
              is_anonymous: Boolean(found.is_anonymous || found.anonim)
            });
          } else {
            showToast('Testimoni tidak ditemukan', 'danger');
            navigate('/admin/testimonials');
          }
        } catch {
          showToast('Gagal memuat testimoni', 'danger');
          navigate('/admin/testimonials');
        } finally {
          setLoading(false);
        }
      }
      loadTestimonial();
    }
  }, [id, isEdit, navigate, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_pelanggan.trim() || !formData.isi.trim()) {
      setFormError('Nama pelanggan dan isi testimoni wajib diisi.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const payload = {
        ...formData,
        rating: Number(formData.rating) || 5
      };

      if (isEdit) {
        await testimonialsApi.updateTestimonial(id, payload);
        showToast('Testimoni berhasil diperbarui.');
      } else {
        await testimonialsApi.createTestimonial(payload);
        showToast('Testimoni baru berhasil ditambahkan.');
      }
      navigate('/admin/testimonials');
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan testimoni.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        Memuat formulir testimoni...
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card noPadding rounded="2xl" className="border-slate-200/80 bg-white shadow-xs w-full overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <Link
                to="/admin/testimonials"
                className="w-9 h-9 rounded-md border border-slate-200/90 text-slate-600 hover:text-brand-900 hover:bg-white flex items-center justify-center transition-colors shadow-2xs"
                aria-label="Kembali"
                title="Kembali"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>

              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-md shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? 'Menyimpan...' : 'Simpan'}</span>
              </Button>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-brand-900 tracking-tight">
                {isEdit ? 'Edit Testimoni' : 'Tambah Testimoni Baru'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {isEdit ? 'Perbarui ulasan dan data kepuasan pelanggan.' : 'Catat ulasan pelanggan dari percakapan WhatsApp atau media sosial.'}
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-7 flex flex-col gap-6">
            {formError && (
              <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-xs text-danger font-medium">
                {formError}
              </div>
            )}

          <div className="flex flex-col gap-4 max-w-2xl">
            <Input
              label="Nama Pelanggan"
              value={formData.nama_pelanggan}
              onChange={(e) => setFormData({ ...formData, nama_pelanggan: e.target.value })}
              placeholder="Contoh: Budi Santoso"
              required
            />

            <Select
              label="Rating Kepuasan"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              options={[
                { value: '5', label: '5 Bintang (Sangat Puas)' },
                { value: '4', label: '4 Bintang (Puas)' },
                { value: '3', label: '3 Bintang (Cukup)' },
                { value: '2', label: '2 Bintang (Kurang)' },
                { value: '1', label: '1 Bintang (Kecewa)' }
              ]}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-brand-900">
                Isi Testimoni / Ulasan
              </label>
              <textarea
                rows={4}
                value={formData.isi}
                onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                placeholder="Tuliskan ulasan asli dari pelanggan..."
                required
                className="w-full rounded-lg border border-slate-200/90 bg-white p-3 text-sm text-ink-deep placeholder:text-slate-400 focus:border-brand-600 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="testi-anon"
                checked={formData.is_anonymous}
                onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                className="w-4 h-4 text-brand-600 rounded-sm focus:ring-brand-600 border-slate-300"
              />
              <label htmlFor="testi-anon" className="text-xs font-medium text-brand-900 cursor-pointer">
                Tampilkan sebagai nama Anonim di website
              </label>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="testi-visible"
                checked={formData.tampil}
                onChange={(e) => setFormData({ ...formData, tampil: e.target.checked })}
                className="w-4 h-4 text-brand-600 rounded-sm focus:ring-brand-600 border-slate-300"
              />
              <label htmlFor="testi-visible" className="text-xs font-medium text-brand-900 cursor-pointer">
                Tampilkan di halaman utama website
              </label>
            </div>
          </div>
        </div>
      </form>
    </Card>
  </div>
  );
}
