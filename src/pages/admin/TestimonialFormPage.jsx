import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
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
      <div className="py-12 text-center text-slate-wet text-sm">
        Memuat formulir testimoni...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-2.5">
        <Link
          to="/admin/testimonials"
          className="p-1.5 rounded-lg border border-brand-200 text-brand-900 hover:bg-brand-100 transition-colors inline-flex items-center gap-1.5 text-xs font-medium"
          aria-label="Kembali"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Testimoni</span>
        </Link>
      </div>

      <Card className="p-5 sm:p-6 border-brand-200">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && (
            <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-xs text-danger font-medium">
              {formError}
            </div>
          )}

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
              className="w-full rounded-lg border border-brand-200 bg-white p-3 text-sm text-ink-deep placeholder:text-slate-wet/60 focus:border-brand-600 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="testi-anon"
              checked={formData.is_anonymous}
              onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
              className="w-4 h-4 text-brand-600 rounded-sm focus:ring-brand-600 border-brand-200"
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
              className="w-4 h-4 text-brand-600 rounded-sm focus:ring-brand-600 border-brand-200"
            />
            <label htmlFor="testi-visible" className="text-xs font-medium text-brand-900 cursor-pointer">
              Tampilkan di halaman utama website
            </label>
          </div>

          <div className="pt-4 border-t border-brand-200 flex justify-end gap-2.5">
            <Link to="/admin/testimonials">
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
              <span>{submitting ? 'Menyimpan...' : 'Simpan Testimoni'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
