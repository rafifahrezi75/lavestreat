import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Phone,
  Plus,
  Image,
  Camera,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { ImageUploader } from '../../components/common/ImageUploader';
import { BeforeAfterCompare } from '../../features/gallery/BeforeAfterCompare';
import { RouteMap } from '../../components/map/RouteMap';
import { useToast } from '../../context/ToastContext';
import { ordersApi, settingsApi, galleryApi } from '../../lib/api';
import { STATUS_TRANSITIONS } from '../../lib/constants';

const SLOT_LABELS = {
  1: 'Sudut Depan / Upper',
  2: 'Sudut Samping Luar',
  3: 'Sudut Samping Dalam',
  4: 'Sudut Belakang / Sol'
};

function getItemSlots(item) {
  if (item?.photos && item.photos.length > 0) return item.photos;
  if (item?.gallery && item.gallery.length > 0) {
    const slotMap = new Map();
    item.gallery.forEach(p => {
      const s = p.slot || 1;
      if (!slotMap.has(s)) {
        slotMap.set(s, {
          slot: s,
          label: SLOT_LABELS[s] || `Sudut ${s}`,
          before_id: null,
          before_url: '',
          after_id: null,
          after_url: ''
        });
      }
      const entry = slotMap.get(s);
      if (p.kind === 'before') {
        entry.before_id = p.id;
        entry.before_url = p.url;
      } else if (p.kind === 'after') {
        entry.after_id = p.id;
        entry.after_url = p.url;
      }
    });
    return Array.from(slotMap.values()).sort((a, b) => a.slot - b.slot);
  }
  return [];
}

