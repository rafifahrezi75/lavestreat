import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle,
  Sparkle,
  Drop,
  CaretLeft,
  CaretRight
} from '@phosphor-icons/react';
import { Truck, Tag as LucideTag, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { ServiceCard } from '../../features/services/ServiceCard';
import { BeforeAfterCompare } from '../../features/gallery/BeforeAfterCompare';
import { TestimonialCard } from '../../features/testimonials/TestimonialCard';
import { servicesApi, galleryApi, testimonialsApi, contentApi } from '../../lib/api';

export function HomePage() {
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [services, setServices] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [selectedGalleryIdx, setSelectedGalleryIdx] = useState(0);
  const [currentTestiIndex, setCurrentTestiIndex] = useState(0);
  const [isTestiPaused, setIsTestiPaused] = useState(false);
  const [visibleTestiCards, setVisibleTestiCards] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setVisibleTestiCards(1);
      else if (window.innerWidth < 1024) setVisibleTestiCards(2);
      else setVisibleTestiCards(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxTestiIndex = Math.max(0, testimonials.length - visibleTestiCards);

  useEffect(() => {
    if (testimonials.length <= visibleTestiCards || isTestiPaused) return;
    const interval = setInterval(() => {
      setCurrentTestiIndex((prev) => (prev >= maxTestiIndex ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(interval);
  }, [testimonials.length, visibleTestiCards, isTestiPaused, maxTestiIndex]);

  const handlePrevTesti = () => {
    setCurrentTestiIndex((prev) => (prev <= 0 ? maxTestiIndex : prev - 1));
  };
  const handleNextTesti = () => {
    setCurrentTestiIndex((prev) => (prev >= maxTestiIndex ? 0 : prev + 1));
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [homeContent, servicesList, galleryList, testiList] = await Promise.all([
          contentApi.getHomeContent(),
          servicesApi.getServices(true),
          galleryApi.getGallery(true),
          testimonialsApi.getTestimonials(true)
        ]);
        setContent(homeContent);
        setServices(servicesList);
        setGallery(galleryList);
        setTestimonials(testiList);
      } catch (err) {
      }
    }

    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-brand-light page-smooth-enter">
      <section className="relative min-h-screen flex items-center pt-24 pb-16 sm:pt-28 sm:pb-20 bg-[#072B4A] text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-bg.jpg"
            alt="Lave Streat Sneaker Care Workshop"
            className="w-full h-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#072B4A]/95 via-[#0A3D66]/85 to-[#0A3D66]/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#072B4A] via-transparent to-[#0A3D66]/60" />
        </div>

        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-600/30 blur-3xl pointer-events-none z-1" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-sky-400/20 blur-3xl pointer-events-none z-1" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-brand-200/5 blur-3xl pointer-events-none z-1" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-6 flex flex-col justify-between py-1">
              <div className="flex flex-col items-start gap-6">
                <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-5xl text-white leading-[1.12] tracking-tight">
                  {content?.hero_title || 'Perawatan & Restorasi Sepatu Spesialis Sidoarjo'}
                </h1>

                <p className="text-sm sm:text-base text-brand-100/90 max-w-lg leading-relaxed font-normal">
                  {content?.hero_subtitle || 'Layanan cuci mendalam, repaint restoratif, dan unyellowing sepatu profesional dengan standar pengerjaan manual. Kurir kami menjemput dan mengantar langsung ke alamat Anda di wilayah Sidoarjo dan Surabaya.'}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    onClick={() => navigate('/pesan')}
                    size="lg"
                    className="bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg hover:shadow-brand-600/40 flex items-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Pesan Penjemputan</span>
                  </Button>

                  <Link to="/layanan">
                    <Button variant="glass" size="lg" className="flex items-center gap-2">
                      <LucideTag className="w-4 h-4 text-brand-200" />
                      <span>Tarif Layanan</span>
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-white/15 flex flex-wrap items-center gap-6 text-xs text-brand-100">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle size={16} weight="fill" className="text-accent-gold shrink-0" />
                  <span>Antar-Jemput Sidoarjo & Surabaya</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle size={16} weight="fill" className="text-accent-gold shrink-0" />
                  <span>Pengerjaan Manual 2-3 Hari</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle size={16} weight="fill" className="text-accent-gold shrink-0" />
                  <span>Garansi Cuci Ulang</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="relative rounded-2xl sm:rounded-3xl border-2 border-white/20 shadow-2xl overflow-hidden bg-brand-900 group aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] min-h-[240px] animate-float-smooth">
                <img
                  src="/hero-sneaker.jpg"
                  alt="Lave Streat Perawatan Sepatu Spesialis"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />

                <div className="absolute top-4 right-4 bg-brand-900/85 backdrop-blur-md border border-white/20 text-white px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-semibold">
                  <CheckCircle size={15} weight="fill" className="text-accent-gold" />
                  <span>100% Detailing Manual</span>
                </div>

                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md border border-brand-100 text-brand-900 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold leading-tight">Layanan Antar-Jemput</span>
                    <span className="text-[11px] text-slate-wet leading-none">Area Sidoarjo & Surabaya</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white border-b border-brand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 block mb-1">
                Katalog Pilihan
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-brand-900 tracking-tight">
                Pilihan Perawatan & Tarif Resmi
              </h2>
              <p className="text-xs sm:text-sm text-slate-wet mt-1">
                Pencucian mendalam, pemutihan sol, dan restorasi warna menggunakan formula khusus ramah material sepatu.
              </p>
            </div>
            <Link
              to="/layanan"
              className="inline-flex items-center text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-900 transition-colors"
            >
              Lihat Semua Layanan &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onSelect={() => navigate(`/pesan?service=${service.id}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="py-16 sm:py-20 bg-sand-100/50 border-b border-brand-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 block mb-1">
                  Bukti Pengerjaan
                </span>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-brand-900 tracking-tight">
                  Dokumentasi Restorasi Workshop
                </h2>
                <p className="text-xs sm:text-sm text-slate-wet mt-1">
                  Hasil nyata pengerjaan teknisi workshop kami. Lihat dokumentasi lengkap sebelum dan sesudah perawatan.
                </p>
              </div>
              <Link
                to="/galeri"
                className="inline-flex items-center text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-900 transition-colors shrink-0"
              >
                Lihat Semua Galeri &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7 flex flex-col">
                {gallery[selectedGalleryIdx] && (
                  <BeforeAfterCompare
                    key={gallery[selectedGalleryIdx].id}
                    beforeUrl={gallery[selectedGalleryIdx].before_url}
                    afterUrl={gallery[selectedGalleryIdx].after_url}
                    caption={gallery[selectedGalleryIdx].caption}
                    serviceTag={gallery[selectedGalleryIdx].layanan_terkait}
                    objectPosition={gallery[selectedGalleryIdx].object_position || (gallery[selectedGalleryIdx].pos_y != null ? `50% ${gallery[selectedGalleryIdx].pos_y}%` : 'center')}
                    className="h-full"
                  />
                )}
              </div>

              <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-xl border border-brand-200 shadow-subtle flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-wet uppercase tracking-wider block mb-3">
                    Pilih Sampel Sepatu:
                  </span>
                  <div className="flex flex-col gap-2">
                    {gallery.slice(0, 4).map((item, idx) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedGalleryIdx(idx)}
                        className={`text-left p-3 rounded-lg border transition-all flex flex-col gap-0.5 ${
                          selectedGalleryIdx === idx
                            ? 'bg-brand-light border-brand-600 shadow-2xs ring-1 ring-brand-600'
                            : 'bg-white border-brand-200 hover:bg-brand-light/40'
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-semibold text-brand-900 line-clamp-1">
                          {item.caption}
                        </span>
                        <span className="text-[11px] font-medium text-brand-600">
                          {item.layanan_terkait}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-brand-200/60 flex items-center justify-between text-xs text-slate-wet">
                  <span>Dokumentasi riil workshop</span>
                  <Link to="/galeri" className="font-semibold text-brand-600 hover:text-brand-900">
                    Buka Galeri Lengkap ({gallery.length} foto)
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Link to="/galeri">
                <Button variant="outline" size="md" className="flex items-center gap-2">
                  <span>Buka Halaman Galeri Lengkap</span>
                  <ArrowRight className="w-4 h-4 text-brand-600" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 sm:py-24 bg-white border-b border-brand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block mb-2">
              WHY CHOOSE US
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-brand-900 tracking-tight">
              Standar Layanan yang Membedakan Kami
            </h2>
            <p className="text-xs sm:text-sm text-slate-wet mt-3 max-w-2xl mx-auto leading-relaxed">
              Dedikasi pengerjaan manual profesional, formula ramah material, dan fasilitas antar-jemput yang memberikan kenyamanan maksimal bagi Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
            
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-brand-light/40 rounded-2xl border border-brand-200/80 p-6 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-brand-900 text-white flex items-center justify-center mb-4 shadow-sm">
                  <Sparkle size={22} weight="fill" className="text-brand-200" />
                </div>
                <h3 className="font-display font-bold text-base sm:text-lg text-brand-900 mb-2 leading-snug">
                  100% Pengerjaan Manual
                </h3>
                <p className="text-xs sm:text-sm text-slate-wet leading-relaxed">
                  Pembersihan teliti bagian demi bagian tanpa mesin cuci otomatis yang berisiko merusak lem, jahitan, dan serat sepatu.
                </p>
              </div>

              <div className="bg-brand-light/40 rounded-2xl border border-brand-200/80 p-6 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-brand-900 text-white flex items-center justify-center mb-4 shadow-sm">
                  <Drop size={22} weight="fill" className="text-brand-200" />
                </div>
                <h3 className="font-display font-bold text-base sm:text-lg text-brand-900 mb-2 leading-snug">
                  Formula Khusus Ramah Bahan
                </h3>
                <p className="text-xs sm:text-sm text-slate-wet leading-relaxed">
                  Cairan pembersih ramah lingkungan ber-pH netral yang aman untuk segala jenis material, dari kanvas, suede, hingga kulit asli.
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center order-first lg:order-none mb-4 lg:mb-0">
              <div className="relative w-full max-w-xs sm:max-w-sm aspect-[3/4] min-h-[300px] rounded-3xl overflow-hidden border-2 border-brand-200 shadow-xl bg-brand-100 group">
                <img
                  src="/specialist.jpg"
                  alt="Teknisi Perawatan Sepatu Lave Streat"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/85 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 grid grid-cols-3 gap-1.5 sm:gap-2">
                  <div className="bg-white/95 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-brand-200/90 shadow-md text-center flex flex-col justify-center">
                    <span className="font-display font-extrabold text-sm sm:text-base text-brand-900 leading-none">
                      3+ Thn
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-brand-600 uppercase tracking-tight mt-1">
                      Pengalaman
                    </span>
                  </div>

                  <div className="bg-white/95 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-brand-200/90 shadow-md text-center flex flex-col justify-center">
                    <span className="font-display font-extrabold text-sm sm:text-base text-brand-900 leading-none">
                      5.000+
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-brand-600 uppercase tracking-tight mt-1">
                      Sepatu
                    </span>
                  </div>

                  <div className="bg-white/95 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-brand-200/90 shadow-md text-center flex flex-col justify-center">
                    <span className="font-display font-extrabold text-sm sm:text-base text-brand-900 leading-none">
                      8+
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-brand-600 uppercase tracking-tight mt-1">
                      Pekerja
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-brand-light/40 rounded-2xl border border-brand-200/80 p-6 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-brand-900 text-white flex items-center justify-center mb-4 shadow-sm">
                  <Truck className="w-5 h-5 text-brand-200" />
                </div>
                <h3 className="font-display font-bold text-base sm:text-lg text-brand-900 mb-2 leading-snug">
                  Antar-Jemput Praktis
                </h3>
                <p className="text-xs sm:text-sm text-slate-wet leading-relaxed">
                  Kurir Lave Streat siap mengambil sepatu kotor dan mengantarkannya kembali ke rumah atau kantor area Sidoarjo dan Surabaya.
                </p>
              </div>

              <div className="bg-brand-light/40 rounded-2xl border border-brand-200/80 p-6 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-brand-900 text-white flex items-center justify-center mb-4 shadow-sm">
                  <CheckCircle size={22} weight="fill" className="text-brand-200" />
                </div>
                <h3 className="font-display font-bold text-base sm:text-lg text-brand-900 mb-2 leading-snug">
                  Garansi Cuci Ulang 100%
                </h3>
                <p className="text-xs sm:text-sm text-slate-wet leading-relaxed">
                  Kepuasan Anda terjamin. Apabila hasil pengerjaan dirasa belum optimal, kami bersihkan ulang tuntas tanpa biaya tambahan.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="py-16 sm:py-20 bg-brand-light border-b border-brand-200 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div className="max-w-2xl">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 block mb-1">
                  Ulasan Nyata
                </span>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-brand-900 tracking-tight">
                  Pengalaman Pelanggan Kami
                </h2>
                <p className="text-xs sm:text-sm text-slate-wet mt-1">
                  Catatan ulasan dari pelanggan yang mempercayakan perawatan sepatunya pada workshop Lave Streat.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {testimonials.length > visibleTestiCards && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrevTesti}
                      aria-label="Ulasan sebelumnya"
                      className="w-9 h-9 rounded-full bg-white border border-brand-200 text-brand-900 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-colors flex items-center justify-center shadow-2xs"
                    >
                      <CaretLeft size={18} weight="bold" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextTesti}
                      aria-label="Ulasan selanjutnya"
                      className="w-9 h-9 rounded-full bg-white border border-brand-200 text-brand-900 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-colors flex items-center justify-center shadow-2xs"
                    >
                      <CaretRight size={18} weight="bold" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div 
              className="relative overflow-hidden -mx-3 px-3 py-2"
              onMouseEnter={() => setIsTestiPaused(true)}
              onMouseLeave={() => setIsTestiPaused(false)}
              onTouchStart={() => setIsTestiPaused(true)}
              onTouchEnd={() => setIsTestiPaused(false)}
            >
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${currentTestiIndex * (100 / visibleTestiCards)}%)`
                }}
              >
                {testimonials.map((testi) => (
                  <div 
                    key={testi.id}
                    className="shrink-0 px-3 flex flex-col"
                    style={{ width: `${100 / visibleTestiCards}%` }}
                  >
                    <TestimonialCard testimonial={testi} />
                  </div>
                ))}
              </div>
            </div>

            {testimonials.length > visibleTestiCards && (
              <div className="flex items-center justify-center gap-1.5 mt-8">
                {Array.from({ length: maxTestiIndex + 1 }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentTestiIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentTestiIndex === idx 
                        ? 'w-6 bg-brand-600' 
                        : 'w-2 bg-brand-200 hover:bg-brand-300'
                    }`}
                    aria-label={`Ke slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="py-14 sm:py-16 bg-brand-900 text-snow-foam">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-left">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight leading-snug">
              Sepatu kotor atau warna mulai pudar?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
              Jadwalkan penjemputan sekarang. Tim kurir kami siap menjemput dan merawat sepatu Anda di area Sidoarjo dan Surabaya.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <Button
              onClick={() => navigate('/pesan')}
              size="lg"
              className="shadow-md flex items-center gap-2"
            >
              <Truck className="w-4 h-4" />
              <span>Pesan Penjemputan</span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
