import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Save, 
  CheckCircle2, 
  Crop, 
  Move, 
  Copy, 
  RotateCcw, 
  X, 
  ZoomIn, 
  ZoomOut, 
  Check 
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ImageUploader } from '../../components/common/ImageUploader';
import { uploadImage } from '../../lib/cloudinary';
import { useToast } from '../../context/ToastContext';
import { galleryApi, servicesApi } from '../../lib/api';
import { parseFraming, getImageFramingStyle } from '../../lib/framing';

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
    { slot: 1, label: 'Sudut Depan / Upper', before_url: '', after_url: '', framing_before: null, framing_after: null, before_file: null, after_file: null },
    { slot: 2, label: 'Sudut Samping Luar', before_url: '', after_url: '', framing_before: null, framing_after: null, before_file: null, after_file: null },
    { slot: 3, label: 'Sudut Samping Dalam', before_url: '', after_url: '', framing_before: null, framing_after: null, before_file: null, after_file: null },
    { slot: 4, label: 'Sudut Belakang / Sol', before_url: '', after_url: '', framing_before: null, framing_after: null, before_file: null, after_file: null }
  ]);

  const [slotFramings, setSlotFramings] = useState({
    1: { before: { zoom: 1, x: 0, y: 0 }, after: { zoom: 1, x: 0, y: 0 } },
    2: { before: { zoom: 1, x: 0, y: 0 }, after: { zoom: 1, x: 0, y: 0 } },
    3: { before: { zoom: 1, x: 0, y: 0 }, after: { zoom: 1, x: 0, y: 0 } },
    4: { before: { zoom: 1, x: 0, y: 0 }, after: { zoom: 1, x: 0, y: 0 } }
  });

  const [featuredSlot, setFeaturedSlot] = useState(1);
  const [previewMode, setPreviewMode] = useState('split');
  const [isFrameModalOpen, setIsFrameModalOpen] = useState(false);
  const [modalSlot, setModalSlot] = useState(1);
  const [activeTarget, setActiveTarget] = useState('after');
  const [isFrameDragging, setIsFrameDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const frameViewportRef = useRef(null);

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
              { slot: 1, label: 'Sudut Depan / Upper', before_url: '', after_url: '', framing_before: null, framing_after: null, before_file: null, after_file: null },
              { slot: 2, label: 'Sudut Samping Luar', before_url: '', after_url: '', framing_before: null, framing_after: null, before_file: null, after_file: null },
              { slot: 3, label: 'Sudut Samping Dalam', before_url: '', after_url: '', framing_before: null, framing_after: null, before_file: null, after_file: null },
              { slot: 4, label: 'Sudut Belakang / Sol', before_url: '', after_url: '', framing_before: null, framing_after: null, before_file: null, after_file: null }
            ];

            if (found.slots && found.slots.length > 0) {
              loadedSlots = loadedSlots.map(def => {
                const match = found.slots.find(s => s.slot === def.slot);
                return match ? { ...def, ...match } : def;
              });
            } else {
              loadedSlots[0].before_url = found.before_url || '';
              loadedSlots[0].after_url = found.after_url || '';
              loadedSlots[0].framing_before = found.framing_before || null;
              loadedSlots[0].framing_after = found.framing_after || null;
            }

            setSlots(loadedSlots);

            const initialFramings = {};
            loadedSlots.forEach(s => {
              initialFramings[s.slot] = {
                before: parseFraming(s.framing_before || found.framing_before),
                after: parseFraming(s.framing_after || found.framing_after)
              };
            });
            setSlotFramings(initialFramings);

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

  const handleSlotPhotoChange = (slotNum, kind, url, file = null) => {
    const fileKey = kind === 'before_url' ? 'before_file' : 'after_file';
    setSlots(prev => {
      const updated = prev.map(s => {
        if (s.slot === slotNum) {
          return { ...s, [kind]: url, [fileKey]: file };
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

  const openFrameModal = (targetSlot = activeSlot, initialTarget = 'after') => {
    const hasAnyPhoto = slots.some(s => s.before_url || s.after_url);
    if (!hasAnyPhoto) {
      showToast('Silakan unggah foto terlebih dahulu sebelum mengatur frame crop.', 'danger');
      return;
    }
    setModalSlot(targetSlot);
    setActiveTarget(initialTarget);
    setIsFrameModalOpen(true);
  };

  const closeFrameModal = () => {
    setIsFrameModalOpen(false);
  };

  const currentModalSlotFraming = slotFramings[modalSlot] || {
    before: { zoom: 1, x: 0, y: 0 },
    after: { zoom: 1, x: 0, y: 0 }
  };

  const activeFraming = currentModalSlotFraming?.[activeTarget] || { zoom: 1, x: 0, y: 0 };

  const updateActiveFraming = (updates) => {
    setSlotFramings(prev => {
      const slotData = prev[modalSlot] || {
        before: { zoom: 1, x: 0, y: 0 },
        after: { zoom: 1, x: 0, y: 0 }
      };
      const targetData = slotData[activeTarget] || { zoom: 1, x: 0, y: 0 };
      return {
        ...prev,
        [modalSlot]: {
          ...slotData,
          [activeTarget]: {
            ...targetData,
            ...updates
          }
        }
      };
    });
  };

  const handlePointerDownFrame = (e) => {
    setIsFrameDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMoveFrame = (e) => {
    if (!isFrameDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    const currentZoom = activeFraming?.zoom || 1;
    const currentX = activeFraming?.x || 0;
    const currentY = activeFraming?.y || 0;
    const stepFactor = 0.28 / currentZoom;
    const newX = Math.max(-100, Math.min(100, currentX + dx * stepFactor));
    const newY = Math.max(-100, Math.min(100, currentY + dy * stepFactor));

    updateActiveFraming({ x: Number(newX.toFixed(1)), y: Number(newY.toFixed(1)) });
  };

  const handlePointerUpFrame = (e) => {
    setIsFrameDragging(false);
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  const handleWheelZoom = (e) => {
    e.preventDefault();
    const currentZoom = activeFraming?.zoom || 1;
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    const newZoom = Math.max(1, Math.min(3.5, currentZoom + delta));
    updateActiveFraming({ zoom: Number(newZoom.toFixed(2)) });
  };

  const handleZoomSlider = (val) => {
    updateActiveFraming({ zoom: Math.max(1, Math.min(3.5, Number(val))) });
  };

  const handleResetFraming = () => {
    updateActiveFraming({ zoom: 1, x: 0, y: 0 });
  };

  const handleCopyFromOther = () => {
    const sourceTarget = activeTarget === 'before' ? 'after' : 'before';
    const sourceData = currentModalSlotFraming?.[sourceTarget] || { zoom: 1, x: 0, y: 0 };
    updateActiveFraming({
      zoom: sourceData.zoom || 1,
      x: sourceData.x || 0,
      y: sourceData.y || 0
    });
    showToast(`Frame disalin dari foto ${sourceTarget === 'before' ? 'Sesudah' : 'Sebelum'}`);
  };

  const handleApplyFrame = () => {
    setSlots(prev => prev.map(s => {
      const sF = slotFramings[s.slot];
      if (!sF) return s;
      return {
        ...s,
        framing_before: sF.before,
        framing_after: sF.after
      };
    }));
    setIsFrameModalOpen(false);
    showToast('Frame crop berhasil diterapkan ke formulir.');
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

    try {
      const updatedSlots = await Promise.all(
        slots.map(async (s) => {
          let beforeUrl = s.before_url;
          let afterUrl = s.after_url;

          if (s.before_file) {
            beforeUrl = await uploadImage(s.before_file);
          }
          if (s.after_file) {
            afterUrl = await uploadImage(s.after_file);
          }

          const sF = slotFramings[s.slot] || {
            before: s.framing_before || { zoom: 1, x: 0, y: 0 },
            after: s.framing_after || { zoom: 1, x: 0, y: 0 }
          };

          return {
            slot: s.slot,
            label: s.label,
            before_url: beforeUrl || '',
            after_url: afterUrl || '',
            framing_before: sF.before,
            framing_after: sF.after
          };
        })
      );

      const chosen = updatedSlots.find(s => s.slot === featuredSlot) || updatedSlots.find(s => s.before_url && s.after_url) || updatedSlots[0];
      const featuredFraming = slotFramings[featuredSlot] || {
        before: chosen.framing_before || { zoom: 1, x: 0, y: 0 },
        after: chosen.framing_after || { zoom: 1, x: 0, y: 0 }
      };

      const posXVal = Math.round(50 + (featuredFraming.after?.x || 0));
      const posYVal = Math.round(50 + (featuredFraming.after?.y || 0));

      const payload = {
        ...formData,
        featured_slot: featuredSlot,
        before_url: chosen.before_url || formData.before_url,
        after_url: chosen.after_url || formData.after_url,
        framing_before: featuredFraming.before,
        framing_after: featuredFraming.after,
        pos_x: posXVal,
        pos_y: posYVal,
        object_position: `${posXVal}% ${posYVal}%`,
        slots: updatedSlots
      };

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
  const currentFeaturedFraming = slotFramings[featuredSlot] || {
    before: { zoom: 1, x: 0, y: 0 },
    after: { zoom: 1, x: 0, y: 0 }
  };

  const modalSlotData = slots.find(s => s.slot === modalSlot) || slots[0];
  const modalImgSrc = activeTarget === 'before' ? (modalSlotData?.before_url || '') : (modalSlotData?.after_url || '');

  return (
    <div className="w-full">
      <Card noPadding rounded="2xl" className="border-slate-200/80 bg-white shadow-xs w-full overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                to="/admin/gallery"
                className="w-9 h-9 rounded-md border border-slate-200/90 text-slate-600 hover:text-brand-900 hover:bg-white flex items-center justify-center transition-colors shadow-2xs shrink-0"
                aria-label="Kembali"
                title="Kembali"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>

              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold font-display text-brand-900 tracking-tight truncate">
                  {isEdit ? 'Edit Galeri Before-After' : 'Tambah Foto Before-After'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">
                  {isEdit ? 'Perbarui dokumentasi foto dan framing crop sepatu.' : 'Unggah foto sebelum dan sesudah treatment untuk katalog portofolio.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => openFrameModal(activeSlot, 'after')}
                className="flex items-center gap-1.5 rounded-md shadow-xs"
                title="Atur framing zoom dan posisi crop 4:3"
              >
                <Crop className="w-4 h-4 text-brand-600" />
                <span className="hidden sm:inline">Atur Frame Crop</span>
                <span className="sm:hidden">Frame Crop</span>
              </Button>

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

                    <div className="pt-2 border-t border-brand-200/60 flex items-center justify-between gap-1 flex-wrap">
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
                        onClick={(e) => {
                          e.stopPropagation();
                          openFrameModal(angle.slot, 'after');
                        }}
                        className="text-[11px] font-semibold text-brand-600 hover:text-brand-900 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-brand-50 transition-colors cursor-pointer"
                        title="Atur framing zoom dan posisi crop untuk sudut ini"
                      >
                        <Crop className="w-3 h-3" />
                        <span>Frame Crop</span>
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
              <div className="flex items-center justify-between border-b border-brand-200/60 pb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-brand-900">
                    Upload Foto Sudut #{activeSlot}: {currentAngle.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => openFrameModal(activeSlot, 'after')}
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-900 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-brand-200 shadow-2xs hover:bg-brand-50 transition-colors cursor-pointer"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    <span>Atur Frame Sudut #{activeSlot}</span>
                  </button>
                </div>
                <span className="text-[11px] text-slate-wet">
                  Status: {currentSlotData.before_url && currentSlotData.after_url ? 'Lengkap Sebelum & Sesudah' : 'Belum Lengkap'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUploader
                  value={currentSlotData.before_url}
                  onChange={(url, file) => handleSlotPhotoChange(activeSlot, 'before_url', url, file)}
                  onRemove={() => handleSlotPhotoChange(activeSlot, 'before_url', '', null)}
                  label={`Foto Sebelum (Before) - Sudut #${activeSlot}`}
                />
                <ImageUploader
                  value={currentSlotData.after_url}
                  onChange={(url, file) => handleSlotPhotoChange(activeSlot, 'after_url', url, file)}
                  onRemove={() => handleSlotPhotoChange(activeSlot, 'after_url', '', null)}
                  label={`Foto Sesudah (After) - Sudut #${activeSlot}`}
                />
              </div>
            </div>

            <div className="p-5 bg-brand-light/40 border border-brand-200/80 rounded-xl flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-200/60 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-brand-900 uppercase tracking-wide flex items-center gap-1.5">
                    <span>2. Preview Framing & Crop (Tampilan Beranda 4:3)</span>
                    <span className="px-2 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-bold">
                      Sudut #{featuredSlot}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-wet mt-0.5">
                    Hasil tampilan kartu 4:3 dengan posisi pan dan zoom crop yang disesuaikan.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => openFrameModal(featuredSlot, 'after')}
                    className="flex items-center gap-1.5 shadow-xs"
                  >
                    <Crop className="w-4 h-4 text-brand-600" />
                    <span>Buka Atur Frame Crop</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-brand-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('split')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                      previewMode === 'split' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:text-brand-900'
                    }`}
                  >
                    Berdampingan (Split)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('before')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                      previewMode === 'before' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:text-brand-900'
                    }`}
                  >
                    Sebelum Saja
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('after')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                      previewMode === 'after' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:text-brand-900'
                    }`}
                  >
                    Sesudah Saja
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600 bg-white px-2.5 py-1 rounded-md border border-brand-200">
                  <span>Zoom: {(currentFeaturedFraming.after?.zoom || 1).toFixed(2)}x</span>
                  <span>•</span>
                  <span>X: {currentFeaturedFraming.after?.x || 0}%</span>
                  <span>•</span>
                  <span>Y: {currentFeaturedFraming.after?.y || 0}%</span>
                </div>
              </div>

              <div className="mt-1 flex flex-col items-center">
                <div
                  onClick={() => openFrameModal(featuredSlot, 'after')}
                  className="w-full max-w-md aspect-[4/3] rounded-xl overflow-hidden border-2 border-brand-300 bg-slate-900 shadow-md relative cursor-pointer group select-none"
                  title="Klik untuk membuka editor framing crop"
                >
                  {previewMode === 'split' ? (
                    <div className="absolute inset-0 grid grid-cols-2 pointer-events-none">
                      <div className="relative overflow-hidden border-r border-white/50">
                        {featuredSlotData.before_url ? (
                          <img
                            src={featuredSlotData.before_url}
                            alt="Preview Sebelum"
                            className="absolute inset-0 w-full h-full object-cover transition-none"
                            style={getImageFramingStyle({ framing_before: currentFeaturedFraming.before }, 'before')}
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
                            className="absolute inset-0 w-full h-full object-cover transition-none"
                            style={getImageFramingStyle({ framing_after: currentFeaturedFraming.after }, 'after')}
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
                  ) : previewMode === 'before' ? (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {featuredSlotData.before_url ? (
                        <img
                          src={featuredSlotData.before_url}
                          alt="Preview Sebelum"
                          className="absolute inset-0 w-full h-full object-cover transition-none"
                          style={getImageFramingStyle({ framing_before: currentFeaturedFraming.before }, 'before')}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-white/70 bg-slate-800">
                          Belum ada foto sebelum
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 h-6 bg-black/60 text-center text-[10px] text-white font-bold uppercase tracking-wider flex items-center justify-center">
                        Sebelum (Sudut #{featuredSlot})
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {featuredSlotData.after_url ? (
                        <img
                          src={featuredSlotData.after_url}
                          alt="Preview Sesudah"
                          className="absolute inset-0 w-full h-full object-cover transition-none"
                          style={getImageFramingStyle({ framing_after: currentFeaturedFraming.after }, 'after')}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-white/70 bg-slate-800">
                          Belum ada foto sesudah
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 h-6 bg-brand-600/80 text-center text-[10px] text-white font-bold uppercase tracking-wider flex items-center justify-center">
                        Sesudah (Sudut #{featuredSlot})
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-brand-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold pointer-events-none">
                    <Crop className="w-4 h-4" />
                    <span>Klik untuk Mengatur Frame Crop</span>
                  </div>
                </div>

                <span className="text-[11px] text-slate-500 mt-2 text-center">
                  Klik preview atau tombol "Buka Atur Frame Crop" untuk menggeser posisi dan zoom foto secara presisi.
                </span>
              </div>
            </div>

            <div className="border-t border-brand-200/80 pt-4 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-brand-900 uppercase tracking-wide">
                3. Informasi Sepatu & Pesanan
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

      {isFrameModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm p-3 sm:p-5 flex items-center justify-center animate-in fade-in duration-150 overflow-y-auto"
          onClick={closeFrameModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col border border-brand-200 max-h-[94vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-200/80 bg-slate-50 shrink-0">
              <div className="min-w-0 pr-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 block">
                  Atur Frame & Zoom Per Foto (Display 4:3)
                </span>
                <h3 className="text-sm sm:text-base font-bold text-brand-900 truncate">
                  {formData.caption || formData.shoe_brand || 'Frame Crop Foto Galeri'}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeFrameModal}
                className="w-8 h-8 rounded-md bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-brand-900">
                  1. Pilih Sudut Dokumentasi:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ANGLE_SLOTS.map((angle) => {
                    const sData = slots.find(s => s.slot === angle.slot) || { before_url: '', after_url: '' };
                    const isChosen = modalSlot === angle.slot;
                    const previewThumb = sData.after_url || sData.before_url;

                    return (
                      <button
                        key={angle.slot}
                        type="button"
                        onClick={() => setModalSlot(angle.slot)}
                        className={`p-2 rounded-md border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                          isChosen
                            ? 'border-brand-600 bg-brand-50/80 ring-2 ring-brand-600/30'
                            : 'border-brand-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-full aspect-[4/3] rounded-sm overflow-hidden relative bg-slate-100 border border-brand-200/60">
                          {previewThumb ? (
                            <img
                              src={previewThumb}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                              Kosong
                            </div>
                          )}
                          {isChosen && (
                            <div className="absolute top-1 right-1 bg-brand-600 text-white rounded-full p-0.5 shadow-xs">
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-brand-900 truncate">
                          Sudut #{angle.slot}
                        </span>
                        <span className="text-[10px] text-slate-wet truncate">
                          {angle.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-brand-900">
                  2. Pilih Foto yang Ingin Diframe:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTarget('before')}
                    className={`p-2.5 rounded-md border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      activeTarget === 'before'
                        ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/30'
                        : 'border-brand-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                      <div className="text-left min-w-0">
                        <span className="text-xs font-bold text-brand-900 block truncate">
                          Foto Sebelum
                        </span>
                        <span className="text-[10px] text-slate-wet block truncate font-mono">
                          Zoom: {(currentModalSlotFraming?.before?.zoom || 1).toFixed(2)}x
                        </span>
                      </div>
                    </div>
                    {activeTarget === 'before' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white shrink-0">
                        Aktif
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTarget('after')}
                    className={`p-2.5 rounded-md border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      activeTarget === 'after'
                        ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-600/30'
                        : 'border-brand-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-600 shrink-0" />
                      <div className="text-left min-w-0">
                        <span className="text-xs font-bold text-brand-900 block truncate">
                          Foto Sesudah
                        </span>
                        <span className="text-[10px] text-slate-wet block truncate font-mono">
                          Zoom: {(currentModalSlotFraming?.after?.zoom || 1).toFixed(2)}x
                        </span>
                      </div>
                    </div>
                    {activeTarget === 'after' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-600 text-white shrink-0">
                        Aktif
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-brand-600" />
                    <span>Geser & Zoom Foto dalam Frame 4:3:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyFromOther}
                      className="text-[11px] font-semibold text-brand-600 hover:text-brand-900 flex items-center gap-1 cursor-pointer"
                      title="Salin frame dari foto lainnya"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Salin dari {activeTarget === 'before' ? 'Sesudah' : 'Sebelum'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetFraming}
                      className="text-[11px] font-semibold text-slate-wet hover:text-danger flex items-center gap-1 cursor-pointer"
                      title="Kembalikan posisi & zoom default"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                <div
                  ref={frameViewportRef}
                  onPointerDown={handlePointerDownFrame}
                  onPointerMove={handlePointerMoveFrame}
                  onPointerUp={handlePointerUpFrame}
                  onPointerCancel={handlePointerUpFrame}
                  onWheel={handleWheelZoom}
                  className="relative w-full max-w-sm sm:max-w-md aspect-[4/3] mx-auto rounded-lg overflow-hidden bg-slate-950 border-2 border-brand-500 shadow-md cursor-grab active:cursor-grabbing select-none touch-none"
                >
                  {modalImgSrc ? (
                    <img
                      src={modalImgSrc}
                      alt="Framing preview"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      style={{
                        transform: `translate(${activeFraming?.x || 0}%, ${activeFraming?.y || 0}%) scale(${activeFraming?.zoom || 1})`,
                        transformOrigin: 'center center'
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                      Foto belum diunggah untuk sudut ini
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold uppercase">
                    {activeTarget === 'before' ? 'Sebelum' : 'Sesudah'} (Sudut #{modalSlot})
                  </div>
                </div>

                <div className="flex items-center gap-3 max-w-sm sm:max-w-md mx-auto w-full pt-1">
                  <ZoomOut className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="range"
                    min="1"
                    max="3.5"
                    step="0.05"
                    value={activeFraming?.zoom || 1}
                    onChange={(e) => handleZoomSlider(e.target.value)}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                  <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs font-mono font-bold text-brand-900 w-12 text-right shrink-0">
                    {(activeFraming?.zoom || 1).toFixed(2)}x
                  </span>
                </div>

                <span className="text-[11px] text-slate-500 text-center">
                  Tahan & geser mouse langsung pada foto di atas untuk memposisikan. Scroll roda mouse atau slider untuk zoom.
                </span>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-brand-200/80 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={closeFrameModal}
              >
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApplyFrame}
              >
                Terapkan Frame
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