export function OrderDetailPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [savingGallery, setSavingGallery] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [selectedOrderSlot, setSelectedOrderSlot] = useState(0);
  const [routeOriginType, setRouteOriginType] = useState('outlet');
  const [gpsLocation, setGpsLocation] = useState(null);
  const [detectingGps, setDetectingGps] = useState(false);
  const [galleryData, setGalleryData] = useState({
    before_url: '',
    after_url: '',
    caption: '',
    layanan_terkait: ''
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [ord, sett] = await Promise.all([
          ordersApi.getOrderById(id),
          settingsApi.getSettings()
        ]);
        setOrder(ord);
        setSettings(sett);
        if (sett?.default_route_origin) {
          setRouteOriginType(sett.default_route_origin);
        }

        const transitions = STATUS_TRANSITIONS[ord?.status] || [];
        if (transitions.length > 0) {
          setNewStatus(transitions[0]);
        }

        if (ord?.before_after) {
          setGalleryData({
            before_url: ord.before_after.before_url || '',
            after_url: ord.before_after.after_url || '',
            caption: ord.before_after.caption || '',
            layanan_terkait: ord.before_after.layanan_terkait || ''
          });
        } else {
          const defaultService = ord?.items?.[0]?.nama_snapshot || 'Deep Clean';
          setGalleryData({
            before_url: '',
            after_url: '',
            caption: `Restorasi ${defaultService} pada ${ord?.pelanggan?.nama || 'Sepatu'}`,
            layanan_terkait: defaultService
          });
        }
      } catch (err) {
        setError('Gagal memuat data pesanan.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!newStatus) return;

    setUpdating(true);
    setError('');
    setSuccessMsg('');

    try {
      const updated = await ordersApi.updateStatus(order.id, newStatus, statusNote, 'Admin Lave Streat');
      setOrder(updated);
      setSuccessMsg(`Status pesanan berhasil diperbarui menjadi "${newStatus}".`);
      setStatusNote('');

      const nextTransitions = STATUS_TRANSITIONS[newStatus] || [];
      setNewStatus(nextTransitions[0] || '');
    } catch (err) {
      setError(err.message || 'Gagal mengubah status pesanan.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveGallery = async (e) => {
    e.preventDefault();
    if (!galleryData.before_url || !galleryData.after_url) {
      showToast('Foto Sebelum dan Sesudah wajib diunggah.', 'danger');
      return;
    }

    setSavingGallery(true);
    try {
      const payload = {
        before_url: galleryData.before_url,
        after_url: galleryData.after_url,
        caption: galleryData.caption || `Restorasi ${galleryData.layanan_terkait} - ${order.id}`,
        layanan_terkait: galleryData.layanan_terkait,
        tampil_di_home: true,
        order_id: order.id,
        invoice: order.invoice || order.id,
        customer_name: order.pelanggan?.nama || 'Pelanggan Lave Streat',
        object_position: galleryData.object_position || '50% 50%',
        pos_y: galleryData.pos_y ?? 50
      };

      await galleryApi.createGalleryItem(payload);
      await ordersApi.updateOrder(order.id, { before_after: payload });

      setOrder(prev => ({ ...prev, before_after: payload }));
      setShowGalleryForm(false);
      showToast('Dokumentasi Before-After berhasil disimpan dan masuk ke Galeri publik!');
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan dokumentasi galeri.', 'danger');
    } finally {
      setSavingGallery(false);
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const getStatusBadge = (status) => {
    if (status === 'Menunggu Konfirmasi') return <Badge variant="waiting">{status}</Badge>;
    if (status === 'Selesai') return <Badge variant="success">{status}</Badge>;
    if (status === 'Ditolak' || status === 'Dibatalkan') return <Badge variant="danger">{status}</Badge>;
    return <Badge variant="process">{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-wet text-base">
        Memuat detail pesanan...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 w-full">
        <h2 className="text-xl font-bold font-display text-brand-900">
          Pesanan Tidak Ditemukan
        </h2>
        <Link to="/admin/orders">
          <Button variant="secondary" size="md">
            Kembali ke Daftar Pesanan
          </Button>
        </Link>
      </div>
    );
  }

  const allowedTransitions = STATUS_TRANSITIONS[order.status] || [];

  const outletOrigin = {
    lat: settings?.outlet_lat ?? -7.4478,
    lng: settings?.outlet_lng ?? 112.7183,
    address: settings?.outlet_address || 'Outlet Toko Lave Streat'
  };

  const workerBasecampOrigin = {
    lat: settings?.worker_lat ?? -7.4505,
    lng: settings?.worker_lng ?? 112.7150,
    address: settings?.worker_address || 'Pos / Basecamp Worker Kurir'
  };

  const activeOrigin = routeOriginType === 'gps' && gpsLocation
    ? gpsLocation
    : routeOriginType === 'worker'
    ? workerBasecampOrigin
    : outletOrigin;

  const handleSelectGpsOrigin = () => {
    if (!navigator.geolocation) {
      showToast('Browser tidak mendukung deteksi lokasi GPS.', 'danger');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLocation({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
          address: 'Lokasi GPS Perangkat Worker'
        });
        setRouteOriginType('gps');
        setDetectingGps(false);
        showToast('Berhasil mengarahkan rute dari posisi GPS worker saat ini.');
      },
      (err) => {
        setDetectingGps(false);
        showToast('Gagal mendeteksi lokasi GPS: ' + err.message, 'danger');
      },
      { enableHighAccuracy: true }
    );
  };

  const itemsWithPhotos = order?.items?.map((it, idx) => {
    const slots = getItemSlots(it);
    return {
      ...it,
      originalIndex: idx,
      photos: slots
    };
  }).filter(it => it.photos.length > 0) || [];

  const currentPhotoItem = itemsWithPhotos[selectedItemIndex] || (order?.before_after ? {
    layanan: order.before_after.layanan_terkait,
    service: order.before_after.layanan_terkait,
    shoe_brand: '',
    shoe_type: '',
    photos: order.before_after.slots || [{
      slot: 1,
      label: 'Sudut Depan / Upper',
      before_url: order.before_after.before_url,
      after_url: order.before_after.after_url
    }]
  } : null);

  const currentPhotoSlots = currentPhotoItem?.photos || [];
  const currentSlotObj = currentPhotoSlots[selectedOrderSlot] || currentPhotoSlots[0] || (order?.before_after ? {
    before_url: order.before_after.before_url,
    after_url: order.before_after.after_url
  } : null);

  const hasPhotos = itemsWithPhotos.length > 0 || !!order?.before_after;

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex items-center gap-2.5">
        <Link
          to="/admin/orders"
          className="px-3 py-1.5 rounded-md border border-slate-200/90 text-slate-600 hover:text-brand-900 bg-white hover:bg-slate-50 transition-colors inline-flex items-center gap-2 text-xs font-semibold shadow-xs"
          aria-label="Kembali ke daftar pesanan"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Pesanan</span>
        </Link>
      </div>

      <Card rounded="2xl" className="p-5 sm:p-7 border-slate-200/80 shadow-xs flex flex-col gap-6 w-full bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-brand-900 tracking-tight">
                {order.invoice_number || order.invoice || order.id}
              </h1>
              {getStatusBadge(order.status)}
              <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                ID: {order.id}
              </span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Dibuat pada: {new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <a
              href={`https://wa.me/62${(order.pelanggan?.telepon || '').replace(/^0/, '')}?text=${encodeURIComponent(
                `Halo kak ${order.pelanggan?.nama}, kami dari Lave Streat mengonfirmasi pesanan ${order.id}.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Chat WhatsApp Pelanggan</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <Card className="flex flex-col gap-4 border-brand-200/80 bg-brand-light/20">
              <div className="flex items-center justify-between border-b border-brand-200 pb-2">
                <h2 className="font-display font-bold text-base sm:text-lg text-brand-900">
                  Rincian Item Pesanan
                </h2>
                <span className="text-xs text-slate-wet">
                  {order.items?.length || 0} Item Terdaftar
                </span>
              </div>

              <div className="flex flex-col divide-y divide-brand-200/60">
                {order.items?.map((item, idx) => {
                  const slots = getItemSlots(item);
                  return (
                    <div key={item.id || idx} className="py-4 flex flex-col gap-3">
                      <div className="flex items-start justify-between text-sm gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-brand-900 block text-sm">
                              {item.position ? `Item #${item.position}: ` : ''}{item.nama_snapshot || `${item.shoe_brand} ${item.shoe_type}`}
                            </span>
                            {slots.length > 0 && (
                              <Badge variant="success" size="sm">
                                {slots.length} Sudut Foto
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-wet mt-0.5 flex-wrap">
                            <span className="font-mono text-[11px]">ID: {item.id}</span>
                            <span>Layanan: <strong className="text-brand-900">{item.service || item.layanan}</strong></span>
                            <span>Sepatu: <strong className="text-brand-900">{item.shoe_brand} {item.shoe_type}</strong></span>
                            <span>{formatPrice(item.harga_snapshot || item.price)} x {item.qty || 1}</span>
                          </div>
                        </div>
                        <span className="font-bold text-brand-900 text-sm shrink-0">
                          {formatPrice((item.harga_snapshot || item.price) * (item.qty || 1))}
                        </span>
                      </div>

                      {slots.length > 0 && (
                        <div className="bg-white rounded-xl p-3 border border-brand-200/80 flex flex-col gap-2.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-brand-900">
                              Dokumentasi Item ({slots.length} Sudut Foto Lengkap):
                            </span>
                            <span className="text-[11px] text-slate-wet">
                              Klik sudut foto untuk membuka slider komparasi
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {slots.map((s, sIdx) => {
                              const foundIdx = itemsWithPhotos.findIndex(it => it.id === item.id);
                              const isSelected = selectedItemIndex === foundIdx && selectedOrderSlot === sIdx;
                              return (
                                <div
                                  key={s.slot || sIdx}
                                  onClick={() => {
                                    if (foundIdx !== -1) setSelectedItemIndex(foundIdx);
                                    setSelectedOrderSlot(sIdx);
                                  }}
                                  className={`p-2 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
                                    isSelected
                                      ? 'border-brand-600 bg-brand-100/50 shadow-xs ring-1 ring-brand-600'
                                      : 'border-brand-200 bg-brand-light/30 hover:border-brand-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-[11px] font-semibold text-brand-900">
                                    <span className="truncate">{s.label || `Sudut ${s.slot}`}</span>
                                    <span className="text-[10px] text-slate-wet shrink-0">Slot {s.slot}</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1 rounded overflow-hidden">
                                    <div className="relative aspect-square bg-slate-100 rounded overflow-hidden">
                                      {s.before_url ? (
                                        <>
                                          <img src={s.before_url} alt="Before" className="w-full h-full object-cover" />
                                          <span className="absolute bottom-0.5 left-0.5 bg-black/75 text-white text-[8px] font-bold px-1 py-0.5 rounded leading-none">Before</span>
                                        </>
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-wet italic p-1 text-center">No Before</div>
                                      )}
                                    </div>
                                    <div className="relative aspect-square bg-slate-100 rounded overflow-hidden">
                                      {s.after_url ? (
                                        <>
                                          <img src={s.after_url} alt="After" className="w-full h-full object-cover" />
                                          <span className="absolute bottom-0.5 left-0.5 bg-brand-600 text-white text-[8px] font-bold px-1 py-0.5 rounded leading-none">After</span>
                                        </>
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-wet italic p-1 text-center">No After</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-brand-200 flex items-center justify-between text-base font-bold text-brand-900">
                <span>Total Pembayaran</span>
                <span className="text-xl text-brand-600">{formatPrice(order.total_harga)}</span>
              </div>
            </Card>

            <Card className="flex flex-col gap-4 border-brand-200/80">
              <h2 className="font-display font-bold text-base sm:text-lg text-brand-900 border-b border-brand-200 pb-2">
                Informasi Pelanggan & Pengiriman
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-wet block text-xs">Nama Pelanggan</span>
                    <strong className="text-brand-900 text-sm">{order.pelanggan?.nama}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-wet block text-xs">Nomor WhatsApp</span>
                    <strong className="text-brand-900 text-sm">{order.pelanggan?.telepon}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-wet block text-xs">Jadwal Diminta</span>
                    <strong className="text-brand-900 text-sm">
                      {order.jadwal_tanggal} ({order.jadwal_slot})
                    </strong>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-wet block text-xs">Metode Layanan</span>
                    <strong className="text-brand-900 text-sm capitalize">
                      {order.metode?.replace('_', ' ')}
                    </strong>
                  </div>
                </div>
              </div>

              {order.alamat_jemput?.teks && (
                <div className="pt-3 border-t border-brand-200/60 text-sm">
                  <span className="text-slate-wet block mb-1 text-xs font-medium">Alamat Penjemputan / Pengantaran</span>
                  <p className="font-medium text-brand-900 leading-relaxed bg-brand-100/40 p-3 rounded-lg border border-brand-200 text-xs sm:text-sm">
                    {order.alamat_jemput.teks}
                  </p>
                </div>
              )}

              {order.catatan && (
                <div className="pt-3 border-t border-brand-200/60 text-sm">
                  <span className="text-slate-wet block mb-1 text-xs font-medium">Catatan Tambahan Pelanggan</span>
                  <p className="text-slate-wet italic bg-white p-3 rounded-lg border border-brand-200 text-xs sm:text-sm">
                    "{order.catatan}"
                  </p>
                </div>
              )}
            </Card>

            <Card className="flex flex-col gap-4 border-brand-200/80">
              <div className="flex items-center justify-between border-b border-brand-200 pb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-brand-600" />
                  <h2 className="font-display font-bold text-base sm:text-lg text-brand-900">
                    Dokumentasi Before-After (Galeri)
                  </h2>
                </div>
                {hasPhotos && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowGalleryForm(!showGalleryForm)}
                    className="text-xs"
                  >
                    {showGalleryForm ? 'Tutup Form' : 'Perbarui Foto Galeri'}
                  </Button>
                )}
              </div>

              {hasPhotos && !showGalleryForm ? (
                <div className="flex flex-col gap-3">
                  {itemsWithPhotos.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      <span className="text-xs font-semibold text-slate-wet shrink-0 mr-1">Pilih Item:</span>
                      {itemsWithPhotos.map((it, idx) => (
                        <button
                          key={it.id || idx}
                          type="button"
                          onClick={() => { setSelectedItemIndex(idx); setSelectedOrderSlot(0); }}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            selectedItemIndex === idx
                              ? 'bg-brand-900 text-white shadow-xs'
                              : 'bg-brand-100/70 text-brand-900 hover:bg-brand-200 border border-brand-200'
                          }`}
                        >
                          {it.shoe_brand} {it.shoe_type} ({it.layanan || it.service})
                        </button>
                      ))}
                    </div>
                  )}

                  {currentPhotoSlots.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      <span className="text-[11px] font-semibold text-slate-wet shrink-0 mr-1">Sudut Foto:</span>
                      {currentPhotoSlots.map((s, idx) => (
                        <button
                          key={s.slot || idx}
                          type="button"
                          onClick={() => setSelectedOrderSlot(idx)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                            selectedOrderSlot === idx
                              ? 'bg-brand-600 text-white shadow-xs'
                              : 'bg-white text-brand-900 border border-brand-200 hover:bg-brand-100'
                          }`}
                        >
                          {s.label || `Sudut ${s.slot || (idx + 1)}`}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="rounded-xl overflow-hidden border border-brand-200 bg-slate-900">
                    <BeforeAfterCompare
                      beforeUrl={currentSlotObj?.before_url || order.before_after?.before_url}
                      afterUrl={currentSlotObj?.after_url || order.before_after?.after_url}
                      className="border-0 rounded-none shadow-none"
                      objectPosition={order.before_after?.object_position || (order.before_after?.pos_y != null ? `50% ${order.before_after.pos_y}%` : 'center')}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                    {currentPhotoSlots.map((s, idx) => (
                      <div
                        key={s.slot || idx}
                        onClick={() => setSelectedOrderSlot(idx)}
                        className={`p-2 rounded-md border transition-all cursor-pointer flex flex-col gap-1.5 ${
                          selectedOrderSlot === idx
                            ? 'border-brand-600 bg-brand-100/50 shadow-xs ring-1 ring-brand-600'
                            : 'border-brand-200 bg-white hover:border-brand-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-brand-900">
                          <span className="truncate">{s.label || `Sudut ${s.slot}`}</span>
                          <span className="text-[10px] text-slate-wet shrink-0">Slot {s.slot}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 rounded overflow-hidden">
                          <div className="relative aspect-square bg-slate-100 rounded overflow-hidden">
                            {s.before_url ? (
                              <>
                                <img src={s.before_url} alt="Before" className="w-full h-full object-cover" />
                                <span className="absolute bottom-0.5 left-0.5 bg-black/75 text-white text-[8px] font-bold px-1 py-0.5 rounded leading-none">Before</span>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-wet italic p-1 text-center">No Before</div>
                            )}
                          </div>
                          <div className="relative aspect-square bg-slate-100 rounded overflow-hidden">
                            {s.after_url ? (
                              <>
                                <img src={s.after_url} alt="After" className="w-full h-full object-cover" />
                                <span className="absolute bottom-0.5 left-0.5 bg-brand-600 text-white text-[8px] font-bold px-1 py-0.5 rounded leading-none">After</span>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-wet italic p-1 text-center">No After</div>
                            )}
                          </div>
                        </div>
                        {s.before_id && (
                          <div className="text-[9px] font-mono text-slate-wet truncate">
                            ID: {s.before_id.slice(0, 8)}...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-brand-200/60 text-xs text-slate-wet">
                    <div>
                      <span>
                        Item: <strong className="text-brand-900">{currentPhotoItem?.shoe_brand ? `${currentPhotoItem.shoe_brand} ${currentPhotoItem.shoe_type}` : (order.before_after?.caption || 'Sepatu')}</strong> ({currentPhotoItem?.layanan || currentPhotoItem?.service || order.before_after?.layanan_terkait})
                      </span>
                      {currentPhotoItem?.id && (
                        <span className="ml-2 font-mono text-[10px] text-slate-wet bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          ID Item: {currentPhotoItem.id}
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-success font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aktif di Galeri Publik ({currentPhotoSlots.length} Sudut Foto)</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {!hasPhotos && (
                    <p className="text-xs text-slate-wet">
                      Dokumentasikan hasil treatment sepatu pesanan ini. Foto yang diunggah di sini akan otomatis terhubung ke pesanan dan terdaftar di Galeri Publik.
                    </p>
                  )}

                  <form onSubmit={handleSaveGallery} className="flex flex-col gap-4 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ImageUploader
                        value={galleryData.before_url}
                        onChange={(url) => setGalleryData({ ...galleryData, before_url: url })}
                        label="Foto Sebelum (Before) *"
                      />
                      <ImageUploader
                        value={galleryData.after_url}
                        onChange={(url) => setGalleryData({ ...galleryData, after_url: url })}
                        label="Foto Sesudah (After) *"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Judul Dokumentasi"
                        value={galleryData.caption}
                        onChange={(e) => setGalleryData({ ...galleryData, caption: e.target.value })}
                        placeholder="Contoh: Restorasi Deep Clean pada Puma"
                        required
                      />

                      <Input
                        label="Layanan Terkait"
                        value={galleryData.layanan_terkait}
                        onChange={(e) => setGalleryData({ ...galleryData, layanan_terkait: e.target.value })}
                        placeholder="Contoh: Deep Clean"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-brand-200">
                      {hasPhotos && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setShowGalleryForm(false)}
                        >
                          Batal
                        </Button>
                      )}
                      <Button
                        type="submit"
                        size="sm"
                        disabled={savingGallery || !galleryData.before_url || !galleryData.after_url}
                        className="flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{savingGallery ? 'Menyimpan ke Galeri...' : 'Simpan ke Galeri & Pesanan'}</span>
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </Card>

            <Card className="flex flex-col gap-4 border-brand-200/80">
              <h2 className="font-display font-bold text-base sm:text-lg text-brand-900 border-b border-brand-200 pb-2">
                Riwayat Perubahan Status (Audit Trail)
              </h2>

              <div className="flex flex-col gap-3.5">
                {order.status_history?.map((hist, idx) => (
                  <div key={idx} className="flex items-start gap-3.5 text-sm relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-600 mt-1.5 shrink-0" />
                    <div className="flex flex-col grow">
                      <div className="flex items-center justify-between">
                        <strong className="text-brand-900 text-xs sm:text-sm">{hist.status}</strong>
                        <span className="text-[11px] text-slate-wet">
                          {new Date(hist.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(hist.timestamp).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      {hist.catatan && (
                        <p className="text-xs sm:text-sm text-slate-wet mt-0.5">{hist.catatan}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card className="flex flex-col gap-4 border-brand-200/80">
              <div className="flex flex-col gap-2 border-b border-brand-200 pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="font-display font-bold text-base sm:text-lg text-brand-900">
                    Peta Rute ke Pelanggan
                  </h2>
                  <span className="text-xs text-slate-wet">
                    Tujuan: <strong>{order.pelanggan?.nama}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                  <span className="text-xs font-semibold text-slate-wet shrink-0 mr-1">Titik Awal:</span>
                  <button
                    type="button"
                    onClick={() => setRouteOriginType('outlet')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      routeOriginType === 'outlet'
                        ? 'bg-brand-900 text-white shadow-xs'
                        : 'bg-white text-brand-900 border border-brand-200 hover:bg-brand-100'
                    }`}
                  >
                    Outlet Toko
                  </button>
                  <button
                    type="button"
                    onClick={() => setRouteOriginType('worker')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      routeOriginType === 'worker'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white text-brand-900 border border-brand-200 hover:bg-brand-100'
                    }`}
                  >
                    Pos Worker
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectGpsOrigin}
                    disabled={detectingGps}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      routeOriginType === 'gps'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-brand-900 border border-brand-200 hover:bg-brand-100'
                    }`}
                  >
                    {detectingGps ? 'Mendeteksi...' : 'GPS Worker'}
                  </button>
                </div>
              </div>

              <RouteMap
                origin={activeOrigin}
                originType={routeOriginType}
                originLabel={activeOrigin.address}
                destination={order.alamat_jemput}
                height="300px"
              />
            </Card>

            <Card className="flex flex-col gap-4 border-brand-200/80">
              <h2 className="font-display font-bold text-base sm:text-lg text-brand-900 border-b border-brand-200 pb-2">
                Perbarui Status Pesanan
              </h2>

              {successMsg && (
                <div className="p-3 bg-success/15 border border-success/30 rounded-lg text-xs sm:text-sm text-success font-medium">
                  {successMsg}
                </div>
              )}

              {error && (
                <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-xs sm:text-sm text-danger font-medium">
                  {error}
                </div>
              )}

              {allowedTransitions.length === 0 ? (
                <p className="text-xs sm:text-sm text-slate-wet">
                  Status pesanan ini sudah berada pada tahap akhir (<strong>{order.status}</strong>) dan tidak dapat diubah lagi.
                </p>
              ) : (
                <form onSubmit={handleUpdateStatus} className="flex flex-col gap-4">
                  <Select
                    label="Pilih Status Selanjutnya"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    options={allowedTransitions.map((st) => ({
                      value: st,
                      label: st
                    }))}
                    required
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-brand-900">
                      Catatan Perubahan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder="Contoh: Kurir telah berangkat menjemput"
                      className="w-full rounded-lg border border-brand-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-ink-deep focus:border-brand-600 focus:outline-hidden"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="md"
                    disabled={updating || !newStatus}
                    className="w-full mt-2 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{updating ? 'Menyimpan Perubahan...' : 'Terapkan Status Baru'}</span>
                  </Button>
                </form>
              )}
            </Card>

            {order.status === 'Selesai' && (
              <Card className="flex flex-col gap-3 bg-brand-light/60 border-brand-300">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <h2 className="font-display font-bold text-sm sm:text-base text-brand-900">
                      Testimoni Pesanan Selesai
                    </h2>
                  </div>
                  <Link
                    to={`/admin/testimonials/new?nama=${encodeURIComponent(order.pelanggan?.nama || '')}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Input Testimoni</span>
                  </Link>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pesanan telah selesai. Catat testimoni kepuasan pelanggan ke dalam sistem untuk ditampilkan di halaman beranda.
                </p>
              </Card>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
