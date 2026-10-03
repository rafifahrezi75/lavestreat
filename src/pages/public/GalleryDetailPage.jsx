import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Eye,
  ArrowRight,
  X
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { galleryApi } from '../../lib/api';
import { getImageFramingStyle } from '../../lib/framing';

const ANGLE_LABELS = {
  1: 'Sudut Depan',
  2: 'Samping Luar',
  3: 'Samping Dalam',
  4: 'Belakang / Sol'
};

export function GalleryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedItems, setRelatedItems] = useState([]);
  const [activeModalPhoto, setActiveModalPhoto] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDetail() {
      setLoading(true);
      try {
        const found = await galleryApi.getGalleryItemById(id);
        if (isMounted) {
          setItem(found);
        }

        const all = await galleryApi.getGallery(false);
        if (isMounted) {
          const others = all.filter(g => g.id !== id).slice(0, 4);
          setRelatedItems(others);
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

    loadDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModalPhoto(null);
      }
    };
    if (activeModalPhoto) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalPhoto]);

  if (loading) {
    return (
      <div className="bg-brand-light min-h-screen pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="h-6 w-40 bg-slate-200 rounded-md animate-pulse" />
          <div className="space-y-3">
            <div className="h-8 bg-slate-200 rounded-md w-1/3 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded-md w-1/4 animate-pulse" />
          </div>
          <div className="w-full aspect-[16/10] bg-slate-900/10 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="bg-brand-light min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center mb-4 border border-brand-200">
          <Eye className="w-6 h-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-brand-900 mb-2">
          Galeri Tidak Ditemukan
        </h1>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          Foto pengerjaan yang Anda cari tidak tersedia.
        </p>
        <Link to="/galeri">
          <Button variant="primary" size="md">
            Kembali ke Galeri
          </Button>
        </Link>
      </div>
    );
  }

  const displaySlots = (item.slots && item.slots.length > 0)
    ? item.slots
    : [{ slot: 1, label: 'Sudut Utama', before_url: item.before_url, after_url: item.after_url }];

  const getSlotFramingStyle = (s, type) => {
    const isFeatured = !item.slots || (s.slot === (item.featured_slot || 1));
    const framing = type === 'before'
      ? (s.framing_before || (isFeatured ? item.framing_before : null))
      : (s.framing_after || (isFeatured ? item.framing_after : null));
    return getImageFramingStyle({ [`framing_${type}`]: framing, object_position: s.object_position || item.object_position }, type);
  };

  const gridClass = displaySlots.length >= 4
    ? 'grid-cols-2 md:grid-cols-4'
    : displaySlots.length === 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : displaySlots.length === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : 'grid-cols-1 max-w-md mx-auto';

  const ticketCode = item.invoice || item.invoice_number || item.order_id || 'LAVE-GAL';
  const serviceName = item.layanan_terkait || 'Deep Clean';
  const shoeTitle = item.caption;
  const shoeBrand = item.shoe_brand || 'Sneakers';
  const shoeType = (item.shoe_type && item.shoe_type !== '-') ? item.shoe_type : '';

  const waMessage = `Halo Lave Streat, saya ingin konsultasi perawatan sepatu ${shoeBrand} ${shoeType} seperti di galeri (${shoeTitle}).`;

  return (
    <div className="bg-slate-50 min-h-screen pb-20 text-slate-900 page-smooth-enter">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3.5 sm:p-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white">
            <div className="flex items-center justify-between gap-2 overflow-x-auto">
              <Link
                to="/galeri"
                aria-label="Kembali ke Galeri"
                className="inline-flex items-center justify-center p-1.5 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-colors shrink-0 group"
              >
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                <span className="hidden sm:inline">Kembali ke Galeri</span>
              </Link>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-brand-100 text-brand-900 text-[11px] sm:text-xs font-semibold border border-brand-200 whitespace-nowrap">
                  {serviceName}
                </span>
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-white text-slate-700 text-[11px] sm:text-xs font-medium border border-slate-200 shadow-2xs whitespace-nowrap">
                  {shoeBrand} {shoeType}
                </span>
                <span className="font-mono text-[10px] sm:text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded border border-slate-200 whitespace-nowrap">
                  {ticketCode}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7 space-y-7 bg-white">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-800 text-white shadow-xs">
                    Sebelum
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs text-slate-400 font-medium">
                  {displaySlots.length} Sudut Foto
                </span>
              </div>

              <div className={`grid ${gridClass} gap-3 sm:gap-4`}>
                {displaySlots.map((s, idx) => {
                  const label = s.label || ANGLE_LABELS[s.slot || (idx + 1)] || `Sudut #${idx + 1}`;
                  const bUrl = s.before_url || item.before_url;
                  const bStyle = getSlotFramingStyle(s, 'before');
                  return (
                    <div
                      key={`before-${s.slot || idx}`}
                      onClick={() => setActiveModalPhoto({ url: bUrl, title: shoeTitle, angleLabel: label, type: 'Sebelum', style: bStyle })}
                      className="group relative bg-slate-100 rounded-xl border border-slate-200 overflow-hidden cursor-pointer shadow-subtle hover:border-brand-600 hover:shadow-md transition-all"
                    >
                      <div className="aspect-[4/3] w-full relative overflow-hidden bg-slate-900/5">
                        <img
                          src={bUrl}
                          alt={`Sebelum - ${label}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          style={bStyle}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-slate-900 p-1.5 rounded-full shadow-md">
                            <Eye className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                      <div className="p-2 sm:p-2.5 bg-white border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {label}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 ml-1">
                          Before
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-brand-600 text-white shadow-xs">
                    Sesudah
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs text-brand-600 font-medium">
                  Selesai &amp; Bersih
                </span>
              </div>

              <div className={`grid ${gridClass} gap-3 sm:gap-4`}>
                {displaySlots.map((s, idx) => {
                  const label = s.label || ANGLE_LABELS[s.slot || (idx + 1)] || `Sudut #${idx + 1}`;
                  const aUrl = s.after_url || item.after_url;
                  const aStyle = getSlotFramingStyle(s, 'after');
                  return (
                    <div
                      key={`after-${s.slot || idx}`}
                      onClick={() => setActiveModalPhoto({ url: aUrl, title: shoeTitle, angleLabel: label, type: 'Sesudah', style: aStyle })}
                      className="group relative bg-brand-50/20 rounded-xl border border-brand-200 overflow-hidden cursor-pointer shadow-subtle hover:border-brand-600 hover:shadow-md transition-all"
                    >
                      <div className="aspect-[4/3] w-full relative overflow-hidden bg-slate-900/5">
                        <img
                          src={aUrl}
                          alt={`Sesudah - ${label}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          style={aStyle}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-brand-900/0 group-hover:bg-brand-900/10 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-brand-900 p-1.5 rounded-full shadow-md">
                            <Eye className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                      <div className="p-2 sm:p-2.5 bg-white border-t border-brand-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-brand-900 truncate">
                          {label}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-brand-600 shrink-0 ml-1">
                          After
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7 border-t border-slate-200 bg-slate-50/70">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-3">
                <h3 className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                  Catatan Pengerjaan
                </h3>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                  Ini adalah hasil pengerjaan <strong className="text-brand-900">{serviceName}</strong> untuk sepatu <strong className="text-brand-900">{shoeBrand} {shoeType}</strong>. Kondisi sepatu didokumentasikan dari berbagai sudut sebelum dan sesudah pengerjaan untuk menunjukkan transparansi kualitas hasil treatment Lave Streat.
                </p>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Perawatan menggunakan chemical khusus ramah material sepatu tanpa merusak pigmen warna dan serat orisinal.
                </p>
              </div>

              <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-subtle space-y-3.5">
                <h3 className="font-bold text-slate-900 text-sm">Detail Pengerjaan</h3>
                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Merek</span>
                    <span className="font-medium text-slate-900">{shoeBrand}</span>
                  </div>
                  {shoeType && (
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-500">Model</span>
                      <span className="font-medium text-slate-900">{shoeType}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Layanan</span>
                    <span className="font-medium text-brand-600">{serviceName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">No. Order</span>
                    <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {ticketCode}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => navigate(`/pesan?service=${encodeURIComponent(serviceName)}&brand=${encodeURIComponent(shoeBrand)}`)}
                    className="flex-1 justify-center text-xs py-2"
                  >
                    Pesan Layanan Serupa
                  </Button>
                  <a
                    href={`https://wa.me/6285128024120?text=${encodeURIComponent(waMessage)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center px-4 py-2 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
                  >
                    Tanya via WA
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {relatedItems.length > 0 && (
          <div className="mt-14 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Galeri Lainnya
                </h2>
              </div>
              <Link
                to="/galeri"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedItems.map((other) => (
                <Link
                  key={other.id}
                  to={`/galeri/${other.id}`}
                  className="group bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
                >
                  <div className="w-full aspect-square bg-slate-100 relative overflow-hidden">
                    <div className="absolute inset-0 grid grid-cols-2">
                      <div className="relative overflow-hidden border-r border-white">
                        <img
                          src={other.before_url}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          style={getImageFramingStyle(other, 'before')}
                        />
                        <div className="absolute bottom-0 inset-x-0 py-1 bg-gradient-to-t from-black/60 to-transparent text-[10px] text-white font-medium text-center">
                          Sebelum
                        </div>
                      </div>
                      <div className="relative overflow-hidden">
                        <img
                          src={other.after_url}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          style={getImageFramingStyle(other, 'after')}
                        />
                        <div className="absolute bottom-0 inset-x-0 py-1 bg-gradient-to-t from-brand-900/60 to-transparent text-[10px] text-white font-medium text-center">
                          Sesudah
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 flex flex-col justify-between grow">
                    <div>
                      <span className="text-[10px] font-bold text-brand-600 uppercase block truncate">
                        {other.layanan_terkait || 'Treatment'}
                      </span>
                      <h3 className="text-xs font-semibold text-slate-900 truncate mt-0.5 group-hover:text-brand-600 transition-colors">
                        {other.caption}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-6 text-center sm:hidden">
              <Link
                to="/galeri"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600"
              >
                <span>Lihat Semua Galeri</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {activeModalPhoto && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 pt-24 pb-8 overflow-y-auto"
          onClick={() => setActiveModalPhoto(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl sm:max-w-3xl w-full max-h-[calc(100vh-130px)] flex flex-col shadow-2xl overflow-hidden relative my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                  activeModalPhoto.type === 'Sesudah' ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-200'
                }`}>
                  {activeModalPhoto.type}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-200">
                  {activeModalPhoto.angleLabel}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalPhoto(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative flex-1 min-h-0 bg-slate-950 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
              <img
                src={activeModalPhoto.url}
                alt={activeModalPhoto.angleLabel}
                className="max-h-[50vh] sm:max-h-[62vh] w-auto max-w-full object-contain rounded-lg"
                style={activeModalPhoto.style}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
