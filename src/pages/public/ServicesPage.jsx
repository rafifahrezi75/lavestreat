import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  ChatCircleDots, 
  Plus, 
  Check,
  ShieldCheck
} from '@phosphor-icons/react';
import { Truck, ArrowRight } from 'lucide-react';
import { ServiceCard } from '../../features/services/ServiceCard';
import { SkeletonCard } from '../../components/common/Skeleton';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { servicesApi, settingsApi } from '../../lib/api';

export function ServicesPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [servicesList, settingsData] = await Promise.all([
          servicesApi.getServices(true),
          settingsApi.getSettings()
        ]);
        setServices(servicesList);
        setSettings(settingsData);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const addOnIds = ['srv-unyellowing', 'srv-fast-track'];

  const coreServices = services.filter(s => s.kategori !== 'sabun' && !addOnIds.includes(s.id));
  const productServices = services.filter(s => s.kategori === 'sabun');
  const addOnServices = services.filter(s => addOnIds.includes(s.id));

  const formatPrice = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="bg-brand-light min-h-screen page-smooth-enter">
      <PageHeader
        title="Layanan & Produk"
        breadcrumb={[{ label: 'Layanan & Produk' }]}
        subtitle="Daftar lengkap layanan cuci tangan manual, pembersihan khusus material, dan produk perawatan sepatu untuk wilayah Sidoarjo dan Surabaya."
        bgImage="/services/deep-clean.jpg"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">

        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block mb-2">
              CLEAN TREATMENT
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-brand-900 tracking-tight">
              Katalog Treatment Utama
            </h2>
            <p className="text-xs sm:text-sm text-slate-wet mt-2 leading-relaxed">
              Pilihan pencucian mendalam, pembersihan khusus material, dan perawatan sesuai jenis material sepatu Anda.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : coreServices.length === 0 ? (
            <div className="text-center py-16 text-slate-wet bg-slate-50 rounded-xl border border-brand-200">
              Belum ada layanan yang tersedia saat ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onSelect={() => navigate(`/pesan?service=${service.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        <section className="bg-white rounded-3xl border border-brand-200 p-6 sm:p-10 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-brand-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block mb-1">
                CARE PRODUCTS
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-brand-900 tracking-tight">
                Produk Perawatan Sepatu
              </h2>
              <p className="text-xs sm:text-sm text-slate-wet mt-1 max-w-2xl">
                Formula khusus pembersih dan penyegar sepatu racikan Lave Streat untuk perawatan mandiri di rumah. Praktis, aman untuk berbagai jenis material, dan siap dikirim langsung ke alamat Anda.
              </p>
            </div>
            <Link to="/pesan">
              <Button size="sm" variant="secondary" className="shrink-0 flex items-center gap-1.5">
                <span>Pesan Produk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : productServices.length === 0 ? (
            <div className="text-center py-12 text-slate-wet bg-slate-50 rounded-xl border border-brand-200">
              Belum ada produk perawatan yang tersedia saat ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {productServices.map((product) => (
                <ServiceCard
                  key={product.id}
                  service={product}
                  onSelect={() => navigate(`/pesan?service=${product.id}`)}
                />
              ))}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-brand-200/60 bg-brand-light/30 -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-6 sm:p-8 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-brand-900 font-medium">
              Dapat dibeli satuan dengan pengiriman kurir langsung, atau digabungkan bersama paket treatment cuci sepatu Anda.
            </p>
            <Button
              onClick={() => navigate('/pesan')}
              size="sm"
              className="bg-brand-600 hover:bg-brand-500 text-white shrink-0"
            >
              Order Produk Sekarang
            </Button>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-brand-200 p-6 sm:p-10 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-brand-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block mb-1">
                ADD-ONS
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-brand-900 tracking-tight">
                Layanan Tambahan (Add-ons)
              </h2>
              <p className="text-xs sm:text-sm text-slate-wet mt-1">
                Tambahan perawatan khusus yang dapat digabungkan langsung dengan paket pencucian sepatu Anda.
              </p>
            </div>
            <Link to="/pesan">
              <Button size="sm" variant="secondary" className="shrink-0 flex items-center gap-1.5">
                <span>Pesan Bersama Treatment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-brand-light/40 rounded-2xl border border-brand-200 p-6 flex flex-col justify-between shadow-xs hover:border-brand-600/50 transition-colors">
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-accent-gold text-brand-900">
                    Add-on Treatment
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-wet">
                    <Clock size={15} weight="bold" />
                    <span>+2 hari kerja</span>
                  </div>
                </div>

                <h3 className="font-display font-bold text-xl text-brand-900 mb-2">
                  Unyellowing Treat
                </h3>

                <p className="text-xs sm:text-sm text-slate-wet leading-relaxed mb-4">
                  Treatment oksidasi khusus untuk memutihkan dan mengembalikan warna sol sepatu yang menguning. Wajib diambil bersamaan dengan paket treatment cuci.
                </p>
              </div>

              <div className="pt-4 border-t border-brand-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-wet block">Biaya Tambahan</span>
                  <span className="text-lg font-bold text-brand-600">+Rp 25.000</span>
                </div>
                <Button
                  onClick={() => navigate('/pesan?service=srv-unyellowing')}
                  size="sm"
                  className="bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-1.5"
                >
                  <Plus size={14} weight="bold" />
                  <span>Pilih Add-on</span>
                </Button>
              </div>
            </div>

            <div className="bg-brand-light/40 rounded-2xl border border-brand-200 p-6 flex flex-col justify-between shadow-xs hover:border-brand-600/50 transition-colors">
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-600 text-white">
                    Add-on Prioritas
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-wet">
                    <Clock size={15} weight="bold" />
                    <span>Est. 2 hari</span>
                  </div>
                </div>

                <h3 className="font-display font-bold text-xl text-brand-900 mb-2">
                  Fast Track (Express Prioritas)
                </h3>

                <p className="text-xs sm:text-sm text-slate-wet leading-relaxed mb-4">
                  Layanan prioritas antrean pengerjaan kilat untuk memangkas durasi estimasi perawatan sepatu Anda agar siap pakai lebih cepat.
                </p>
              </div>

              <div className="pt-4 border-t border-brand-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-wet block">Biaya Tambahan</span>
                  <span className="text-lg font-bold text-brand-600">+Rp 15.000</span>
                </div>
                <Button
                  onClick={() => navigate('/pesan?service=srv-fast-track')}
                  size="sm"
                  className="bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-1.5"
                >
                  <Plus size={14} weight="bold" />
                  <span>Pilih Prioritas</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-brand-200 p-6 sm:p-10 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-brand-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Truck className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
                  PICK UP & DELIVERY
                </span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-brand-900 tracking-tight">
                Tarif Layanan Antar-Jemput
              </h2>
              <p className="text-xs sm:text-sm text-slate-wet mt-1">
                Siap antar jemput langsung ke alamat rumah atau kantor Anda, asal tidak luar pulau.
              </p>
            </div>
            <Link to="/pesan">
              <Button size="md" className="bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-2 shadow-sm">
                <Truck className="w-4 h-4" />
                <span>Pesan Sekarang</span>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-brand-200 bg-brand-light/30 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center mb-4 shadow-xs">
                  <MapPin size={22} weight="bold" />
                </div>
                <h3 className="font-display font-bold text-lg text-brand-900 mb-1">
                  Wilayah Sidoarjo
                </h3>
                <p className="text-xs text-slate-wet leading-relaxed mb-4">
                  Sidoarjo Kota, Buduran, Candi, Gedangan, Waru, Sedati, Sukodono, Wonoayu, Tanggulangin, Porong, Krian, dan sekitarnya.
                </p>
              </div>
              <div className="pt-4 border-t border-brand-200/80">
                <span className="text-[11px] text-slate-wet block">Tarif Kurir</span>
                <span className="text-xl font-bold font-display text-brand-600">Gratis (Termasuk)</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-brand-200 bg-brand-light/30 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-900 text-white flex items-center justify-center mb-4 shadow-xs">
                  <MapPin size={22} weight="bold" />
                </div>
                <h3 className="font-display font-bold text-lg text-brand-900 mb-1">
                  Wilayah Surabaya
                </h3>
                <p className="text-xs text-slate-wet leading-relaxed mb-4">
                  Surabaya Selatan, Wonokromo, Rungkut, Gayungan, Jambangan, Sukolilo, Gubeng, Tegalsari, dan sekitarnya.
                </p>
              </div>
              <div className="pt-4 border-t border-brand-200/80">
                <span className="text-[11px] text-slate-wet block">Tarif Kurir</span>
                <span className="text-xl font-bold font-display text-brand-600">Gratis (Termasuk)</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-brand-200 bg-brand-light/30 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-accent-gold text-brand-900 flex items-center justify-center mb-4 shadow-xs font-bold">
                  <ChatCircleDots size={22} weight="bold" />
                </div>
                <h3 className="font-display font-bold text-lg text-brand-900 mb-1">
                  Wilayah Lainnya (Others)
                </h3>
                <p className="text-xs text-slate-wet leading-relaxed mb-4">
                  Luar jangkauan reguler atau pemesanan skala partai/komunitas besar, silakan hubungi tim kami untuk jadwal khusus.
                </p>
              </div>
              <div className="pt-4 border-t border-brand-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-wet block">Konsultasi Lokasi</span>
                  <Link
                    to="/kontak"
                    className="text-base font-bold text-brand-600 hover:text-brand-900 transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <span className="group-hover:underline">DM for Details</span>
                    <ArrowRight className="w-4 h-4 text-brand-600 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                <Link
                  to="/kontak"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>Hubungi Kami</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
