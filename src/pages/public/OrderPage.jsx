import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Check, 
  Plus, 
  Minus, 
  Truck, 
  Storefront, 
  Package, 
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Printer
} from '@phosphor-icons/react';
import { MessageCircle, CheckCircle2, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { LocationPicker } from '../../components/map/LocationPicker';
import { SliderCaptchaModal } from '../../components/common/SliderCaptchaModal';
import { PageHeader } from '../../components/common/PageHeader';
import { useToast } from '../../context/ToastContext';
import { servicesApi, ordersApi, settingsApi } from '../../lib/api';
import { ORDER_METHODS, DEFAULT_OUTLET_LOCATION } from '../../lib/constants';
import { printOrderReceipt, downloadOrderReceiptPdf } from '../../lib/orderReceiptPdf';

function getLocalDateString(offsetDays = 0) {
  const d = new Date();
  if (offsetDays) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function OrderPage() {
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('service');
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [waRedirectUrl, setWaRedirectUrl] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isCaptchaOpen, setIsCaptchaOpen] = useState(false);

  const [selectedItems, setSelectedItems] = useState({});
  const [method, setMethod] = useState('');
  const [customer, setCustomer] = useState({
    nama: '',
    telepon: '',
    email: '',
    catatan: ''
  });
  const [schedule, setSchedule] = useState({
    tanggal: getLocalDateString(1),
    slot: 'pagi'
  });
  const [pickupLocation, setPickupLocation] = useState({
    teks: '',
    lat: DEFAULT_OUTLET_LOCATION.lat,
    lng: DEFAULT_OUTLET_LOCATION.lng
  });

  useEffect(() => {
    async function loadData() {
      setLoadingServices(true);
      try {
        const [list, sets] = await Promise.all([
          servicesApi.getServices(true),
          settingsApi.getSettings().catch(() => null)
        ]);
        setServices(list);
        if (sets) {
          setSettings(sets);
        }

        if (preselectedServiceId) {
          const decoded = decodeURIComponent(preselectedServiceId).trim().toLowerCase();
          const matched = list.find(s =>
            s.id === preselectedServiceId ||
            s.nama.toLowerCase() === decoded ||
            s.nama.toLowerCase().includes(decoded) ||
            decoded.includes(s.nama.toLowerCase())
          );
          if (matched) {
            setSelectedItems({ [matched.id]: 1 });
          } else if (preselectedServiceId === 'srv-unyellowing') {
            setCustomer(c => ({
              ...c,
              catatan: c.catatan ? c.catatan : 'Permintaan Add-on: Unyellowing Treat (+Rp25.000)'
            }));
          } else if (preselectedServiceId === 'srv-fast-track') {
            setCustomer(c => ({
              ...c,
              catatan: c.catatan ? c.catatan : 'Permintaan Add-on: Fast Track (+Rp15.000)'
            }));
          }
        }

        const brandParam = searchParams.get('brand');
        if (brandParam) {
          const decodedBrand = decodeURIComponent(brandParam).trim();
          setCustomer(c => ({
            ...c,
            catatan: c.catatan ? `${c.catatan} (Sepatu: ${decodedBrand})` : `Sepatu: ${decodedBrand}`
          }));
        }
      } catch {
        showToast('Gagal memuat katalog layanan.', 'danger');
      } finally {
        setLoadingServices(false);
      }
    }

    loadData();
  }, [preselectedServiceId, searchParams, showToast]);

  const hasShoeTreatment = Object.keys(selectedItems).some(id => {
    const s = services.find(item => item.id === id);
    return s && (s.kategori === 'cuci' || s.kategori === 'repaint');
  });

  const validMethods = hasShoeTreatment
    ? [ORDER_METHODS.DIJEMPUT, ORDER_METHODS.ANTAR_SENDIRI]
    : [ORDER_METHODS.DIKIRIM, ORDER_METHODS.AMBIL_SENDIRI];

  const defaultMethod = hasShoeTreatment ? ORDER_METHODS.DIJEMPUT : ORDER_METHODS.DIKIRIM;
  const currentMethod = (method && validMethods.includes(method)) ? method : defaultMethod;

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
    if (totalItemCount === 0) {
      showToast('Pilih minimal satu layanan atau produk sebelum melanjutkan.', 'danger');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleNextFromStep2 = () => {
    setCurrentStep(3);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleNextFromStep3 = () => {
    if (!customer.nama.trim()) {
      showToast('Nama lengkap pemesan wajib diisi.', 'danger');
      return;
    }

    if (!customer.telepon.trim()) {
      showToast('Nomor WhatsApp wajib diisi untuk koordinasi jadwal.', 'danger');
      return;
    }

    const needsAddress = currentMethod === ORDER_METHODS.DIJEMPUT || currentMethod === ORDER_METHODS.DIKIRIM;
    if (needsAddress && !pickupLocation.teks.trim()) {
      showToast('Alamat lokasi penjemputan atau pengantaran wajib diisi.', 'danger');
      return;
    }

    setCurrentStep(4);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleInitiateOrder = () => {
    if (totalItemCount === 0) {
      showToast('Pilih minimal satu layanan atau produk sebelum memesan.', 'danger');
      setCurrentStep(1);
      return;
    }

    if (!customer.nama.trim() || !customer.telepon.trim()) {
      showToast('Lengkapi data kontak pemesan sebelum mengirim pesanan.', 'danger');
      setCurrentStep(3);
      return;
    }

    const needsAddress = currentMethod === ORDER_METHODS.DIJEMPUT || currentMethod === ORDER_METHODS.DIKIRIM;
    if (needsAddress && !pickupLocation.teks.trim()) {
      showToast('Alamat lokasi penjemputan atau pengantaran wajib diisi.', 'danger');
      setCurrentStep(3);
      return;
    }

    setIsCaptchaOpen(true);
  };

  const handleCaptchaSuccess = async () => {
    setIsCaptchaOpen(false);
    setSubmitting(true);

    const needsAddress = currentMethod === ORDER_METHODS.DIJEMPUT || currentMethod === ORDER_METHODS.DIKIRIM;
    const itemsPayload = Object.entries(selectedItems).map(([service_id, qty]) => ({
      service_id,
      qty
    }));

    const now = new Date();
    const orderId = 'ORD-' + now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + '-' + Math.floor(1000 + Math.random() * 9000);

    const itemLines = itemsPayload.map((it, idx) => {
      const s = services.find(x => x.id === it.service_id);
      const name = s ? s.nama : 'Layanan';
      const price = s ? s.harga * it.qty : 0;
      return `${idx + 1}. ${name} (${it.qty}x) - ${formatPrice(price)}`;
    }).join('\n');

    const addressText = needsAddress && pickupLocation?.teks ? `\n*Alamat:* ${pickupLocation.teks}` : '';
    const notesText = customer.catatan ? `\n*Catatan:* ${customer.catatan}` : '';

    const waMessage = `Halo Lave Streat, saya membuat pesanan melalui website:

*Nomor Tiket:* ${orderId}
*Nama Pemesan:* ${customer.nama}
*WhatsApp:* ${customer.telepon}
*Metode:* ${(currentMethod || '').replace(/_/g, ' ').toUpperCase()}
*Jadwal:* ${schedule.tanggal} (${schedule.slot})${addressText}${notesText}

*Rincian Layanan:*
${itemLines}

*Total Estimasi:* ${formatPrice(calculateSubtotal())}

Mohon konfirmasi dan informasi tindak lanjut penjemputan/pengerjaan sepatu saya. Terima kasih!`;

    const targetWaNumber = (settings?.outlet_whatsapp || '6285128024120').replace(/\D/g, '');
    const waUrl = `https://wa.me/${targetWaNumber}?text=${encodeURIComponent(waMessage)}`;
    setWaRedirectUrl(waUrl);

    try {
      const payload = {
        id: orderId,
        pelanggan: customer,
        items: itemsPayload,
        metode: currentMethod,
        alamat_jemput: currentMethod === ORDER_METHODS.DIJEMPUT ? pickupLocation : null,
        alamat_antar: (currentMethod === ORDER_METHODS.DIJEMPUT || currentMethod === ORDER_METHODS.DIKIRIM) ? pickupLocation : null,
        jadwal_tanggal: schedule.tanggal,
        jadwal_slot: schedule.slot,
        catatan: customer.catatan
      };

      const res = await ordersApi.createOrder(payload);
      setCreatedOrder(res);
      showToast('Pesanan berhasil! Struk sedang diunduh...', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      try {
        await downloadOrderReceiptPdf(res);
      } catch {
      }
    } catch (err) {
      showToast(err.message || 'Gagal mengirim pesanan. Silakan periksa koneksi Anda dan coba lagi.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light/30 pb-20 page-smooth-enter">
      <PageHeader
        title={createdOrder ? 'Pesanan Berhasil' : 'Formulir Pemesanan'}
        breadcrumb={[{ label: 'Pemesanan' }]}
        subtitle={createdOrder
          ? 'Terima kasih atas pesanan Anda. Tim teknisi dan kurir kami akan segera memproses.'
          : 'Layanan cuci, pembersihan mendalam, dan sabun perawatan sepatu dengan fasilitas antar-jemput Sidoarjo dan Surabaya.'
        }
        bgImage="/services/white-clean.jpg"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {createdOrder ? (
          <div className="bg-white rounded-md border border-brand-200 p-6 sm:p-10 text-center shadow-xs">
            <div className="w-14 h-14 rounded-md bg-success/15 text-success mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-wet block mb-1">
              Nomor Tiket Pesanan
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-brand-900 tracking-tight mb-3">
              {createdOrder.id}
            </div>

            <p className="text-slate-wet text-sm sm:text-base leading-relaxed mb-6">
              Terima kasih, <strong className="text-brand-900">{customer.nama}</strong>. Pesanan Anda berhasil disimpan di sistem Lave Streat. Tim kami akan segera menghubungi nomor WhatsApp Anda untuk konfirmasi jadwal.
            </p>

            <div className="bg-slate-50 rounded-md border border-brand-200 p-4 sm:p-5 text-left text-xs sm:text-sm space-y-2 mb-6">
              <div className="flex justify-between py-1">
                <span className="text-slate-wet">Pemesan:</span>
                <span className="font-semibold text-brand-900">{customer.nama}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-wet">Nomor WhatsApp:</span>
                <span className="font-semibold text-brand-900">{customer.telepon}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-wet">Metode:</span>
                <span className="font-semibold text-brand-900 capitalize">{createdOrder.metode?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-wet">Jadwal:</span>
                <span className="font-semibold text-brand-900">{schedule.tanggal} ({schedule.slot})</span>
              </div>
              <div className="flex justify-between py-1 border-t border-brand-200/60 pt-2">
                <span className="text-slate-wet">Total Estimasi:</span>
                <span className="text-base font-bold text-brand-600">{formatPrice(createdOrder.total_harga)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center flex-wrap">
              <Button
                variant="primary"
                size="md"
                className="rounded-md bg-brand-900 hover:bg-brand-950 text-white flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 shadow-xs"
                onClick={() => downloadOrderReceiptPdf(createdOrder)}
              >
                <Printer size={16} weight="bold" />
                <span>Unduh Struk PDF</span>
              </Button>

              <a
                href={waRedirectUrl || `https://wa.me/${(settings?.outlet_whatsapp || '6285128024120').replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Halo Lave Streat, saya membuat pesanan di website dengan nomor tiket ${createdOrder.id} atas nama ${customer.nama}. Mohon konfirmasinya.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 font-semibold rounded-md bg-success hover:bg-emerald-700 text-white px-5 py-2.5 text-sm transition-all duration-150 active:scale-[0.98] shadow-xs w-full sm:w-auto"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>Buka WhatsApp</span>
              </a>

              <Button
                variant="secondary"
                size="md"
                className="rounded-md w-full sm:w-auto"
                onClick={() => {
                  setCreatedOrder(null);
                  setSelectedItems({});
                  setCurrentStep(1);
                }}
              >
                Buat Pesanan Baru
              </Button>

              <Link to="/" className="w-full sm:w-auto">
                <Button variant="ghost" size="md" className="rounded-md w-full">
                  Kembali ke Beranda
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-md border border-brand-200 shadow-xs overflow-hidden">
            <div className="bg-snow-foam/70 border-b border-brand-200 px-5 sm:px-7 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-brand-900 flex items-center gap-2">
                    <span>Formulir Pemesanan</span>
                  </h2>
                  <p className="text-xs text-slate-wet mt-0.5">
                    Lengkapi langkah pemesanan di bawah ini secara bertahap.
                  </p>
                </div>
                <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-md bg-brand-100 text-brand-900 border border-brand-200 self-start sm:self-auto">
                  Area Sidoarjo & Surabaya
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {[
                  { num: 1, title: '1. Layanan' },
                  { num: 2, title: '2. Metode' },
                  { num: 3, title: '3. Data & Waktu' },
                  { num: 4, title: '4. Ringkasan' }
                ].map((s) => {
                  const isDone = currentStep > s.num;
                  const isCurrent = currentStep === s.num;
                  return (
                    <div
                      key={s.num}
                      className={`p-2.5 rounded-md border transition-all ${
                        isCurrent
                          ? 'bg-white border-brand-600 shadow-xs ring-1 ring-brand-600/30'
                          : isDone
                          ? 'bg-brand-100/60 border-brand-200 text-brand-900'
                          : 'bg-white/60 border-brand-200/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                            isDone
                              ? 'bg-success text-white'
                              : isCurrent
                              ? 'bg-brand-600 text-white'
                              : 'bg-slate-200 text-slate-wet'
                          }`}
                        >
                          {isDone ? <Check size={12} weight="bold" /> : s.num}
                        </span>
                        <span className={`text-xs font-bold truncate ${isCurrent ? 'text-brand-900' : 'text-slate-wet'}`}>
                          {s.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-5 sm:p-7">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-brand-200/80">
                    <h3 className="font-bold text-sm sm:text-base text-brand-900">
                      Langkah 1: Pilih Layanan & Produk
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-brand-100 text-brand-900 border border-brand-200 shrink-0">
                      {totalItemCount} item dipilih
                    </span>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-brand-200 rounded-md text-xs sm:text-sm font-medium text-brand-900 hover:border-brand-600 transition-colors shadow-2xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-wet text-xs">Filter Kategori:</span>
                        <span className="font-bold text-brand-900">
                          {[
                            { id: 'all', label: 'Semua Layanan & Produk' },
                            { id: 'cuci', label: 'Cuci & Treatment' },
                            { id: 'sabun', label: 'Produk Perawatan' }
                          ].find((c) => c.id === activeCategory)?.label || 'Semua Layanan & Produk'}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-wet transition-transform duration-200 ${
                          isFilterDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isFilterDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setIsFilterDropdownOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white rounded-md border border-brand-200 shadow-lg py-1 animate-in fade-in zoom-in-95 duration-150">
                          {[
                            { id: 'all', label: 'Semua Layanan & Produk' },
                            { id: 'cuci', label: 'Cuci & Treatment' },
                            { id: 'sabun', label: 'Produk Perawatan' }
                          ].map((opt) => {
                            const isSelected = activeCategory === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  setActiveCategory(opt.id);
                                  setIsFilterDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-brand-50 text-brand-900 font-bold'
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span>{opt.label}</span>
                                {isSelected && (
                                  <Check size={14} weight="bold" className="text-brand-600 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {loadingServices ? (
                    <div className="py-12 text-center text-xs text-slate-wet bg-slate-50 rounded-md border border-brand-200">
                      Memuat daftar layanan Lave Streat...
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                      {filteredServices.map((service) => {
                        const qty = selectedItems[service.id] || 0;
                        const isSelected = qty > 0;
                        return (
                          <div
                            key={service.id}
                            className={`rounded-md border p-2.5 sm:p-3 flex flex-col justify-between transition-all ${
                              isSelected
                                ? 'border-brand-600 bg-brand-100/15 ring-1 ring-brand-600/30'
                                : 'border-brand-200 hover:border-brand-600/40 bg-white'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start mb-2">
                              <img
                                src={service.foto || '/services/deep-clean.jpg'}
                                alt={service.nama}
                                onError={(e) => {
                                  e.currentTarget.src = '/services/deep-clean.jpg';
                                }}
                                className="w-full sm:w-16 h-24 sm:h-16 rounded-md object-cover bg-brand-100 border border-brand-200 shrink-0"
                              />
                              <div className="min-w-0 flex-1 w-full">
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-[9px] sm:text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-brand-100 text-brand-900 border border-brand-200 truncate">
                                    {service.kategori === 'sabun' ? 'Produk' : service.kategori}
                                  </span>
                                </div>
                                <h4 className="font-bold text-xs sm:text-sm text-brand-900 line-clamp-1">
                                  {service.nama}
                                </h4>
                                <p className="text-[10px] sm:text-[11px] text-slate-wet line-clamp-1 mt-0.5">
                                  {service.deskripsi}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-brand-200/60 mt-auto gap-1">
                              <div className="min-w-0">
                                <span className="text-[11px] sm:text-sm font-bold text-brand-600 block leading-tight">
                                  {formatPrice(service.harga)}
                                </span>
                                <span className="text-[9px] sm:text-[11px] text-slate-wet block leading-none">/{service.satuan}</span>
                              </div>

                              <div className="shrink-0">
                                {isSelected ? (
                                  <div className="flex items-center gap-1 bg-white border border-brand-200 rounded-md p-0.5">
                                    <button
                                      type="button"
                                      onClick={() => handleQtyChange(service.id, -1)}
                                      className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-brand-100 text-brand-900 flex items-center justify-center hover:bg-brand-200 transition-colors"
                                      aria-label="Kurangi kuantitas"
                                    >
                                      <Minus size={10} weight="bold" />
                                    </button>
                                    <span className="text-[11px] sm:text-xs font-bold w-4 sm:w-5 text-center text-brand-900">
                                      {qty}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleQtyChange(service.id, 1)}
                                      className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-brand-600 text-white flex items-center justify-center hover:bg-brand-900 transition-colors"
                                      aria-label="Tambah kuantitas"
                                    >
                                      <Plus size={10} weight="bold" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleQtyChange(service.id, 1)}
                                    className="px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold bg-brand-100/60 hover:bg-brand-100 text-brand-900 border border-brand-200 transition-colors whitespace-nowrap"
                                  >
                                    + Pilih
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="pt-4 border-t border-brand-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-slate-wet">
                      Subtotal: <strong className="text-brand-900 text-sm">{formatPrice(calculateSubtotal())}</strong> ({totalItemCount} item)
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleNextFromStep1}
                      className="w-full sm:w-auto rounded-md font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-900 text-white"
                    >
                      <span>Lanjutkan</span>
                      <ArrowRight size={16} weight="bold" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="pb-3 border-b border-brand-200/80">
                    <h3 className="font-bold text-sm sm:text-base text-brand-900">
                      Langkah 2: Pilih Metode Penyerahan
                    </h3>
                    <p className="text-xs text-slate-wet mt-0.5">
                      Pilih bagaimana barang diserahkan antara Anda dan tim Lave Streat.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {hasShoeTreatment ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setMethod(ORDER_METHODS.DIJEMPUT)}
                          className={`rounded-md border p-4 text-left transition-all relative ${
                            currentMethod === ORDER_METHODS.DIJEMPUT
                              ? 'border-brand-600 bg-brand-100/25 ring-1 ring-brand-600/30'
                              : 'border-brand-200 hover:border-brand-600/40 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-9 h-9 rounded-md bg-brand-600 text-white flex items-center justify-center">
                              <Truck size={20} weight="bold" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-600 text-white px-2 py-0.5 rounded-md">
                              Rekomendasi
                            </span>
                          </div>
                          <div className="font-bold text-sm text-brand-900 mb-0.5">
                            Dijemput Kurir Lave Streat
                          </div>
                          <p className="text-xs text-slate-wet leading-relaxed">
                            Kurir kami mengambil sepatu langsung ke rumah atau kantor Anda di area Sidoarjo dan Surabaya.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMethod(ORDER_METHODS.ANTAR_SENDIRI)}
                          className={`rounded-md border p-4 text-left transition-all ${
                            currentMethod === ORDER_METHODS.ANTAR_SENDIRI
                              ? 'border-brand-600 bg-brand-100/25 ring-1 ring-brand-600/30'
                              : 'border-brand-200 hover:border-brand-600/40 bg-white'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-md bg-brand-100 text-brand-900 flex items-center justify-center mb-2">
                            <Storefront size={20} weight="bold" />
                          </div>
                          <div className="font-bold text-sm text-brand-900 mb-0.5">
                            Antar Sendiri ke Outlet
                          </div>
                          <p className="text-xs text-slate-wet leading-relaxed">
                            Anda mengantar langsung ke studio Lave Streat di {settings?.outlet_address || DEFAULT_OUTLET_LOCATION.address}.
                          </p>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setMethod(ORDER_METHODS.DIKIRIM)}
                          className={`rounded-md border p-4 text-left transition-all ${
                            currentMethod === ORDER_METHODS.DIKIRIM
                              ? 'border-brand-600 bg-brand-100/25 ring-1 ring-brand-600/30'
                              : 'border-brand-200 hover:border-brand-600/40 bg-white'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-md bg-brand-600 text-white flex items-center justify-center mb-2">
                            <Package size={20} weight="bold" />
                          </div>
                          <div className="font-bold text-sm text-brand-900 mb-0.5">
                            Dikirim Langsung ke Alamat
                          </div>
                          <p className="text-xs text-slate-wet leading-relaxed">
                            Produk sabun dan perawatan dikirim melalui kurir langsung ke alamat Anda.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMethod(ORDER_METHODS.AMBIL_SENDIRI)}
                          className={`rounded-md border p-4 text-left transition-all ${
                            currentMethod === ORDER_METHODS.AMBIL_SENDIRI
                              ? 'border-brand-600 bg-brand-100/25 ring-1 ring-brand-600/30'
                              : 'border-brand-200 hover:border-brand-600/40 bg-white'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-md bg-brand-100 text-brand-900 flex items-center justify-center mb-2">
                            <Storefront size={20} weight="bold" />
                          </div>
                          <div className="font-bold text-sm text-brand-900 mb-0.5">
                            Ambil di Outlet
                          </div>
                          <p className="text-xs text-slate-wet leading-relaxed">
                            Ambil produk secara langsung di studio Lave Streat Sidoarjo.
                          </p>
                        </button>
                      </>
                    )}
                  </div>

                  <div className="pt-4 border-t border-brand-200 flex items-center justify-between gap-3">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => setCurrentStep(1)}
                      className="rounded-md flex items-center gap-1.5"
                    >
                      <ArrowLeft size={16} weight="bold" />
                      <span>Kembali</span>
                    </Button>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleNextFromStep2}
                      className="rounded-md font-bold text-xs sm:text-sm flex items-center gap-1.5 bg-brand-600 hover:bg-brand-900 text-white"
                    >
                      <span>Lanjutkan</span>
                      <ArrowRight size={16} weight="bold" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="pb-3 border-b border-brand-200/80">
                    <h3 className="font-bold text-sm sm:text-base text-brand-900">
                      Langkah 3: Data Pemesan & Jadwal
                    </h3>
                    <p className="text-xs text-slate-wet mt-0.5">
                      Lengkapi identitas pemesan, waktu penjemputan, dan alamat pengiriman.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <Input
                        label="Nama Lengkap"
                        value={customer.nama}
                        onChange={(e) => setCustomer({ ...customer, nama: e.target.value })}
                        placeholder="Nama lengkap pemesan"
                        required
                        className="text-sm"
                      />
                      <Input
                        label="Nomor WhatsApp"
                        value={customer.telepon}
                        onChange={(e) => setCustomer({ ...customer, telepon: e.target.value })}
                        placeholder="Contoh: 081234567890"
                        required
                        className="text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <Input
                        label="Email (Opsional)"
                        type="email"
                        value={customer.email}
                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                        placeholder="nama@email.com"
                        className="text-sm"
                      />
                      <Input
                        label="Catatan Khusus (Opsional)"
                        value={customer.catatan}
                        onChange={(e) => setCustomer({ ...customer, catatan: e.target.value })}
                        placeholder="Contoh: Titip di pos satpam / noda minyak di midsole"
                        className="text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <Input
                        label="Pilih Tanggal"
                        type="date"
                        min={getLocalDateString(0)}
                        value={schedule.tanggal}
                        onChange={(e) => setSchedule({ ...schedule, tanggal: e.target.value })}
                        required
                        className="text-sm"
                      />
                      <Select
                        label="Slot Waktu"
                        value={schedule.slot}
                        onChange={(e) => setSchedule({ ...schedule, slot: e.target.value })}
                        options={[
                          { value: 'pagi', label: 'Pagi (09:00 - 12:00 WIB)' },
                          { value: 'siang', label: 'Siang (13:00 - 16:00 WIB)' },
                          { value: 'sore', label: 'Sore (16:00 - 19:00 WIB)' }
                        ]}
                        className="text-sm"
                      />
                    </div>

                    {(currentMethod === ORDER_METHODS.DIJEMPUT || currentMethod === ORDER_METHODS.DIKIRIM) && (
                      <div className="pt-2">
                        <LocationPicker
                          value={pickupLocation}
                          onChange={(loc) => setPickupLocation(loc)}
                          height="260px"
                          label={currentMethod === ORDER_METHODS.DIJEMPUT ? 'Titik Penjemputan di Peta' : 'Titik Pengiriman di Peta'}
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-brand-200 flex items-center justify-between gap-3">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => setCurrentStep(2)}
                      className="rounded-md flex items-center gap-1.5"
                    >
                      <ArrowLeft size={16} weight="bold" />
                      <span>Kembali</span>
                    </Button>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleNextFromStep3}
                      className="rounded-md font-bold text-xs sm:text-sm flex items-center gap-1.5 bg-brand-600 hover:bg-brand-900 text-white"
                    >
                      <span>Lanjutkan</span>
                      <ArrowRight size={16} weight="bold" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="pb-3 border-b border-brand-200/80">
                    <h3 className="font-bold text-sm sm:text-base text-brand-900">
                      Langkah 4: Ringkasan & Konfirmasi Pesanan
                    </h3>
                    <p className="text-xs text-slate-wet mt-0.5">
                      Periksa kembali rincian pesanan Anda sebelum mengirimkan data ke sistem.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50/80 rounded-md border border-brand-200 p-4 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-brand-200">
                        <div className="flex items-center gap-2">
                          <ShoppingBag size={18} className="text-brand-600" weight="bold" />
                          <h4 className="font-bold text-xs sm:text-sm text-brand-900">Item Layanan</h4>
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-brand-100 text-brand-900 border border-brand-200">
                          {totalItemCount} item
                        </span>
                      </div>

                      <div className="divide-y divide-brand-200/60 max-h-52 overflow-y-auto pr-1">
                        {Object.entries(selectedItems).map(([id, qty]) => {
                          const s = services.find((item) => item.id === id);
                          if (!s) return null;
                          return (
                            <div key={id} className="py-2 flex items-center justify-between text-xs">
                              <div className="min-w-0 pr-2">
                                <div className="font-bold text-brand-900 truncate">{s.nama}</div>
                                <div className="text-[11px] text-slate-wet">
                                  {qty} x {formatPrice(s.harga)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-bold text-brand-900">
                                  {formatPrice(s.harga * qty)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleQtyChange(id, -qty)}
                                  className="text-slate-wet hover:text-danger p-1 rounded-md transition-colors"
                                  title="Hapus item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2 border-t border-brand-200 flex items-center justify-between">
                        <span className="text-xs font-semibold text-brand-900">Total Estimasi:</span>
                        <span className="text-base font-bold font-display text-brand-600">
                          {formatPrice(calculateSubtotal())}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 rounded-md border border-brand-200 p-4 space-y-2.5 text-xs">
                      <h4 className="font-bold text-xs sm:text-sm text-brand-900 pb-2 border-b border-brand-200">
                        Data Pengantaran & Kontak
                      </h4>

                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-wet">Nama:</span>
                          <span className="font-semibold text-brand-900">{customer.nama}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-wet">WhatsApp:</span>
                          <span className="font-semibold text-brand-900">{customer.telepon}</span>
                        </div>
                        {customer.email && (
                          <div className="flex justify-between">
                            <span className="text-slate-wet">Email:</span>
                            <span className="font-semibold text-brand-900">{customer.email}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-wet">Metode:</span>
                          <span className="font-semibold text-brand-900 capitalize">
                            {currentMethod === ORDER_METHODS.DIJEMPUT ? 'Dijemput Kurir Lave Streat' :
                             currentMethod === ORDER_METHODS.ANTAR_SENDIRI ? 'Antar Sendiri ke Studio Outlet' :
                             currentMethod === ORDER_METHODS.DIKIRIM ? 'Dikirim Kurir ke Alamat' : 'Ambil di Outlet'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-wet">Jadwal:</span>
                          <span className="font-semibold text-brand-900">
                            {schedule.tanggal} ({schedule.slot})
                          </span>
                        </div>
                        {(currentMethod === ORDER_METHODS.DIJEMPUT || currentMethod === ORDER_METHODS.DIKIRIM) && pickupLocation.teks && (
                          <div className="pt-1 border-t border-brand-200/60 text-[11px] text-slate-wet line-clamp-2">
                            Alamat: <span className="font-medium text-brand-900">{pickupLocation.teks}</span>
                          </div>
                        )}
                        {customer.catatan && (
                          <div className="pt-1 border-t border-brand-200/60 text-[11px] text-slate-wet italic">
                            Catatan: {customer.catatan}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-md bg-brand-light/60 border border-brand-200 flex items-start gap-2.5 text-xs text-brand-900">
                    <ShieldCheck size={20} className="text-brand-600 shrink-0 mt-0.5" />
                    <span>
                      Verifikasi puzzle keamanan akan muncul setelah tombol Pesan Sekarang ditekan untuk mencegah bot dan spam. Pembayaran dilakukan secara off-platform saat proses serah terima.
                    </span>
                  </div>

                  <div className="pt-4 border-t border-brand-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => setCurrentStep(3)}
                      className="w-full sm:w-auto rounded-md flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft size={16} weight="bold" />
                      <span>Kembali</span>
                    </Button>

                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleInitiateOrder}
                      disabled={submitting || totalItemCount === 0}
                      className="w-full sm:w-auto rounded-md font-bold text-sm px-6 h-11 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-900 text-white shadow-xs"
                    >
                      {submitting ? (
                        'Memproses Pesanan...'
                      ) : (
                        <>
                          <Check size={18} weight="bold" />
                          <span>Pesan Sekarang</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      <SliderCaptchaModal
        isOpen={isCaptchaOpen}
        onClose={() => setIsCaptchaOpen(false)}
        onSuccess={handleCaptchaSuccess}
        title="Verifikasi Keamanan Pemesanan"
      />
    </div>
  );
}
