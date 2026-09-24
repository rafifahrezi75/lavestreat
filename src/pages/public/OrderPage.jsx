import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Check, 
  Plus, 
  Minus, 
  Truck, 
  Storefront, 
  Package, 
  CalendarCheck, 
  ShieldCheck,
  ShoppingBag,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Sparkle
} from '@phosphor-icons/react';
import { MessageCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { LocationPicker } from '../../components/map/LocationPicker';
import { SliderCaptcha } from '../../components/common/SliderCaptcha';
import { PageHeader } from '../../components/common/PageHeader';
import { servicesApi, ordersApi } from '../../lib/api';
import { ORDER_METHODS } from '../../lib/constants';

export function OrderPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedServiceId = searchParams.get('service');

  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const [selectedItems, setSelectedItems] = useState({});
  const [method, setMethod] = useState('');
  const [customer, setCustomer] = useState({
    nama: '',
    telepon: '',
    email: '',
    catatan: ''
  });
  const [schedule, setSchedule] = useState({
    tanggal: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    slot: 'pagi'
  });
  const [pickupLocation, setPickupLocation] = useState({
    teks: '',
    lat: -7.4478,
    lng: 112.7183
  });
  const [captchaVerified, setCaptchaVerified] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoadingServices(true);
      try {
        const list = await servicesApi.getServices(true);
        setServices(list);

        if (preselectedServiceId && list.some(s => s.id === preselectedServiceId)) {
          setSelectedItems({ [preselectedServiceId]: 1 });
        }
      } catch (err) {
        setErrorMessage('Gagal memuat katalog layanan.');
      } finally {
        setLoadingServices(false);
      }
    }

    loadData();
  }, [preselectedServiceId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const hasShoeTreatment = Object.keys(selectedItems).some(id => {
    const s = services.find(item => item.id === id);
    return s && (s.kategori === 'cuci' || s.kategori === 'repaint');
  });

  const defaultMethod = hasShoeTreatment ? ORDER_METHODS.DIJEMPUT : ORDER_METHODS.DIKIRIM;
  const currentMethod = method || defaultMethod;

  const handleQtyChange = (serviceId, delta) => {
    setSelectedItems(prev => {
      const current = prev[serviceId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      }
      return { ...prev, [serviceId]: next };
    });
  };

  const calculateSubtotal = () => {
    return Object.entries(selectedItems).reduce((sum, [id, qty]) => {
      const s = services.find(item => item.id === id);
      return sum + (s ? s.harga * qty : 0);
    }, 0);
  };

  const totalItemCount = Object.values(selectedItems).reduce((a, b) => a + b, 0);

  const formatPrice = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const filteredServices = services.filter(service => {
    if (activeCategory === 'all') return true;
    return service.kategori === activeCategory;
  });

  const handleNextFromStep1 = () => {
    if (Object.keys(selectedItems).length === 0) {
      setErrorMessage('Pilih minimal satu layanan atau produk sebelum melanjutkan.');
      return;
    }
    setErrorMessage('');
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    setErrorMessage('');
    setStep(3);
  };

  const handleNextFromStep3 = () => {
    if (!customer.nama.trim()) {
      setErrorMessage('Nama lengkap pemesan wajib diisi.');
      return;
    }
    if (!customer.telepon.trim()) {
      setErrorMessage('Nomor WhatsApp wajib diisi untuk konfirmasi dan jadwal.');
      return;
    }

    const needsAddress = currentMethod === ORDER_METHODS.DIJEMPUT || currentMethod === ORDER_METHODS.DIKIRIM;
    if (needsAddress && !pickupLocation.teks.trim()) {
      setErrorMessage('Alamat lokasi wajib diisi.');
      return;
    }

    setErrorMessage('');
    setStep(4);
  };

  const handleSubmitOrder = async () => {
    if (!captchaVerified) {
      setErrorMessage('Harap selesaikan verifikasi puzzle keamanan terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const itemsPayload = Object.entries(selectedItems).map(([service_id, qty]) => ({
        service_id,
        qty
      }));

      const payload = {
        pelanggan: customer,
        items: itemsPayload,
        metode: currentMethod,
        alamat_jemput: (currentMethod === ORDER_METHODS.DIJEMPUT || currentMethod === ORDER_METHODS.DIKIRIM)
          ? pickupLocation
          : null,
        jadwal_tanggal: schedule.tanggal,
        jadwal_slot: schedule.slot,
        catatan: customer.catatan
      };

      const res = await ordersApi.createOrder(payload);
      setCreatedOrder(res);
      setStep(5);
    } catch (err) {
      setErrorMessage(err.message || 'Gagal mengirim pesanan. Silakan periksa koneksi Anda dan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels = [
    { num: 1, title: 'Layanan', desc: 'Pilih perawatan' },
    { num: 2, title: 'Metode', desc: 'Jemput / kirim' },
    { num: 3, title: 'Data & Lokasi', desc: 'Alamat & waktu' },
    { num: 4, title: 'Ringkasan', desc: 'Verifikasi order' }
  ];

  return (
    <div className="min-h-screen bg-brand-light/30 pb-20 page-smooth-enter">
      <PageHeader
        title={step === 5 ? 'Pesanan Berhasil' : 'Formulir Pemesanan'}
        breadcrumb={[{ label: 'Pemesanan' }]}
        subtitle={step === 5
          ? 'Terima kasih atas pesanan Anda. Tim teknisi dan kurir kami akan segera memproses.'
          : 'Layanan cuci, repaint sepatu, dan sabun perawatan dengan fasilitas antar-jemput Sidoarjo dan Surabaya.'
        }
        bgImage="/services/white-clean.jpg"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

        {step < 5 && (
          <div className="bg-white rounded-card border border-brand-200 p-4 sm:p-6 mb-8 shadow-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stepLabels.map((s) => {
                const isCompleted = step > s.num;
                const isCurrent = step === s.num;
                return (
                  <div
                    key={s.num}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                      isCurrent
                        ? 'bg-brand-100/60 border border-brand-200'
                        : isCompleted
                        ? 'bg-white'
                        : 'opacity-60'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                        isCompleted
                          ? 'bg-success text-white'
                          : isCurrent
                          ? 'bg-brand-600 text-white'
                          : 'bg-brand-100 text-slate-wet'
                      }`}
                    >
                      {isCompleted ? <Check size={18} weight="bold" /> : s.num}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-bold truncate ${isCurrent ? 'text-brand-900' : 'text-slate-wet'}`}>
                        {s.title}
                      </div>
                      <div className="text-[11px] text-slate-wet/80 truncate hidden sm:block">
                        {s.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="w-full bg-brand-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-brand-600 h-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/30 rounded-xl text-danger text-sm font-medium flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="text-danger hover:underline text-xs ml-4"
            >
              Tutup
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-card border border-brand-200 shadow-xs">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-brand-600" />
                <span className="text-sm font-bold text-brand-900">Kategori Layanan</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'Semua Layanan' },
                  { id: 'cuci', label: 'Cuci Sepatu' },
                  { id: 'repaint', label: 'Repaint & Unyellowing' },
                  { id: 'sabun', label: 'Produk Sabun' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategory(tab.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      activeCategory === tab.id
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-brand-100 text-brand-900 hover:bg-brand-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {loadingServices ? (
              <div className="py-20 text-center text-slate-wet bg-white rounded-card border border-brand-200">
                Memuat daftar layanan Lave Streat...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map((service) => {
                  const qty = selectedItems[service.id] || 0;
                  const isSelected = qty > 0;
                  return (
                    <div
                      key={service.id}
                      className={`h-full bg-white rounded-card border p-4.5 flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                        isSelected
                          ? 'border-brand-600 bg-brand-100/20 ring-2 ring-brand-600/15'
                          : 'border-brand-200 hover:border-brand-600/40'
                      }`}
                    >
                      <div>
                        <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden mb-3 bg-brand-100 border border-brand-200 shrink-0">
                          <img
                            src={service.foto || '/hero-sneaker.jpg'}
                            alt={service.nama}
                            className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
                          />
                          <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-xs text-brand-900 shadow-xs">
                            {service.kategori}
                          </span>
                        </div>

                        <h3 className="font-bold text-base text-brand-900 mb-1 leading-snug line-clamp-1">
                          {service.nama}
                        </h3>

                        <p className="text-xs text-slate-wet line-clamp-2 min-h-[2.5rem] mb-3 leading-relaxed">
                          {service.deskripsi || 'Layanan perawatan sepatu profesional dari workshop Lave Streat.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-brand-200/60 flex items-center justify-between mt-auto">
                        <div>
                          <div className="text-[11px] text-slate-wet">Biaya Layanan</div>
                          <div className="text-base font-bold text-brand-600">
                            {formatPrice(service.harga)}
                            <span className="text-xs font-normal text-slate-wet">/{service.satuan}</span>
                          </div>
                        </div>

                        <div>
                          {isSelected ? (
                            <div className="flex items-center gap-2 bg-white border border-brand-200 rounded-full px-2 py-1 shadow-xs">
                              <button
                                type="button"
                                onClick={() => handleQtyChange(service.id, -1)}
                                className="w-7 h-7 rounded-full bg-brand-100 text-brand-900 flex items-center justify-center hover:bg-brand-200 transition-colors"
                                aria-label="Kurangi kuantitas"
                              >
                                <Minus size={14} weight="bold" />
                              </button>
                              <span className="text-sm font-bold w-5 text-center text-brand-900">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQtyChange(service.id, 1)}
                                className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-900 transition-colors"
                                aria-label="Tambah kuantitas"
                              >
                                <Plus size={14} weight="bold" />
                              </button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleQtyChange(service.id, 1)}
                              size="sm"
                              variant="secondary"
                              className="px-4"
                            >
                              Pilih
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="sticky bottom-4 z-30 bg-brand-900 text-white p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-brand-900">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-brand-200 shrink-0">
                  <ShoppingBag size={24} weight="bold" />
                </div>
                <div>
                  <div className="text-xs text-brand-200">
                    {totalItemCount} item dipilih
                  </div>
                  <div className="text-xl font-bold font-display text-white">
                    {formatPrice(calculateSubtotal())}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  onClick={handleNextFromStep1}
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white font-bold flex items-center justify-center gap-2"
                >
                  <span>Lanjut ke Metode Penjemputan</span>
                  <ArrowRight size={18} weight="bold" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-card border border-brand-200 p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl font-bold font-display text-brand-900 mb-2">
                Pilih Metode Penyerahan Pesanan
              </h2>
              <p className="text-sm text-slate-wet mb-6">
                Tentukan bagaimana sepatu atau produk akan diserahkan antara Anda dan tim Lave Streat.
              </p>

              {hasShoeTreatment ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setMethod(ORDER_METHODS.DIJEMPUT)}
                    className={`flex flex-col items-start p-5 rounded-2xl border text-left transition-all relative ${
                      currentMethod === ORDER_METHODS.DIJEMPUT
                        ? 'border-brand-600 bg-brand-100/40 ring-2 ring-brand-600/25 shadow-sm'
                        : 'border-brand-200 hover:border-brand-600/40 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                        <Truck size={26} weight="bold" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-brand-600 text-white px-2.5 py-0.5 rounded-full">
                        Rekomendasi
                      </span>
                    </div>
                    <span className="text-base font-bold text-brand-900 mb-1">
                      Dijemput oleh Kurir Lave Streat
                    </span>
                    <span className="text-xs text-slate-wet leading-relaxed">
                      Kurir kami mengambil sepatu kotor langsung ke rumah atau kantor Anda di area Sidoarjo dan Surabaya sesuai jadwal yang ditentukan.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod(ORDER_METHODS.ANTAR_SENDIRI)}
                    className={`flex flex-col items-start p-5 rounded-2xl border text-left transition-all ${
                      currentMethod === ORDER_METHODS.ANTAR_SENDIRI
                        ? 'border-brand-600 bg-brand-100/40 ring-2 ring-brand-600/25 shadow-sm'
                        : 'border-brand-200 hover:border-brand-600/40 bg-white'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-900 flex items-center justify-center mb-3">
                      <Storefront size={26} weight="bold" />
                    </div>
                    <span className="text-base font-bold text-brand-900 mb-1">
                      Antar Sendiri ke Studio Outlet
                    </span>
                    <span className="text-xs text-slate-wet leading-relaxed">
                      Anda mengantar sepatu langsung ke outlet Lave Streat di Jl. Raya Ponti No. 18, Sidoarjo saat jam operasional 09.00 - 21.00 WIB.
                    </span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setMethod(ORDER_METHODS.DIKIRIM)}
                    className={`flex flex-col items-start p-5 rounded-2xl border text-left transition-all ${
                      currentMethod === ORDER_METHODS.DIKIRIM
                        ? 'border-brand-600 bg-brand-100/40 ring-2 ring-brand-600/25 shadow-sm'
                        : 'border-brand-200 hover:border-brand-600/40 bg-white'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center mb-3">
                      <Package size={26} weight="bold" />
                    </div>
                    <span className="text-base font-bold text-brand-900 mb-1">
                      Dikirim Langsung ke Alamat
                    </span>
                    <span className="text-xs text-slate-wet leading-relaxed">
                      Produk sabun dan perawatan sepatu dikirim langsung ke alamat rumah Anda melalui kurir pengantaran.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod(ORDER_METHODS.AMBIL_SENDIRI)}
                    className={`flex flex-col items-start p-5 rounded-2xl border text-left transition-all ${
                      currentMethod === ORDER_METHODS.AMBIL_SENDIRI
                        ? 'border-brand-600 bg-brand-100/40 ring-2 ring-brand-600/25 shadow-sm'
                        : 'border-brand-200 hover:border-brand-600/40 bg-white'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-900 flex items-center justify-center mb-3">
                      <Storefront size={26} weight="bold" />
                    </div>
                    <span className="text-base font-bold text-brand-900 mb-1">
                      Ambil di Outlet
                    </span>
                    <span className="text-xs text-slate-wet leading-relaxed">
                      Ambil produk secara langsung di studio Lave Streat Sidoarjo.
                    </span>
                  </button>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-brand-200 flex items-center justify-between">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft size={16} weight="bold" />
                  <span>Kembali ke Layanan</span>
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNextFromStep2}
                  className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white"
                >
                  <span>Lanjut ke Data & Lokasi</span>
                  <ArrowRight size={16} weight="bold" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-card border border-brand-200 p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl font-bold font-display text-brand-900 mb-2">
                Informasi Pemesan & Jadwal
              </h2>
              <p className="text-sm text-slate-wet mb-6">
                Mohon lengkapi informasi kontak pemesan dan waktu penjemputan/pengantaran.
              </p>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nama Lengkap"
                    value={customer.nama}
                    onChange={(e) => setCustomer({ ...customer, nama: e.target.value })}
                    placeholder="Contoh: Rian Pratama"
                    required
                  />
                  <Input
                    label="Nomor WhatsApp"
                    value={customer.telepon}
                    onChange={(e) => setCustomer({ ...customer, telepon: e.target.value })}
                    placeholder="Contoh: 081234567890"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Email (Opsional)"
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="nama@email.com"
                  />
                  <Input
                    label="Pilih Tanggal"
                    type="date"
                    value={schedule.tanggal}
                    onChange={(e) => setSchedule({ ...schedule, tanggal: e.target.value })}
                    required
                  />
                  <Select
                    label="Slot Waktu"
                    value={schedule.slot}
                    onChange={(e) => setSchedule({ ...schedule, slot: e.target.value })}
                    options={[
                      { value: 'pagi', label: 'Pagi (09:00 - 12:00)' },
                      { value: 'siang', label: 'Siang (13:00 - 16:00)' },
                      { value: 'sore', label: 'Sore (16:00 - 19:00)' }
                    ]}
                  />
                </div>

                {(currentMethod === ORDER_METHODS.DIJEMPUT || currentMethod === ORDER_METHODS.DIKIRIM) && (
                  <div className="pt-2">
                    <LocationPicker
                      value={pickupLocation}
                      onChange={(loc) => setPickupLocation(loc)}
                      height="320px"
                      label={currentMethod === ORDER_METHODS.DIJEMPUT ? 'Titik Lokasi Penjemputan di Peta' : 'Titik Lokasi Pengiriman di Peta'}
                    />
                  </div>
                )}

                <Input
                  label="Catatan Khusus untuk Tim Lave Streat (Opsional)"
                  value={customer.catatan}
                  onChange={(e) => setCustomer({ ...customer, catatan: e.target.value })}
                  placeholder="Contoh: Sepatu putih ada noda minyak membandel di bagian suede / Titip pos satpam."
                />
              </div>

              <div className="mt-8 pt-6 border-t border-brand-200 flex items-center justify-between">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft size={16} weight="bold" />
                  <span>Kembali ke Metode</span>
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNextFromStep3}
                  className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white"
                >
                  <span>Lanjut ke Ringkasan</span>
                  <ArrowRight size={16} weight="bold" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-white rounded-card border border-brand-200 p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl font-bold font-display text-brand-900 mb-2">
                Ringkasan & Konfirmasi Pesanan
              </h2>
              <p className="text-sm text-slate-wet mb-6">
                Periksa kembali data pesanan Anda sebelum dikirimkan ke sistem Lave Streat.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-brand-light/50 rounded-2xl border border-brand-200 p-5">
                    <h3 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-3">
                      Daftar Item Perawatan
                    </h3>
                    <div className="divide-y divide-brand-200">
                      {Object.entries(selectedItems).map(([id, qty]) => {
                        const s = services.find(item => item.id === id);
                        if (!s) return null;
                        return (
                          <div key={id} className="py-3 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              {s.foto && (
                                <img
                                  src={s.foto}
                                  alt={s.nama}
                                  className="w-11 h-11 rounded-lg object-cover bg-brand-100 shrink-0 border border-brand-200"
                                />
                              )}
                              <div>
                                <span className="font-bold text-brand-900">{s.nama}</span>
                                <div className="text-xs text-slate-wet">
                                  {qty} unit x {formatPrice(s.harga)}
                                </div>
                              </div>
                            </div>
                            <span className="font-bold text-brand-900">
                              {formatPrice(s.harga * qty)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4 mt-2 border-t border-brand-200 flex items-center justify-between">
                      <span className="font-bold text-brand-900">Total Biaya Perawatan</span>
                      <span className="text-xl font-bold font-display text-brand-600">
                        {formatPrice(calculateSubtotal())}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-brand-200 p-5 space-y-3 text-sm">
                    <h3 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-2">
                      Data Pemesan & Penjemputan
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                      <div>
                        <span className="text-slate-wet block text-xs">Nama Lengkap</span>
                        <span className="font-semibold text-brand-900">{customer.nama}</span>
                      </div>
                      <div>
                        <span className="text-slate-wet block text-xs">Nomor WhatsApp</span>
                        <span className="font-semibold text-brand-900">{customer.telepon}</span>
                      </div>
                      <div>
                        <span className="text-slate-wet block text-xs">Metode Penyerahan</span>
                        <span className="font-semibold text-brand-900 capitalize">
                          {currentMethod === ORDER_METHODS.DIJEMPUT ? 'Dijemput Kurir Lave Streat' :
                           currentMethod === ORDER_METHODS.ANTAR_SENDIRI ? 'Antar Sendiri ke Studio Outlet' :
                           currentMethod === ORDER_METHODS.DIKIRIM ? 'Dikirim ke Alamat' : 'Ambil di Outlet'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-wet block text-xs">Jadwal</span>
                        <span className="font-semibold text-brand-900 capitalize">
                          {schedule.tanggal} ({schedule.slot})
                        </span>
                      </div>
                    </div>

                    {(currentMethod === ORDER_METHODS.DIJEMPUT || currentMethod === ORDER_METHODS.DIKIRIM) && (
                      <div className="pt-2 border-t border-brand-200/60">
                        <span className="text-slate-wet block text-xs mb-1">Alamat Penjemputan:</span>
                        <span className="font-medium text-brand-900 leading-relaxed">
                          {pickupLocation.teks || 'Sidoarjo'}
                        </span>
                      </div>
                    )}

                    {customer.catatan && (
                      <div className="pt-2 border-t border-brand-200/60">
                        <span className="text-slate-wet block text-xs mb-1">Catatan Tambahan:</span>
                        <span className="text-brand-900 italic">
                          "{customer.catatan}"
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-brand-200 p-5 shadow-xs">
                    <h3 className="text-xs font-bold text-brand-900 uppercase tracking-wider mb-3">
                      Verifikasi Keamanan
                    </h3>
                    <p className="text-xs text-slate-wet mb-4 leading-relaxed">
                      Geser potongan puzzle ke posisi yang tepat untuk memverifikasi pesanan Anda.
                    </p>
                    <SliderCaptcha
                      onSuccess={() => setCaptchaVerified(true)}
                      onFail={() => setCaptchaVerified(false)}
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-brand-100/60 border border-brand-200 text-xs text-brand-900 flex items-start gap-2.5">
                    <ShieldCheck size={20} className="text-brand-600 shrink-0 mt-0.5" />
                    <span>
                      Data pesanan Anda aman dan terenkripsi. Pembayaran dilakukan secara off-platform saat proses serah terima sepatu.
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-brand-200 flex items-center justify-between">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setStep(3)}
                  disabled={submitting}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft size={16} weight="bold" />
                  <span>Kembali ke Data</span>
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSubmitOrder}
                  disabled={submitting || !captchaVerified}
                  className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-bold"
                >
                  {submitting ? (
                    'Memproses Pesanan...'
                  ) : (
                    <>
                      <Check size={18} weight="bold" />
                      <span>Kirim Pesanan Sekarang</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 5 && createdOrder && (
          <div className="max-w-2xl mx-auto bg-white rounded-card border border-brand-200 p-8 sm:p-10 text-center shadow-md">
            <div className="w-20 h-20 rounded-full bg-success/15 text-success mx-auto flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-slate-wet block mb-1">
              Nomor Tiket Pesanan
            </span>
            <div className="text-3xl font-extrabold font-display text-brand-900 tracking-tight mb-4">
              {createdOrder.id}
            </div>

            <p className="text-slate-wet text-sm sm:text-base leading-relaxed mb-6">
              Terima kasih, <strong>{customer.nama}</strong>! Pesanan Anda telah tersimpan di sistem Lave Streat. Tim kami akan segera memverifikasi dan menghubungi nomor WhatsApp Anda untuk koordinasi jadwal dan penjemputan sepatu.
            </p>

            <div className="bg-brand-light/60 rounded-2xl border border-brand-200 p-5 text-left text-xs sm:text-sm space-y-2 mb-8">
              <div className="flex justify-between py-1">
                <span className="text-slate-wet">Pemesan:</span>
                <span className="font-semibold text-brand-900">{customer.nama}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-wet">Metode:</span>
                <span className="font-semibold text-brand-900 capitalize">{createdOrder.metode?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between py-1 border-t border-brand-200/60 pt-2">
                <span className="text-slate-wet">Estimasi Biaya:</span>
                <span className="text-base font-bold text-brand-600">{formatPrice(createdOrder.total_harga)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                  `Halo Lave Streat, saya baru saja membuat pesanan di website dengan nomor tiket ${createdOrder.id} atas nama ${customer.nama}. Mohon konfirmasinya.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 font-semibold rounded-full bg-success hover:bg-emerald-700 text-white px-6 py-3.5 text-sm transition-all duration-150 active:scale-[0.98] shadow-xs"
              >
                <MessageCircle className="w-5 h-5 shrink-0" />
                <span>Konfirmasi via WhatsApp</span>
              </a>

              <Link to="/">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Kembali ke Beranda
                </Button>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
