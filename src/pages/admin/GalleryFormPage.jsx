import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Save, CheckCircle2, Image as ImageIcon } from 'lucide-react';
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

  const [featuredSlot, setFeaturedSlot] = useState(1);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const previewRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    before_url: '',
    after_url: '',
    caption: '',
    layanan_terkait: '',
    invoice: '',
    customer_name: '',
    shoe_brand: '',
    shoe_type: '',
    pos_x: 50,
    pos_y: 50,
    object_position: '50% 50%',
    featured_slot: 1,
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

            const fSlot = found.featured_slot || 1;
            setFeaturedSlot(fSlot);

            let initialX = found.pos_x ?? 50;
            let initialY = found.pos_y ?? 50;
            if (found.object_position) {
              const match = found.object_position.match(/(\d+)%\s+(\d+)%/);
              if (match) {
                initialX = Number(match[1]);
                initialY = Number(match[2]);
              }
            }
            setPosX(initialX);
            setPosY(initialY);

            setFormData({
              before_url: found.before_url || loadedSlots[0].before_url || '',
              after_url: found.after_url || loadedSlots[0].after_url || '',
              caption: found.caption || '',
              layanan_terkait: found.layanan_terkait || '',
              invoice: found.invoice || found.order_id || '',
              customer_name: found.customer_name || '',
              shoe_brand: found.shoe_brand || '',
              shoe_type: found.shoe_type || '',
              pos_x: initialX,
              pos_y: initialY,
              object_position: `${initialX}% ${initialY}%`,
              featured_slot: fSlot,
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

      const chosen = updated.find(s => s.slot === featuredSlot) || updated[0];
      setFormData(fd => ({
        ...fd,
        before_url: chosen.before_url || '',
        after_url: chosen.after_url || ''
      }));

      return updated;
    });
  };

  const handleSelectFeaturedSlot = (slotNum) => {
    setFeaturedSlot(slotNum);
    setActiveSlot(slotNum);
    const chosen = slots.find(s => s.slot === slotNum);
    if (chosen) {
      setFormData(fd => ({
        ...fd,
        featured_slot: slotNum,
        before_url: chosen.before_url || fd.before_url,
        after_url: chosen.after_url || fd.after_url
      }));
    }
  };

  const updatePosition = (newX, newY) => {
    const x = Math.max(0, Math.min(100, Math.round(newX)));
    const y = Math.max(0, Math.min(100, Math.round(newY)));
    setPosX(x);
    setPosY(y);
    setFormData(prev => ({
      ...prev,
      pos_x: x,
      pos_y: y,
      object_position: `${x}% ${y}%`
    }));
  };

  const updateFromPointer = (e) => {
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
    if (clientX == null || clientY == null) return;

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    updatePosition(x, y);
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    updateFromPointer(e);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    updateFromPointer(e);
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {}
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

    const chosen = slots.find(s => s.slot === featuredSlot) || filledSlots[0] || slots[0];
    const payload = {
      ...formData,
      featured_slot: featuredSlot,
      before_url: chosen.before_url || formData.before_url,
      after_url: chosen.after_url || formData.after_url,
      pos_x: posX,
      pos_y: posY,
      object_position: `${posX}% ${posY}%`,
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
  const featuredSlotData = slots.find(s => s.slot === featuredSlot) || slots[0];

  return (
    <div className="w-full">
      <Card noPadding rounded="2xl" className="border-slate-200/80 bg-white shadow-xs w-full overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <Link
                to="/admin/gallery"
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
                <span>{submitting ? 'Menyimpan...' : 'Simpan Semua Sudut'}</span>
              </Button>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-brand-900 tracking-tight">
                {isEdit ? 'Edit Galeri Before-After' : 'Tambah Foto Before-After'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {isEdit ? 'Perbarui dokumentasi foto dan framing crop sepatu.' : 'Unggah foto sebelum dan sesudah treatment untuk katalog portofolio.'}
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-7 flex flex-col gap-6">
            {formError && (
              <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-xs text-danger font-medium">
                {formError}
              </div>
            )}

            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-brand-900">
                1. Pilih Sudut Foto & Sudut Utama Beranda
              </h2>
              <p className="text-xs text-slate-wet mt-0.5">
                Pilih sudut untuk mengunggah foto, dan tentukan sudut mana yang menjadi tampilan utama di Beranda & Kartu.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-brand-100 text-brand-900 rounded-full border border-brand-200 shrink-0 self-start sm:self-auto">
              Total 4 Sudut Foto
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ANGLE_SLOTS.map((angle) => {
              const sData = slots.find(s => s.slot === angle.slot) || { before_url: '', after_url: '' };
              const hasBefore = Boolean(sData.before_url);
              const hasAfter = Boolean(sData.after_url);
              const isComplete = hasBefore && hasAfter;
              const isActive = activeSlot === angle.slot;
              const isFeatured = featuredSlot === angle.slot;

              return (
                <div
                  key={angle.slot}
                  className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 relative ${
                    isFeatured
                      ? 'border-brand-600 bg-brand-50/80 ring-2 ring-brand-600/30 shadow-xs'
                      : isActive
                      ? 'border-brand-300 bg-slate-50'
                      : 'border-brand-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div
                    onClick={() => setActiveSlot(angle.slot)}
                    className="cursor-pointer flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                        <span>Sudut #{angle.slot}</span>
                        {isFeatured && (
                          <span className="text-[10px] bg-accent-gold text-brand-900 font-extrabold px-1.5 py-0.5 rounded-md shadow-2xs">
                            Utama Beranda
                          </span>
                        )}
                      </span>
                      {isComplete ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                          hasBefore || hasAfter ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {hasBefore || hasAfter ? '1 Foto' : 'Kosong'}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-wet font-medium truncate">
                      {angle.label}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-brand-200/60 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveSlot(angle.slot)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                        isActive ? 'text-brand-900 font-bold underline' : 'text-slate-wet hover:text-brand-900'
                      }`}
                    >
                      {isActive ? 'Sedang Diedit' : 'Edit Foto'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectFeaturedSlot(angle.slot)}
                      className={`text-[11px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                        isFeatured
                          ? 'bg-brand-600 text-white'
                          : 'bg-white border border-brand-200 text-brand-900 hover:bg-brand-100'
                      }`}
                      title="Jadikan sudut ini sebagai foto yang tampil di Beranda dan Kartu Galeri"
                    >
                      {isFeatured ? 'Aktif di Beranda' : 'Pilih ke Beranda'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-brand-200 flex flex-col gap-3">
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

          <div className="p-5 bg-brand-light/40 border border-brand-200/80 rounded-xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-200/60 pb-3">
              <div>
                <h3 className="text-xs font-bold text-brand-900 uppercase tracking-wide flex items-center gap-1.5">
                  <span>2. Atur Posisi Framing & Crop (Tampilan Beranda)</span>
                  <span className="px-2 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-bold">
                    Sudut #{featuredSlot}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-wet mt-0.5">
                  Klik & geser langsung pada gambar di bawah atau gunakan kontrol posisi untuk menentukan bagian sepatu yang ingin ditonjolkan di kartu 4:3.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-brand-900 px-2 py-1 bg-white border border-brand-200 rounded-md shrink-0">
                  X: {posX}% | Y: {posY}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-wet mr-1">Preset Fokus:</span>
              <button
                type="button"
                onClick={() => updatePosition(50, 50)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                  posX === 50 && posY === 50 ? 'bg-brand-600 text-white border-brand-600 font-semibold' : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-100'
                }`}
              >
                Tengah (50% 50%)
              </button>
              <button
                type="button"
                onClick={() => updatePosition(50, 15)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                  posY <= 25 ? 'bg-brand-600 text-white border-brand-600 font-semibold' : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-100'
                }`}
              >
                Fokus Atas (Upper)
              </button>
              <button
                type="button"
                onClick={() => updatePosition(50, 85)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                  posY >= 75 ? 'bg-brand-600 text-white border-brand-600 font-semibold' : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-100'
                }`}
              >
                Fokus Bawah (Sol)
              </button>
              <button
                type="button"
                onClick={() => updatePosition(20, 50)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                  posX <= 30 ? 'bg-brand-600 text-white border-brand-600 font-semibold' : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-100'
                }`}
              >
                Fokus Kiri
              </button>
              <button
                type="button"
                onClick={() => updatePosition(80, 50)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                  posX >= 70 ? 'bg-brand-600 text-white border-brand-600 font-semibold' : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-100'
                }`}
              >
                Fokus Kanan
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-3.5 rounded-xl border border-brand-200">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-brand-900">
                  <span>Posisi Vertikal (Atas - Bawah)</span>
                  <span className="text-brand-600">{posY}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-wet shrink-0">Atas (0%)</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={posY}
                    onChange={(e) => updatePosition(posX, Number(e.target.value))}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-wet shrink-0">Bawah (100%)</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-brand-900">
                  <span>Posisi Horizontal (Kiri - Kanan)</span>
                  <span className="text-brand-600">{posX}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-wet shrink-0">Kiri (0%)</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={posX}
                    onChange={(e) => updatePosition(Number(e.target.value), posY)}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-wet shrink-0">Kanan (100%)</span>
                </div>
              </div>
            </div>

            <div className="mt-1 flex flex-col items-center">
              <div className="w-full max-w-md flex items-center justify-between text-[11px] font-semibold text-slate-wet mb-1.5 px-1">
                <span>Live Preview Kartu Beranda (Rasio 4:3):</span>
                <span className="text-brand-600 font-bold">Tahan & Geser mouse pada foto untuk menggeser</span>
              </div>

              <div
                ref={previewRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="w-full max-w-md aspect-[4/3] rounded-xl overflow-hidden border-2 border-brand-300 bg-slate-900 shadow-md relative cursor-grab active:cursor-grabbing select-none touch-none"
              >
                <div className="absolute inset-0 grid grid-cols-2 pointer-events-none">
                  <div className="relative overflow-hidden border-r-2 border-white">
                    {featuredSlotData.before_url ? (
                      <img
                        src={featuredSlotData.before_url}
                        alt="Preview Sebelum"
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-none"
                        style={{ objectPosition: `${posX}% ${posY}%` }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-white/70 bg-slate-800">
                        Belum ada foto sebelum
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 h-6 bg-black/60 text-center text-[10px] text-white font-bold uppercase tracking-wider flex items-center justify-center">
                      Sebelum
                    </div>
                  </div>

                  <div className="relative overflow-hidden">
                    {featuredSlotData.after_url ? (
                      <img
                        src={featuredSlotData.after_url}
                        alt="Preview Sesudah"
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-none"
                        style={{ objectPosition: `${posX}% ${posY}%` }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-white/70 bg-slate-800">
                        Belum ada foto sesudah
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 h-6 bg-brand-600/80 text-center text-[10px] text-white font-bold uppercase tracking-wider flex items-center justify-center">
                      Sesudah
                    </div>
                  </div>
                </div>

                <div
                  className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none border-2 border-accent-gold rounded-full shadow-md flex items-center justify-center bg-black/40 z-20"
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                >
                  <div className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
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
        </div>
      </form>
    </Card>
  </div>
  );
}
