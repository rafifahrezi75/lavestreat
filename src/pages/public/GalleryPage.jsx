import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, X, ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { BeforeAfterCompare } from '../../features/gallery/BeforeAfterCompare';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { galleryApi } from '../../lib/api';

const ITEMS_PER_PAGE = 12;

function GalleryCard({ item, onOpen }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden border border-brand-200/80 shadow-xs hover:shadow-lg hover:border-brand-300 transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(item)}
    >
      <div className="relative w-full aspect-[4/3] min-h-[190px] overflow-hidden bg-slate-100">
        <div className="absolute inset-0 grid grid-cols-2">
          <div className="relative overflow-hidden border-r-2 border-white">
            <img
              src={item.before_url}
              alt={`${item.caption} sebelum`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 py-1 bg-black/50 backdrop-blur-xs text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">Sebelum</span>
            </div>
          </div>
          <div className="relative overflow-hidden">
            <img
              src={item.after_url}
              alt={`${item.caption} sesudah`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 py-1 bg-brand-600/70 backdrop-blur-xs text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">Sesudah</span>
            </div>
          </div>
        </div>

        <div className={`absolute inset-0 bg-brand-900/60 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-12 h-12 rounded-full bg-white/90 text-brand-900 flex items-center justify-center shadow-lg">
            <Expand className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>
      </div>

      <div className="px-4 py-3.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-brand-900 leading-snug truncate">
            {item.caption}
          </h3>
          <span className="text-[11px] text-slate-wet mt-0.5 block truncate">
            {item.layanan_terkait || 'Treatment Sepatu'}
          </span>
        </div>
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        end = Math.min(4, totalPages - 1);
      }
      if (currentPage >= totalPages - 1) {
        start = Math.max(totalPages - 3, 2);
      }

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <nav aria-label="Navigasi halaman galeri" className="flex items-center justify-center gap-1.5 mt-14">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 rounded-lg bg-white border border-brand-200 text-brand-900 hover:bg-brand-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPageNumbers().map((page, idx) =>
        page === '...' ? (
          <span key={`dots-${idx}`} className="w-9 h-9 flex items-center justify-center text-xs text-slate-wet select-none">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
              currentPage === page
                ? 'bg-brand-600 text-white shadow-xs border border-brand-600'
                : 'bg-white border border-brand-200 text-brand-900 hover:bg-brand-100'
            }`}
            aria-label={`Halaman ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 rounded-lg bg-white border border-brand-200 text-brand-900 hover:bg-brand-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Halaman selanjutnya"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}

const GALLERY_CATEGORIES = [
  { id: 'all', label: 'Semua Treatment' },
  { id: 'cuci', label: 'Cuci Sepatu' },
  { id: 'repaint', label: 'Repaint Sepatu' },
  { id: 'sabun', label: 'Sabun & Perawatan' }
];

export function GalleryPage() {
  const navigate = useNavigate();
  const [gallery, setGallery] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const gridRef = useRef(null);

  useEffect(() => {
    async function loadGallery() {
      try {
        const items = await galleryApi.getGallery(false);
        setGallery(items);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  const getItemCategory = (item) => {
    if (item.kategori) return item.kategori.toLowerCase();
    const txt = `${item.layanan_terkait || ''} ${item.caption || ''}`.toLowerCase();
    if (txt.includes('repaint')) return 'repaint';
    if (txt.includes('sabun') || txt.includes('cleaner')) return 'sabun';
    return 'cuci';
  };

  const filteredGallery = selectedCategory === 'all'
    ? gallery
    : gallery.filter((item) => getItemCategory(item) === selectedCategory);

  const totalPages = Math.ceil(filteredGallery.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredGallery.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryChange = useCallback((catId) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const resultStart = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const resultEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredGallery.length);

  return (
    <div className="bg-brand-light min-h-screen page-smooth-enter">
      <PageHeader
        title="Galeri Restorasi"
        breadcrumb={[{ label: 'Galeri' }]}
        subtitle="Dokumentasi resmi sebelum dan sesudah pengerjaan perawatan sepatu dari workshop Lave Streat. Klik foto untuk melihat perbandingan interaktif."
        bgImage="/services/repaint.jpg"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">

        <div ref={gridRef} className="scroll-mt-24">
          <div className="flex items-center justify-center flex-wrap gap-2 mb-10">
            {GALLERY_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-white text-brand-900 hover:bg-brand-100 border border-brand-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {!loading && filteredGallery.length > 0 && (
            <div className="flex items-center justify-between mb-6 px-1">
              <p className="text-xs text-slate-wet">
                Menampilkan <strong className="text-brand-900">{resultStart}-{resultEnd}</strong> dari <strong className="text-brand-900">{filteredGallery.length}</strong> dokumentasi
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="w-full aspect-[4/3] min-h-[190px] bg-slate-200 animate-pulse" />
                <div className="bg-white p-4 space-y-2 border border-brand-200 border-t-0 rounded-b-2xl">
                  <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredGallery.length === 0 ? (
          <div className="text-center py-16 text-slate-wet bg-white rounded-2xl border border-brand-200 shadow-xs">
            <p className="text-sm">Belum ada dokumentasi untuk kategori ini.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {paginatedItems.map((item) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  onOpen={setActiveItem}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}

        <div className="mt-16 bg-brand-900 rounded-2xl p-8 sm:p-12 text-center text-white flex flex-col items-center shadow-subtle">
          <h2 className="font-display font-bold text-2xl sm:text-3xl max-w-xl mb-3 tracking-tight">
            Punya Sepatu dengan Kondisi Serupa?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-lg mb-6 leading-relaxed">
            Kurir Lave Streat siap mengambil sepatu kotor Anda langsung di rumah area Sidoarjo dan Surabaya.
          </p>
          <Button
            onClick={() => navigate('/pesan')}
            size="lg"
            className="flex items-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>Pesan Penjemputan Sekarang</span>
          </Button>
        </div>
      </div>

      {activeItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 page-smooth-enter"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-brand-200/60 bg-white shrink-0">
              <div className="min-w-0 pr-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 block">
                  {activeItem.layanan_terkait || 'Treatment Sepatu'}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-brand-900 truncate">
                  {activeItem.caption}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] min-h-[300px] bg-slate-900 overflow-hidden">
              <BeforeAfterCompare
                beforeUrl={activeItem.before_url}
                afterUrl={activeItem.after_url}
                className="border-0 rounded-none shadow-none h-full"
              />
            </div>

            <div className="px-5 sm:px-6 py-4 bg-slate-50 border-t border-brand-200/60 flex items-center justify-between flex-wrap gap-3 shrink-0">
              <p className="text-xs text-slate-wet">
                Geser slider tengah untuk membandingkan detail hasil restorasi.
              </p>
              <Button
                onClick={() => {
                  setActiveItem(null);
                  navigate('/pesan');
                }}
                size="sm"
                className="flex items-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Pesan Treatment Ini</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
