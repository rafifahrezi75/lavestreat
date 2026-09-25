import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ImageUploader } from '../../components/common/ImageUploader';
import { useToast } from '../../context/ToastContext';
import { galleryApi, servicesApi } from '../../lib/api';

const ANGLE_SLOTS = [
  { slot: 1, label: 'Sudut Depan / Upper' },
  { slot: 2, label: 'Sudut Samping Luar' },
  { slot: 3, label: 'Sudut Samping Dalam' },
  { slot: 4, label: 'Sudut Belakang / Sol' }
];

export function GalleryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [services, setServices] = useState([]);
  const [activeSlot, setActiveSlot] = useState(1);

  const [slots, setSlots] = useState([
    { slot: 1, label: 'Sudut Depan / Upper', before_url: '', after_url: '' },
    { slot: 2, label: 'Sudut Samping Luar', before_url: '', after_url: '' },
    { slot: 3, label: 'Sudut Samping Dalam', before_url: '', after_url: '' },
    { slot: 4, label: 'Sudut Belakang / Sol', before_url: '', after_url: '' }
  ]);

  const [formData, setFormData] = useState({
    before_url: '',
    after_url: '',
    caption: '',
    layanan_terkait: '',
    invoice: '',
    customer_name: '',
    shoe_brand: '',
    shoe_type: '',
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
            let loadedSlots = [
              { slot: 1, label: 'Sudut Depan / Upper', before_url: '', after_url: '' },
              { slot: 2, label: 'Sudut Samping Luar', before_url: '', after_url: '' },
              { slot: 3, label: 'Sudut Samping Dalam', before_url: '', after_url: '' },
              { slot: 4, label: 'Sudut Belakang / Sol', before_url: '', after_url: '' }
            ];

            if (found.slots && found.slots.length > 0) {
              loadedSlots = loadedSlots.map(def => {
                const match = found.slots.find(s => s.slot === def.slot);
                return match ? { ...def, ...match } : def;
              });
            } else {
              loadedSlots[0].before_url = found.before_url || '';
              loadedSlots[0].after_url = found.after_url || '';
            }

            setSlots(loadedSlots);

            setFormData({
              before_url: found.before_url || loadedSlots[0].before_url || '',
              after_url: found.after_url || loadedSlots[0].after_url || '',
              caption: found.caption || '',
              layanan_terkait: found.layanan_terkait || '',
              invoice: found.invoice || found.order_id || '',
              customer_name: found.customer_name || '',
              shoe_brand: found.shoe_brand || '',
              shoe_type: found.shoe_type || '',
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

  const handleSlotPhotoChange = (slotNum, kind, url) => {
    setSlots(prev => {
      const updated = prev.map(s => {
        if (s.slot === slotNum) {
          return { ...s, [kind]: url };
        }
        return s;
      });

      const firstSlot = updated[0];
      setFormData(fd => ({
        ...fd,
        before_url: firstSlot.before_url || updated.find(s => s.before_url)?.before_url || '',
        after_url: firstSlot.after_url || updated.find(s => s.after_url)?.after_url || ''
      }));

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const filledSlots = slots.filter(s => s.before_url && s.after_url);
    if (filledSlots.length === 0) {
      setFormError('Minimal satu sudut harus memiliki foto Sebelum dan Sesudah lengkap.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    const primary = filledSlots[0] || slots[0];
    const payload = {
      ...formData,
      before_url: primary.before_url || formData.before_url,
      after_url: primary.after_url || formData.after_url,
      slots: slots
    };

    try {
      if (isEdit) {
        await galleryApi.updateGalleryItem(id, payload);
        showToast('Foto galeri berhasil diperbarui.');
      } else {
        await galleryApi.createGalleryItem(payload);
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

  const currentSlotData = slots.find(s => s.slot === activeSlot) || slots[0];
  const currentAngle = ANGLE_SLOTS.find(a => a.slot === activeSlot) || ANGLE_SLOTS[0];

  return (
    <div className="flex flex-col gap-5 w-full">
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {formError && (
          <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-xs text-danger font-medium">
            {formError}
          </div>
        )}

        <Card className="p-5 sm:p-6 border-brand-200 w-full flex flex-col gap-4">
          <div className="border-b border-brand-200/80 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-brand-900">
                Dokumentasi Foto Sepatu (4 Sudut Before & After)
              </h2>
              <p className="text-xs text-slate-wet">
                Satu pasang sepatu mencakup 4 sudut foto: Depan/Upper, Samping Luar, Samping Dalam, dan Belakang/Sol.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-brand-100 text-brand-900 rounded-full border border-brand-200 shrink-0 self-start sm:self-auto">
              Total 4 Sudut (8 Foto)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {ANGLE_SLOTS.map((angle) => {
              const sData = slots.find(s => s.slot === angle.slot) || { before_url: '', after_url: '' };
              const hasBefore = Boolean(sData.before_url);
              const hasAfter = Boolean(sData.after_url);
              const isComplete = hasBefore && hasAfter;
              const isActive = activeSlot === angle.slot;

              return (
                <button
                  key={angle.slot}
                  type="button"
                  onClick={() => setActiveSlot(angle.slot)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 relative ${
                    isActive
                      ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-600/30 shadow-xs'
                      : 'border-brand-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-900">
                      Sudut #{angle.slot}
                    </span>
                    {isComplete ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        hasBefore || hasAfter ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {hasBefore || hasAfter ? '1 Foto' : 'Kosong'}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-wet font-medium truncate">
                    {angle.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-4 bg-slate-50/70 rounded-xl border border-brand-200 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-brand-200/60 pb-2">
              <span className="text-xs font-bold text-brand-900">
                Upload Foto Sudut #{activeSlot}: {currentAngle.label}
              </span>
              <span className="text-[11px] text-slate-wet">
                Status: {currentSlotData.before_url && currentSlotData.after_url ? 'Lengkap Sebelum & Sesudah' : 'Belum Lengkap'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ImageUploader
                value={currentSlotData.before_url}
                onChange={(url) => handleSlotPhotoChange(activeSlot, 'before_url', url)}
                label={`Foto Sebelum (Before) - Sudut #${activeSlot}`}
              />
              <ImageUploader
                value={currentSlotData.after_url}
                onChange={(url) => handleSlotPhotoChange(activeSlot, 'after_url', url)}
                label={`Foto Sesudah (After) - Sudut #${activeSlot}`}
              />
            </div>
          </div>

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
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                  formData.pos_y <= 25 ? 'bg-brand-600 text-white border-brand-600 font-semibold' : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-100'
                }`}
              >
                Fokus Atas (Sepatu Tinggi)
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, pos_y: 50, object_position: '50% 50%' }))}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                  formData.pos_y > 25 && formData.pos_y < 75 ? 'bg-brand-600 text-white border-brand-600 font-semibold' : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-100'
                }`}
              >
                Fokus Tengah (Standar)
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, pos_y: 85, object_position: '50% 85%' }))}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                  formData.pos_y >= 75 ? 'bg-brand-600 text-white border-brand-600 font-semibold' : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-100'
                }`}
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
                Live Preview Frame Kartu (Sudut #{activeSlot}: {currentAngle.label}) Rasio 4:3:
              </span>
              <div className="w-full max-w-sm mx-auto aspect-[4/3] rounded-xl overflow-hidden border border-brand-200 bg-slate-100 shadow-xs relative">
                <div className="absolute inset-0 grid grid-cols-2">
                  <div className="relative overflow-hidden border-r border-white">
                    {currentSlotData.before_url ? (
                      <img
                        src={currentSlotData.before_url}
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
                    {currentSlotData.after_url ? (
                      <img
                        src={currentSlotData.after_url}
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

          <div className="border-t border-brand-200/80 pt-4 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-brand-900 uppercase tracking-wide">
              Informasi Sepatu & Pesanan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="No. Invoice / Pesanan"
                value={formData.invoice}
                onChange={(e) => setFormData({ ...formData, invoice: e.target.value })}
                placeholder="Contoh: INV-2609-1029"
              />
              <Input
                label="Nama Pemilik / Pelanggan"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder="Contoh: Mas Raka"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Merek Sepatu (Brand)"
                value={formData.shoe_brand}
                onChange={(e) => setFormData({ ...formData, shoe_brand: e.target.value })}
                placeholder="Contoh: NB, Brodo, Nike"
              />
              <Input
                label="Tipe / Model Sepatu"
                value={formData.shoe_type}
                onChange={(e) => setFormData({ ...formData, shoe_type: e.target.value })}
                placeholder="Contoh: White Silver, Air Jordan 1"
              />
            </div>

            <Input
              label="Keterangan / Caption"
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              placeholder="Contoh: Restorasi White Clean pada NB White Silver"
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-brand-900">
                Layanan Terkait
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
                className="w-4 h-4 text-brand-600 rounded-sm focus:ring-brand-600 border-brand-200 cursor-pointer"
              />
              <label htmlFor="gallery-home" className="text-xs font-medium text-brand-900 cursor-pointer">
                Tampilkan di halaman utama (Beranda)
              </label>
            </div>
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
              <span>{submitting ? 'Menyimpan...' : 'Simpan Semua Sudut'}</span>
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
