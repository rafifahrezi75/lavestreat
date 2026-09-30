import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  Pencil,
  Trash2,
  Crop,
  Receipt,
  User,
  ExternalLink,
  Layers,
  X,
  CheckCircle2,
  RotateCcw,
  Copy,
  Move,
  Maximize2
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useToast } from '../../context/ToastContext';
import { galleryApi } from '../../lib/api';
import { parseFraming, getImageFramingStyle } from '../../lib/framing';

const ANGLE_LABELS = {
  1: 'Sudut Depan / Upper',
  2: 'Sudut Samping Luar',
  3: 'Sudut Samping Dalam',
  4: 'Sudut Belakang / Sol'
};

export function GalleryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState('split');
  const [activeFullPhoto, setActiveFullPhoto] = useState(null);

  const [isFrameModalOpen, setIsFrameModalOpen] = useState(false);
  const [modalSlot, setModalSlot] = useState(1);
  const [activeTarget, setActiveTarget] = useState('before');
  const [slotFramings, setSlotFramings] = useState({});
  const [modalHome, setModalHome] = useState(true);
  const [isSavingFrame, setIsSavingFrame] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const frameViewportRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveFullPhoto(null);
      }
    };
    if (activeFullPhoto) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFullPhoto]);

  useEffect(() => {
    let isMounted = true;
    async function loadItem() {
      try {
        setLoading(true);
        if (!id) {
          if (isMounted) setItem(null);
          return;
        }

        const decodedId = decodeURIComponent(String(id).trim());
        let found = await galleryApi.getGalleryItemById(decodedId);

        if (!found) {
          const allItems = await galleryApi.getGallery(false);
          found = allItems.find(
            g => String(g.id) === decodedId ||
                 String(g.item_id) === decodedId ||
                 String(g.order_id) === decodedId ||
                 String(g.invoice) === decodedId ||
                 String(g.invoice_number) === decodedId
          ) || null;
        }

        if (isMounted) {
          setItem(found || null);
          if (found) {
            const featIndex = (found.slots || []).findIndex(s => s.slot === (found.featured_slot || 1));
            setSelectedSlotIndex(featIndex >= 0 ? featIndex : 0);
          }
        }
      } catch {
        if (isMounted) {
          setItem(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadItem();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const rawSlots = item?.slots && item.slots.length > 0
    ? item.slots
    : (item ? [{
        slot: 1,
        label: ANGLE_LABELS[1],
        before_url: item.before_url,
        after_url: item.after_url,
        framing_before: item.framing_before,
        framing_after: item.framing_after
      }] : []);

  const safeIndex = (selectedSlotIndex >= 0 && selectedSlotIndex < rawSlots.length) ? selectedSlotIndex : 0;
  const activeSlotData = rawSlots[safeIndex] || {};
  const activeSlotNumber = activeSlotData.slot || (safeIndex + 1);
  const isCurrentSlotFeatured = item && (item.featured_slot || 1) === activeSlotNumber;

  const handleToggleHome = async () => {
    if (!item) return;
    try {
      const nextVal = !item.tampil_di_home;
      await galleryApi.updateGalleryItem(item.id, { tampil_di_home: nextVal });
      setItem(prev => ({ ...prev, tampil_di_home: nextVal }));
      showToast(nextVal ? 'Galeri ditampilkan di Beranda.' : 'Galeri disembunyikan dari Beranda.');
    } catch (err) {
      showToast('Gagal mengubah status: ' + (err.message || ''), 'danger');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Yakin ingin menghapus foto galeri ini? Riwayat foto tidak dapat dikembalikan.')) {
      return;
    }
    try {
      setIsDeleting(true);
      await galleryApi.deleteGalleryItem(item.id);
      showToast('Foto galeri berhasil dihapus.');
      navigate('/admin/gallery');
    } catch (err) {
      showToast('Gagal menghapus galeri: ' + (err.message || ''), 'danger');
    } finally {
      setIsDeleting(false);
    }
  };

  const openFrameModal = () => {
    if (!item) return;
    const initialMap = {};
    rawSlots.forEach(s => {
      initialMap[s.slot] = {
        before: parseFraming(s.framing_before || item.framing_before),
        after: parseFraming(s.framing_after || item.framing_after)
      };
    });
    setSlotFramings(initialMap);
    setModalSlot(activeSlotNumber);
    setActiveTarget('before');
    setModalHome(item.tampil_di_home !== false);
    setIsFrameModalOpen(true);
  };

  const closeFrameModal = () => {
    setIsFrameModalOpen(false);
  };

  const currentSlotFraming = slotFramings[modalSlot] || {
    before: { zoom: 1, x: 0, y: 0 },
    after: { zoom: 1, x: 0, y: 0 }
  };

  const activeFraming = currentSlotFraming?.[activeTarget] || { zoom: 1, x: 0, y: 0 };

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

  const handlePointerDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
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

  const handlePointerUp = (e) => {
    setIsDragging(false);
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

  const handleResetFraming = () => {
    updateActiveFraming({ zoom: 1, x: 0, y: 0 });
  };

  const handleCopyFromOther = () => {
    const sourceTarget = activeTarget === 'before' ? 'after' : 'before';
    const sourceData = currentSlotFraming?.[sourceTarget] || { zoom: 1, x: 0, y: 0 };
    updateActiveFraming({
      zoom: sourceData.zoom || 1,
      x: sourceData.x || 0,
      y: sourceData.y || 0
    });
    showToast(`Frame disalin dari foto ${sourceTarget === 'before' ? 'Sesudah' : 'Sebelum'}`);
  };

  const handleSaveFrame = async () => {
    if (!item) return;
    try {
      setIsSavingFrame(true);

      const updatedSlots = rawSlots.map(s => {
        const slotF = slotFramings[s.slot];
        if (!slotF) return s;
        return {
          ...s,
          framing_before: slotF.before,
          framing_after: slotF.after
        };
      });

      const featuredSlotNum = item.featured_slot || 1;
      const featuredSlotF = slotFramings[featuredSlotNum] || slotFramings[1] || {
        before: { zoom: 1, x: 0, y: 0 },
        after: { zoom: 1, x: 0, y: 0 }
      };

      const payload = {
        slots: updatedSlots,
        framing_before: featuredSlotF.before,
        framing_after: featuredSlotF.after,
        tampil_di_home: modalHome
      };

      await galleryApi.updateGalleryItem(item.id, payload);
      showToast('Frame foto berhasil disimpan.');
      setItem(prev => ({ ...prev, ...payload }));
      closeFrameModal();
    } catch (err) {
      showToast('Gagal menyimpan frame foto: ' + (err.message || ''), 'danger');
    } finally {
      setIsSavingFrame(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-5 w-full">
        <div className="h-9 w-48 bg-slate-200 rounded-md animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
          <div className="lg:col-span-8 aspect-[4/3] bg-slate-200 rounded-2xl animate-pulse" />
          <div className="lg:col-span-4 h-64 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center bg-white rounded-2xl border border-slate-200 shadow-xs p-8">
        <h2 className="text-lg font-bold text-brand-900">Galeri Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">Foto dokumentasi mungkin telah dihapus atau ID tidak sesuai.</p>
        <Link to="/admin/gallery">
          <Button size="sm" variant="secondary">
            Kembali ke Kelola Galeri
          </Button>
        </Link>
      </div>
    );
  }

  const invoiceNum = item.invoice_number || item.invoice || item.order_id || 'Tiket Pesanan';
  const custName = item.customer_name || (typeof item.pelanggan === 'string' ? item.pelanggan : item.pelanggan?.nama) || 'Pelanggan Workshop';
  const displayTitle = item.caption || item.shoe_brand || 'Dokumentasi Restorasi Sepatu';
  const modalSlotData = rawSlots.find(s => s.slot === modalSlot) || rawSlots[0] || {};
  const previewImgSrc = activeTarget === 'before' ? (modalSlotData?.before_url || '') : (modalSlotData?.after_url || '');

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/gallery"
            className="w-9 h-9 rounded-md border border-slate-200/90 text-slate-600 hover:text-brand-900 hover:bg-slate-50 flex items-center justify-center transition-colors shadow-2xs"
            aria-label="Kembali ke Kelola Galeri"
            title="Kembali"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-brand-900 tracking-tight">
                {displayTitle}
              </h1>
              {item.tampil_di_home ? (
                <Badge variant="success" size="sm">Tampil di Beranda</Badge>
              ) : (
                <Badge variant="default" size="sm">Disembunyikan</Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Layanan: <strong className="text-brand-600">{item.layanan_terkait || 'Treatment'}</strong>
              {item.shoe_brand && ` • ${item.shoe_brand} ${item.shoe_type && item.shoe_type !== '-' ? item.shoe_type : ''}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleToggleHome}
            className="px-3 py-1.5 rounded-md border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            {item.tampil_di_home ? 'Sembunyikan dari Beranda' : 'Tampilkan di Beranda'}
          </button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={openFrameModal}
            className="flex items-center gap-1.5 shadow-xs"
          >
            <Crop className="w-4 h-4 text-brand-600" />
            <span>Atur Frame Crop</span>
          </Button>

          <Link to={`/admin/gallery/${item.id}/edit`}>
            <Button size="sm" className="flex items-center gap-1.5 shadow-xs">
              <Pencil className="w-4 h-4" />
              <span>Edit Form & Sudut</span>
            </Button>
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 rounded-md bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors cursor-pointer"
            title="Hapus foto galeri"
            aria-label="Hapus foto galeri"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
        <div className="lg:col-span-8 flex flex-col gap-5">
          <Card noPadding rounded="2xl" className="border-slate-200/80 bg-white shadow-xs overflow-hidden flex flex-col">
            <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-brand-900">
                  Sudut #{activeSlotNumber}: {activeSlotData.label || ANGLE_LABELS[activeSlotNumber] || ('Sudut ' + activeSlotNumber)}
                </span>
                {isCurrentSlotFeatured && (
                  <span className="px-2 py-0.5 rounded-md bg-accent-gold text-brand-900 text-[10px] font-extrabold shadow-2xs">
                    Cover Utama Beranda
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-md text-[11px] font-medium shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    viewMode === 'split' ? 'bg-white text-brand-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-brand-900'
                  }`}
                >
                  Berdampingan
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('before')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    viewMode === 'before' ? 'bg-white text-brand-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-brand-900'
                  }`}
                >
                  Sebelum Saja
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('after')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    viewMode === 'after' ? 'bg-white text-brand-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-brand-900'
                  }`}
                >
                  Sesudah Saja
                </button>
              </div>
            </div>

            <div className="relative w-full aspect-[4/3] bg-slate-950 overflow-hidden">
              {viewMode === 'split' && (
                <div className="absolute inset-0 grid grid-cols-2">
                  <div className="relative h-full overflow-hidden border-r-2 border-white bg-slate-900 group">
                    {activeSlotData.before_url ? (
                      <img
                        src={activeSlotData.before_url}
                        alt="Sebelum"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={getImageFramingStyle(activeSlotData, 'before')}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                        Foto sebelum belum diunggah
                      </div>
                    )}

                    {activeSlotData.before_url && (
                      <button
                        type="button"
                        onClick={() => setActiveFullPhoto({
                          url: activeSlotData.before_url,
                          type: 'Sebelum',
                          angleLabel: activeSlotData.label || ANGLE_LABELS[activeSlotNumber] || `Sudut #${activeSlotNumber}`,
                          style: getImageFramingStyle(activeSlotData, 'before')
                        })}
                        className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 hover:bg-black/85 text-white text-[10px] font-semibold backdrop-blur-xs transition-colors shadow-xs cursor-pointer border border-white/20"
                        title="Lihat foto Sebelum satu foto penuh"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Lihat Penuh</span>
                      </button>
                    )}

                    <div className="absolute bottom-0 inset-x-0 h-7 bg-black/60 backdrop-blur-xs text-center z-10 flex items-center justify-center">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                        Sebelum
                      </span>
                    </div>
                  </div>

                  <div className="relative h-full overflow-hidden bg-slate-900 group">
                    {activeSlotData.after_url ? (
                      <img
                        src={activeSlotData.after_url}
                        alt="Sesudah"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={getImageFramingStyle(activeSlotData, 'after')}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                        Foto sesudah belum diunggah
                      </div>
                    )}

                    {activeSlotData.after_url && (
                      <button
                        type="button"
                        onClick={() => setActiveFullPhoto({
                          url: activeSlotData.after_url,
                          type: 'Sesudah',
                          angleLabel: activeSlotData.label || ANGLE_LABELS[activeSlotNumber] || `Sudut #${activeSlotNumber}`,
                          style: getImageFramingStyle(activeSlotData, 'after')
                        })}
                        className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-2 py-1 rounded-md bg-brand-900/70 hover:bg-brand-900/90 text-white text-[10px] font-semibold backdrop-blur-xs transition-colors shadow-xs cursor-pointer border border-white/20"
                        title="Lihat foto Sesudah satu foto penuh"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Lihat Penuh</span>
                      </button>
                    )}

                    <div className="absolute bottom-0 inset-x-0 h-7 bg-brand-600/80 backdrop-blur-xs text-center z-10 flex items-center justify-center">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                        Sesudah
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {viewMode === 'before' && (
                <div className="absolute inset-0 bg-slate-900 relative h-full w-full overflow-hidden group">
                  {activeSlotData.before_url ? (
                    <img
                      src={activeSlotData.before_url}
                      alt="Sebelum"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={getImageFramingStyle(activeSlotData, 'before')}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                      Foto sebelum belum diunggah
                    </div>
                  )}

                  {activeSlotData.before_url && (
                    <button
                      type="button"
                      onClick={() => setActiveFullPhoto({
                        url: activeSlotData.before_url,
                        type: 'Sebelum',
                        angleLabel: activeSlotData.label || ANGLE_LABELS[activeSlotNumber] || `Sudut #${activeSlotNumber}`,
                        style: getImageFramingStyle(activeSlotData, 'before')
                      })}
                      className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 hover:bg-black/85 text-white text-[11px] font-semibold backdrop-blur-xs transition-colors shadow-xs cursor-pointer border border-white/20"
                      title="Lihat foto Sebelum satu layar penuh"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Lihat Lightbox Penuh</span>
                    </button>
                  )}

                  <div className="absolute bottom-0 inset-x-0 h-7 bg-black/60 backdrop-blur-xs text-center z-10 flex items-center justify-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                      Sebelum (Tampilan Penuh)
                    </span>
                  </div>
                </div>
              )}

              {viewMode === 'after' && (
                <div className="absolute inset-0 bg-slate-900 relative h-full w-full overflow-hidden group">
                  {activeSlotData.after_url ? (
                    <img
                      src={activeSlotData.after_url}
                      alt="Sesudah"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={getImageFramingStyle(activeSlotData, 'after')}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                      Foto sesudah belum diunggah
                    </div>
                  )}

                  {activeSlotData.after_url && (
                    <button
                      type="button"
                      onClick={() => setActiveFullPhoto({
                        url: activeSlotData.after_url,
                        type: 'Sesudah',
                        angleLabel: activeSlotData.label || ANGLE_LABELS[activeSlotNumber] || `Sudut #${activeSlotNumber}`,
                        style: getImageFramingStyle(activeSlotData, 'after')
                      })}
                      className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-900/70 hover:bg-brand-900/90 text-white text-[11px] font-semibold backdrop-blur-xs transition-colors shadow-xs cursor-pointer border border-white/20"
                      title="Lihat foto Sesudah satu layar penuh"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Lihat Lightbox Penuh</span>
                    </button>
                  )}

                  <div className="absolute bottom-0 inset-x-0 h-7 bg-brand-600/80 backdrop-blur-xs text-center z-10 flex items-center justify-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                      Sesudah (Tampilan Penuh)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {rawSlots.length > 1 && (
              <div className="p-4 border-t border-slate-100 bg-white flex flex-col gap-2.5">
                <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand-600" />
                  <span>Pilih Sudut Tampilan ({rawSlots.length} Sudut Tersedia):</span>
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {rawSlots.map((s, idx) => {
                    const isSelected = safeIndex === idx;
                    const isFeatured = (item.featured_slot || 1) === s.slot;

                    return (
                      <button
                        key={s.slot || idx}
                        type="button"
                        onClick={() => setSelectedSlotIndex(idx)}
                        className={`p-2 rounded-md border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-600/30'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-full aspect-[4/3] rounded-sm overflow-hidden relative bg-slate-100 border border-slate-200">
                          <div className="absolute inset-0 grid grid-cols-2">
                            <div className="relative h-full overflow-hidden border-r border-white">
                              {s.before_url && (
                                <img
                                  src={s.before_url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  style={getImageFramingStyle(s, 'before')}
                                />
                              )}
                            </div>
                            <div className="relative h-full overflow-hidden">
                              {s.after_url && (
                                <img
                                  src={s.after_url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  style={getImageFramingStyle(s, 'after')}
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between min-w-0">
                          <span className="text-[11px] font-bold text-brand-900 truncate">
                            Sudut #{s.slot}
                          </span>
                          {isFeatured && (
                            <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100 px-1 rounded-sm shrink-0">
                              Cover
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 truncate">
                          {s.label || ANGLE_LABELS[s.slot]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-5">
          <Card rounded="2xl" className="border-slate-200/80 bg-white shadow-xs p-5 flex flex-col gap-4">
            <h2 className="font-display font-bold text-base text-brand-900 border-b border-slate-100 pb-2">
              Informasi Sepatu & Layanan
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Merek Sepatu</span>
                <span className="font-bold text-brand-900">{item.shoe_brand || '-'}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Tipe / Model</span>
                <span className="font-semibold text-slate-800">{item.shoe_type && item.shoe_type !== '-' ? item.shoe_type : '-'}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Layanan Workshop</span>
                <span className="font-bold text-brand-600">{item.layanan_terkait || '-'}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Cover Utama Beranda</span>
                <span className="font-semibold text-brand-900">Sudut #{item.featured_slot || 1}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Total Sudut Foto</span>
                <span className="font-semibold text-slate-800">{rawSlots.length} Sudut</span>
              </div>

              <div className="flex flex-col gap-1 pt-1">
                <span className="text-slate-500 font-medium">Keterangan / Caption:</span>
                <p className="p-2.5 rounded-md bg-slate-50 text-slate-700 text-xs border border-slate-200/80 leading-relaxed font-normal">
                  {item.caption || '-'}
                </p>
              </div>
            </div>
          </Card>

          <Card rounded="2xl" className="border-slate-200/80 bg-white shadow-xs p-5 flex flex-col gap-4">
            <h2 className="font-display font-bold text-base text-brand-900 border-b border-slate-100 pb-2">
              Relasi Tiket Pesanan
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-brand-600" />
                  <span>No. Tiket</span>
                </span>
                {item.order_id ? (
                  <Link
                    to={`/admin/orders/${item.order_id}`}
                    className="font-mono text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
                  >
                    <span>{invoiceNum}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                ) : (
                  <span className="font-mono text-xs font-semibold text-slate-700">{invoiceNum}</span>
                )}
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pelanggan</span>
                </span>
                <span className="font-semibold text-brand-900">{custName}</span>
              </div>

              {item.order_id && (
                <div className="pt-2">
                  <Link
                    to={`/admin/orders/${item.order_id}`}
                    className="w-full py-2 px-3 rounded-md bg-brand-50 border border-brand-200 text-brand-900 hover:bg-brand-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <span>Buka Rincian Pesanan #{item.order_id}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

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
                  {item.caption}
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
              {rawSlots.length > 1 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-brand-900">
                    1. Pilih Sudut Dokumentasi:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {rawSlots.map((s) => {
                      const isChosen = modalSlot === s.slot;
                      return (
                        <button
                          key={s.slot}
                          type="button"
                          onClick={() => setModalSlot(s.slot)}
                          className={`p-2 rounded-md border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                            isChosen
                              ? 'border-brand-600 bg-brand-50/80 ring-2 ring-brand-600/30'
                              : 'border-brand-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-full aspect-[4/3] rounded-sm overflow-hidden relative bg-slate-100 border border-brand-200/60">
                            {s.after_url || s.before_url ? (
                              <img
                                src={s.after_url || s.before_url}
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
                            Sudut #{s.slot}
                          </span>
                          <span className="text-[10px] text-slate-wet truncate">
                            {s.label || ANGLE_LABELS[s.slot]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-brand-900">
                  {rawSlots.length > 1 ? '2.' : '1.'} Pilih Foto yang Ingin Diframe:
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
                          Zoom: {(currentSlotFraming?.before?.zoom || 1).toFixed(2)}x
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
                          Zoom: {(currentSlotFraming?.after?.zoom || 1).toFixed(2)}x
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
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onWheel={handleWheelZoom}
                  className="relative w-full max-w-sm sm:max-w-md aspect-[4/3] mx-auto rounded-lg overflow-hidden bg-slate-950 border-2 border-brand-500 shadow-md cursor-grab active:cursor-grabbing select-none touch-none"
                >
                  {previewImgSrc ? (
                    <img
                      src={previewImgSrc}
                      alt="Framing preview"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      style={{
                        transform: `translate(${activeFraming?.x || 0}%, ${activeFraming?.y || 0}%) scale(${activeFraming?.zoom || 1})`,
                        transformOrigin: 'center center'
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                      Foto belum diunggah
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold uppercase">
                    {activeTarget === 'before' ? 'Sebelum' : 'Sesudah'} (Sudut #{modalSlot})
                  </div>
                </div>

                <span className="text-[11px] text-slate-500 text-center">
                  Tahan & geser mouse langsung pada foto di atas untuk memposisikan. Scroll roda mouse untuk zoom in/out.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="detail-modal-home-check"
                  checked={modalHome}
                  onChange={(e) => setModalHome(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded-sm focus:ring-brand-600 border-brand-200 cursor-pointer"
                />
                <label htmlFor="detail-modal-home-check" className="text-xs font-semibold text-brand-900 cursor-pointer">
                  Tampilkan di halaman utama (Beranda) sebagai cover
                </label>
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
                disabled={isSavingFrame}
                onClick={handleSaveFrame}
              >
                {isSavingFrame ? 'Menyimpan...' : 'Simpan Frame'}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {activeFullPhoto && createPortal(
        <div
          className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center animate-in fade-in duration-150"
          onClick={() => setActiveFullPhoto(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 sm:p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                  activeFullPhoto.type === 'Sesudah' ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-100'
                }`}>
                  {activeFullPhoto.type}
                </span>
                <span className="text-xs sm:text-sm font-bold text-white truncate">
                  {displayTitle} • {activeFullPhoto.angleLabel}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const nextType = activeFullPhoto.type === 'Sebelum' ? 'Sesudah' : 'Sebelum';
                    const nextUrl = nextType === 'Sebelum' ? activeSlotData.before_url : activeSlotData.after_url;
                    setActiveFullPhoto({
                      url: nextUrl,
                      type: nextType,
                      angleLabel: activeSlotData.label || ANGLE_LABELS[activeSlotNumber] || `Sudut #${activeSlotNumber}`,
                      style: getImageFramingStyle(activeSlotData, nextType === 'Sebelum' ? 'before' : 'after')
                    });
                  }}
                  className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Lihat {activeFullPhoto.type === 'Sebelum' ? 'Sesudah' : 'Sebelum'}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFullPhoto(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 min-h-[50vh] max-h-[78vh] bg-slate-950 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
              {activeFullPhoto.url ? (
                <img
                  src={activeFullPhoto.url}
                  alt={activeFullPhoto.angleLabel}
                  className="max-h-[72vh] w-auto max-w-full object-contain rounded-md"
                  style={activeFullPhoto.style}
                />
              ) : (
                <span className="text-xs text-slate-400">Foto belum tersedia</span>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
