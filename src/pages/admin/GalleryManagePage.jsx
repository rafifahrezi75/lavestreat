import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Receipt, 
  User, 
  ExternalLink, 
  X, 
  CheckCircle2, 
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Layers,
  Move
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Pagination } from '../../components/common/Pagination';
import { BeforeAfterCompare } from '../../features/gallery/BeforeAfterCompare';
import { useToast } from '../../context/ToastContext';
import { galleryApi } from '../../lib/api';
import { parseFraming, getImageFramingStyle } from '../../lib/framing';

const ANGLE_LABELS = {
  1: 'Sudut Depan / Upper',
  2: 'Sudut Samping Luar',
  3: 'Sudut Samping Dalam',
  4: 'Sudut Belakang / Sol'
};

export function GalleryManagePage() {
  const { showToast } = useToast();
  const [gallery, setGallery] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 9;

  const [editingItem, setEditingItem] = useState(null);
  const [modalSlot, setModalSlot] = useState(1);
  const [activeTarget, setActiveTarget] = useState('before');
  const [slotFramings, setSlotFramings] = useState({});
  const [modalHome, setModalHome] = useState(true);
  const [isSavingFrame, setIsSavingFrame] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const frameViewportRef = useRef(null);
  const startPointerRef = useRef(null);

  const loadGallery = async () => {
    try {
      const list = await galleryApi.getGallery(false);
      setGallery(list);
    } catch {
      showToast('Gagal memuat foto galeri', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus foto galeri ini?')) return;
    try {
      await galleryApi.deleteGalleryItem(id);
      showToast('Foto galeri berhasil dihapus.');
      loadGallery();
    } catch {
      showToast('Gagal menghapus foto galeri', 'danger');
    }
  };

  const handleToggleHome = async (item) => {
    try {
      const nextStatus = !item.tampil_di_home;
      await galleryApi.updateGalleryItem(item.id, {
        ...item,
        tampil_di_home: nextStatus
      });
      showToast(nextStatus ? 'Foto ditampilkan di Beranda.' : 'Foto disembunyikan dari Beranda.');
      loadGallery();
    } catch {
      showToast('Gagal memperbarui status tampil di beranda', 'danger');
    }
  };

  const openFrameModal = (item) => {
    setEditingItem(item);
    const initialSlot = item.featured_slot || 1;
    setModalSlot(initialSlot);
    setModalHome(item.tampil_di_home !== false);
    setActiveTarget('before');

    const framings = {};
    const slotsList = (item.slots && item.slots.length > 0)
      ? item.slots
      : [{ slot: 1, label: 'Sudut #1', before_url: item.before_url, after_url: item.after_url }];

    slotsList.forEach(s => {
      const isFeat = s.slot === (item.featured_slot || 1);
      const bData = s.framing_before || (isFeat ? item.framing_before : null);
      const aData = s.framing_after || (isFeat ? item.framing_after : null);
      framings[s.slot] = {
        before: parseFraming(bData),
        after: parseFraming(aData)
      };
    });

    setSlotFramings(framings);
  };

  const closeFrameModal = () => {
    setEditingItem(null);
    setIsDragging(false);
  };

  const rawSlots = editingItem?.slots && editingItem.slots.length > 0
    ? editingItem.slots
    : (editingItem ? [{ slot: 1, label: 'Sudut #1', before_url: editingItem.before_url, after_url: editingItem.after_url }] : []);

  const currentSlotData = rawSlots.find(s => s.slot === modalSlot) || rawSlots[0] || {
    before_url: editingItem?.before_url,
    after_url: editingItem?.after_url
  };

  const currentSlotFraming = slotFramings[modalSlot] || {
    before: { zoom: 1, x: 0, y: 0 },
    after: { zoom: 1, x: 0, y: 0 }
  };

  const currentPhotoFraming = currentSlotFraming[activeTarget] || { zoom: 1, x: 0, y: 0 };
  const currentPhotoUrl = activeTarget === 'before' ? currentSlotData.before_url : currentSlotData.after_url;

  const updateCurrentFraming = (updates) => {
    setSlotFramings(prev => {
      const slotData = prev[modalSlot] || { before: { zoom: 1, x: 0, y: 0 }, after: { zoom: 1, x: 0, y: 0 } };
      return {
        ...prev,
        [modalSlot]: {
          ...slotData,
          [activeTarget]: {
            ...slotData[activeTarget],
            ...updates
          }
        }
      };
    });
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    startPointerRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialX: currentPhotoFraming.x,
      initialY: currentPhotoFraming.y
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !startPointerRef.current || !frameViewportRef.current) return;
    const rect = frameViewportRef.current.getBoundingClientRect();
    const deltaPxX = e.clientX - startPointerRef.current.clientX;
    const deltaPxY = e.clientY - startPointerRef.current.clientY;

    const deltaPercentX = (deltaPxX / rect.width) * 100;
    const deltaPercentY = (deltaPxY / rect.height) * 100;

    const newX = Math.max(-75, Math.min(75, Math.round(startPointerRef.current.initialX + deltaPercentX)));
    const newY = Math.max(-75, Math.min(75, Math.round(startPointerRef.current.initialY + deltaPercentY)));

    updateCurrentFraming({ x: newX, y: newY });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  const handleWheelZoom = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    const nextZoom = Math.max(1, Math.min(3.5, Number((currentPhotoFraming.zoom + delta).toFixed(2))));
    updateCurrentFraming({ zoom: nextZoom });
  };

  const handleZoomChange = (val) => {
    updateCurrentFraming({ zoom: Math.max(1, Math.min(3.5, Number(val))) });
  };

  const handleZoomStep = (step) => {
    const nextZoom = Math.max(1, Math.min(3.5, Number((currentPhotoFraming.zoom + step).toFixed(2))));
    updateCurrentFraming({ zoom: nextZoom });
  };

  const handleResetFraming = () => {
    updateCurrentFraming({ zoom: 1, x: 0, y: 0 });
  };

  const handleCopyFromOther = () => {
    const otherTarget = activeTarget === 'before' ? 'after' : 'before';
    const otherData = currentSlotFraming[otherTarget];
    if (otherData) {
      updateCurrentFraming({ ...otherData });
      showToast(`Frame disalin dari Foto ${otherTarget === 'before' ? 'Sebelum' : 'Sesudah'}`);
    }
  };

  const handleSaveFrameModal = async () => {
    if (!editingItem) return;
    setIsSavingFrame(true);

    try {
      const updatedSlots = rawSlots.map(s => {
        const sFraming = slotFramings[s.slot] || { before: { zoom: 1, x: 0, y: 0 }, after: { zoom: 1, x: 0, y: 0 } };
        return {
          ...s,
          framing_before: sFraming.before,
          framing_after: sFraming.after
        };
      });

      const chosenSlotData = updatedSlots.find(s => s.slot === modalSlot) || updatedSlots[0];
      const bFraming = chosenSlotData.framing_before || { zoom: 1, x: 0, y: 0 };
      const aFraming = chosenSlotData.framing_after || { zoom: 1, x: 0, y: 0 };

      const payload = {
        ...editingItem,
        featured_slot: modalSlot,
        before_url: chosenSlotData.before_url || editingItem.before_url,
        after_url: chosenSlotData.after_url || editingItem.after_url,
        framing_before: bFraming,
        framing_after: aFraming,
        slots: updatedSlots,
        tampil_di_home: modalHome,
        pos_x: Math.round(50 + aFraming.x),
        pos_y: Math.round(50 + aFraming.y),
        object_position: `${Math.round(50 + aFraming.x)}% ${Math.round(50 + aFraming.y)}%`
      };

      await galleryApi.updateGalleryItem(editingItem.id, payload);
      showToast('Frame foto berhasil disimpan.');
      setGallery(prev => prev.map(g => g.id === editingItem.id ? { ...g, ...payload } : g));
      closeFrameModal();
    } catch (err) {
      showToast('Gagal menyimpan frame foto: ' + (err.message || ''), 'danger');
    } finally {
      setIsSavingFrame(false);
    }
  };

  const totalPages = Math.ceil(gallery.length / pageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedGallery = gallery.slice((validCurrentPage - 1) * pageSize, validCurrentPage * pageSize);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-slate-wet">
          Kelola hasil foto before-after, sudut cover yang tampil di Beranda, dan framing posisi crop sepatu.
        </p>

        <Link to="/admin/gallery/new">
          <Button size="sm" className="flex items-center gap-1.5 shrink-0">
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Before-After</span>
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-wet text-xs">Memuat galeri...</div>
      ) : gallery.length === 0 ? (
        <Card className="text-center py-12 text-slate-wet border-brand-200 text-xs">
          Belum ada foto galeri tersimpan. Klik tombol di atas untuk menambahkan.
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
            {paginatedGallery.map((item) => {
              const invoiceNum = item.invoice_number || item.invoice || item.order_id || 'Tiket Pesanan';
              const custName = item.customer_name || item.pelanggan?.nama || 'Pelanggan';
              const activeSlotNum = item.featured_slot || 1;
              const slotCount = item.slots?.length || 1;
              const objPos = item.object_position || `${item.pos_x ?? 50}% ${item.pos_y ?? 50}%`;

              return (
                <div key={item.id} className="flex flex-col bg-white rounded-lg border border-brand-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden">
                  <div className="p-3 border-b border-brand-200/60 bg-slate-50/70 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-brand-900">
                      <Receipt className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      {item.order_id ? (
                        <Link
                          to={`/admin/orders/${item.order_id}`}
                          className="hover:text-brand-600 hover:underline flex items-center gap-1 font-mono text-[11px]"
                          title="Buka detail pesanan"
                        >
                          <span>{invoiceNum}</span>
                          <ExternalLink className="w-3 h-3 text-brand-600" />
                        </Link>
                      ) : (
                        <span className="font-mono text-[11px]">{invoiceNum}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-slate-wet text-xs">
                      <User className="w-3.5 h-3.5 text-slate-wet/80 shrink-0" />
                      <span className="font-medium truncate max-w-[120px]">{custName}</span>
                    </div>
                  </div>

                  <div className="relative isolate">
                    <BeforeAfterCompare
                      beforeUrl={item.before_url}
                      afterUrl={item.after_url}
                      beforeFraming={item.framing_before}
                      afterFraming={item.framing_after}
                      className="border-0 rounded-none shadow-none"
                      imageClassName="aspect-[4/3] min-h-[220px]"
                      objectPosition={objPos}
                    />

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 z-10 pointer-events-none">
                      <span className="px-2 py-0.5 rounded-md bg-brand-900/85 backdrop-blur-xs text-white text-[10px] font-bold border border-white/20">
                        Cover: Sudut #{activeSlotNum}
                      </span>
                      {slotCount > 1 && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800/80 backdrop-blur-xs text-slate-200 text-[10px] font-semibold border border-white/10">
                          {slotCount} Sudut
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 flex flex-col justify-between gap-2.5 grow bg-white">
                    <div>
                      <h3 className="text-sm font-bold text-brand-900 leading-snug">
                        {item.caption}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-slate-wet mt-1">
                        <span className="font-medium text-brand-600">{item.layanan_terkait}</span>
                        {item.shoe_brand && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            {item.shoe_brand} {item.shoe_type && item.shoe_type !== '-' ? item.shoe_type : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-brand-200/60">
                      <button
                        type="button"
                        onClick={() => handleToggleHome(item)}
                        className="cursor-pointer transition-transform active:scale-95 text-left"
                        title="Klik untuk mengubah tampil di Beranda"
                      >
                        {item.tampil_di_home ? (
                          <Badge variant="success" size="sm">Tampil di Beranda</Badge>
                        ) : (
                          <Badge variant="default" size="sm">Disembunyikan</Badge>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openFrameModal(item)}
                          className="px-2.5 py-1 rounded-md bg-brand-100 text-brand-900 hover:bg-brand-600 hover:text-white transition-colors inline-flex items-center gap-1 text-xs font-semibold cursor-pointer"
                          title="Atur frame crop dan zoom per foto"
                        >
                          <Crop className="w-3 h-3" />
                          <span>Atur Frame</span>
                        </button>
                        <Link
                          to={`/admin/gallery/${item.id}/edit`}
                          className="p-1.5 rounded-md border border-brand-200 text-slate-700 hover:bg-slate-100 transition-colors inline-flex items-center justify-center"
                          title="Edit form lengkap & upload foto sudut"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-md bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors inline-flex items-center justify-center cursor-pointer"
                          aria-label="Hapus foto galeri"
                          title="Hapus foto galeri"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Card noPadding rounded="sm" className="w-full border-brand-200 overflow-hidden shadow-subtle">
            <Pagination
              currentPage={validCurrentPage}
              totalItems={gallery.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </Card>
        </div>
      )}

      {editingItem && createPortal(
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
                  {editingItem.caption}
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
                          Zoom: {currentSlotFraming.before.zoom.toFixed(2)}x
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
                          Zoom: {currentSlotFraming.after.zoom.toFixed(2)}x
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
                  <img
                    src={currentPhotoUrl}
                    alt=""
                    className="w-full h-full object-cover pointer-events-none select-none"
                    style={{
                      transform: `translate(${currentPhotoFraming.x}%, ${currentPhotoFraming.y}%) scale(${currentPhotoFraming.zoom})`,
                      transformOrigin: 'center center',
                      transition: isDragging ? 'none' : 'transform 75ms ease-out'
                    }}
                  />

                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-white/15" />
                    <div className="border-r border-b border-white/15" />
                    <div className="border-b border-white/15" />
                    <div className="border-r border-b border-white/15" />
                    <div className="border-r border-b border-white/15 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    </div>
                    <div className="border-b border-white/15" />
                    <div className="border-r border-b border-white/15" />
                    <div className="border-r border-b border-white/15" />
                    <div />
                  </div>

                  <div className="absolute top-2.5 left-2.5 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white shadow-xs backdrop-blur-md border border-white/20 bg-black/70">
                    <span className={`w-2 h-2 rounded-full ${activeTarget === 'before' ? 'bg-amber-400' : 'bg-brand-500'}`} />
                    <span>{activeTarget === 'before' ? 'Foto Sebelum' : 'Foto Sesudah'}</span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 pointer-events-none px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-white bg-black/70 backdrop-blur-md border border-white/20">
                    {Math.round(currentPhotoFraming.zoom * 100)}% ({currentPhotoFraming.zoom.toFixed(2)}x)
                  </div>

                  <div className="absolute bottom-2.5 inset-x-2.5 pointer-events-none flex items-center justify-between text-[10px] font-mono text-white/90">
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/20">
                      X: {currentPhotoFraming.x > 0 ? `+${currentPhotoFraming.x}` : currentPhotoFraming.x}% | Y: {currentPhotoFraming.y > 0 ? `+${currentPhotoFraming.y}` : currentPhotoFraming.y}%
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/20">
                      Display Frame 4:3
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-md border border-brand-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto grow">
                    <button
                      type="button"
                      onClick={() => handleZoomStep(-0.1)}
                      className="p-1 rounded border border-brand-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min="1.0"
                      max="3.0"
                      step="0.05"
                      value={currentPhotoFraming.zoom}
                      onChange={(e) => handleZoomChange(e.target.value)}
                      className="w-full accent-brand-600 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => handleZoomStep(0.1)}
                      className="p-1 rounded border border-brand-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs font-mono font-bold text-brand-900 shrink-0">
                    Zoom: {Math.round(currentPhotoFraming.zoom * 100)}%
                  </span>
                </div>

                <span className="text-[11px] text-slate-wet text-center font-medium">
                  Tahan & geser mouse langsung pada foto di atas untuk memposisikan. Scroll roda mouse untuk zoom in/out.
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-md border border-brand-200 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-brand-900">
                  <span>Hasil Akhir yang Ditampilkan di Web (4:3):</span>
                  <span className="text-[11px] text-brand-600 font-semibold">
                    Sudut #{modalSlot}
                  </span>
                </div>
                <div className="w-full max-w-sm sm:max-w-md mx-auto aspect-[4/3] rounded-md overflow-hidden border border-brand-300 relative bg-slate-100 shadow-xs">
                  <div className="absolute inset-0 grid grid-cols-2">
                    <div className="relative overflow-hidden border-r-2 border-white">
                      <img
                        src={currentSlotData.before_url}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{
                          transform: `translate(${currentSlotFraming.before.x}%, ${currentSlotFraming.before.y}%) scale(${currentSlotFraming.before.zoom})`,
                          transformOrigin: 'center center'
                        }}
                      />
                      <div className="absolute bottom-0 inset-x-0 py-0.5 bg-black/60 text-[9px] text-white font-bold uppercase text-center">
                        Sebelum ({Math.round(currentSlotFraming.before.zoom * 100)}%)
                      </div>
                    </div>
                    <div className="relative overflow-hidden">
                      <img
                        src={currentSlotData.after_url}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{
                          transform: `translate(${currentSlotFraming.after.x}%, ${currentSlotFraming.after.y}%) scale(${currentSlotFraming.after.zoom})`,
                          transformOrigin: 'center center'
                        }}
                      />
                      <div className="absolute bottom-0 inset-x-0 py-0.5 bg-brand-600/80 text-[9px] text-white font-bold uppercase text-center">
                        Sesudah ({Math.round(currentSlotFraming.after.zoom * 100)}%)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modal-home-check"
                  checked={modalHome}
                  onChange={(e) => setModalHome(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded-sm focus:ring-brand-600 border-brand-200 cursor-pointer"
                />
                <label htmlFor="modal-home-check" className="text-xs font-semibold text-brand-900 cursor-pointer">
                  Tampilkan di halaman utama (Beranda) sebagai cover
                </label>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-brand-200/80 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
              <Link
                to={`/admin/gallery/${editingItem.id}/edit`}
                className="text-xs font-semibold text-brand-600 hover:text-brand-900 hover:underline"
                onClick={closeFrameModal}
              >
                Buka Edit Lengkap &rarr;
              </Link>

              <div className="flex items-center gap-2">
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
                  onClick={handleSaveFrameModal}
                  className="flex items-center gap-1.5"
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>{isSavingFrame ? 'Menyimpan...' : 'Simpan Frame'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
