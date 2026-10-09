import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  InstagramLogo, 
  Clock, 
  ArrowSquareOut
} from '@phosphor-icons/react';
import { MessageCircle, Mail, ExternalLink, CornerUpRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { SliderCaptchaModal } from '../../components/common/SliderCaptchaModal';
import { settingsApi } from '../../lib/api';
import { DEFAULT_OUTLET_LOCATION } from '../../lib/constants';

export function ContactPage() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({
    nama: '',
    kontak: '',
    jenisSepatu: 'Sneakers Kanvas',
    kebutuhan: 'Cuci Bersih (Deep Clean)',
    catatan: ''
  });
  const [captchaAction, setCaptchaAction] = useState(null);
  const [isCaptchaOpen, setIsCaptchaOpen] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const s = await settingsApi.getSettings();
        setSettings(s);
      } catch {
      }
    }
    loadSettings();
  }, []);

  const validateForm = () => {
    if (!form.nama.trim()) {
      setFormError('Nama lengkap wajib diisi.');
      return false;
    }
    if (!form.kontak.trim()) {
      setFormError('Nomor WhatsApp atau Email wajib diisi.');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleTriggerReachOut = (channel) => {
    if (!validateForm()) return;
    setCaptchaAction(channel);
    setIsCaptchaOpen(true);
  };

  const handleCaptchaSuccess = () => {
    const outletPhone = settings?.contact_phone || settings?.phone || '085128024120';
    const cleanPhone = outletPhone.replace(/[^0-9]/g, '').replace(/^0/, '62');
    const outletEmail = settings?.contact_email || settings?.email || 'lavestreat@gmail.com';

    if (captchaAction === 'wa') {
      const text = `Halo Lave Streat, saya ${form.nama} (${form.kontak}). Saya ingin konsultasi ${form.kebutuhan} untuk sepatu ${form.jenisSepatu}.${form.catatan ? ' Catatan: ' + form.catatan : ''}`;
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    } else if (captchaAction === 'email') {
      const subject = `Konsultasi ${form.kebutuhan} - ${form.nama}`;
      const body = `Halo Lave Streat,\n\nNama: ${form.nama}\nKontak: ${form.kontak}\nJenis Sepatu: ${form.jenisSepatu}\nKebutuhan Layanan: ${form.kebutuhan}\n\nCatatan:\n${form.catatan || 'Mohon informasi estimasi pengerjaan dan penjemputan.'}\n\nTerima kasih.`;
      const mailtoUrl = `mailto:${outletEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
    }
  };

  return (
    <div className="bg-brand-light min-h-screen page-smooth-enter">
      <PageHeader
        title="Kontak & Lokasi"
        breadcrumb={[{ label: 'Kontak' }]}
        subtitle="Pilih jalur komunikasi langsung via WhatsApp atau Email resmi. Kurir kami siap melayani penjemputan dan pengantaran Sidoarjo dan Surabaya."
        bgImage="/hero-sneaker.jpg"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between bg-white rounded-xl border border-brand-200 p-6 sm:p-8 shadow-subtle">
            <div>
              <div className="pb-4 mb-6 border-b border-brand-200/60">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-900 tracking-tight">
                  Formulir Konsultasi Cepat
                </h2>
                <p className="text-xs sm:text-sm text-slate-wet mt-1">
                  Isi data singkat berikut untuk menghubungkan langsung percakapan Anda dengan tim teknis Lave Streat.
                </p>
              </div>

              {formError && (
                <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                  {formError}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={form.nama}
                      onChange={(e) => setForm({ ...form, nama: e.target.value })}
                      placeholder="Nama lengkap Anda"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-200 rounded-lg text-sm text-ink-deep focus:bg-white focus:border-brand-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                      WhatsApp / Email *
                    </label>
                    <input
                      type="text"
                      value={form.kontak}
                      onChange={(e) => setForm({ ...form, kontak: e.target.value })}
                      placeholder="0812xxxx atau email Anda"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-200 rounded-lg text-sm text-ink-deep focus:bg-white focus:border-brand-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                      Jenis Bahan Sepatu
                    </label>
                    <select
                      value={form.jenisSepatu}
                      onChange={(e) => setForm({ ...form, jenisSepatu: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-200 rounded-lg text-sm text-ink-deep focus:bg-white focus:border-brand-600 focus:outline-none transition-colors"
                    >
                      <option value="Sneakers Kanvas">Sneakers Kanvas</option>
                      <option value="Kulit Asli / Sintetis">Kulit Asli / Sintetis</option>
                      <option value="Suede / Nubuck">Suede / Nubuck</option>
                      <option value="Sepatu Lari / Knit">Sepatu Lari / Knit</option>
                      <option value="Slip On / Casual">Slip On / Casual</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                      Kebutuhan Perawatan
                    </label>
                    <select
                      value={form.kebutuhan}
                      onChange={(e) => setForm({ ...form, kebutuhan: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-200 rounded-lg text-sm text-ink-deep focus:bg-white focus:border-brand-600 focus:outline-none transition-colors"
                    >
                      <option value="Cuci Bersih (Deep Clean)">Cuci Bersih (Deep Clean)</option>
                      <option value="Unyellowing Sol Menguning">Unyellowing Sol Menguning</option>
                      <option value="Repaint / Pewarnaan Ulang">Repaint / Pewarnaan Ulang</option>
                      <option value="Fast Clean Express">Fast Clean Express</option>
                      <option value="Pembelian Sabun / Parfum Sepatu">Pembelian Sabun / Parfum Sepatu</option>
                      <option value="Tanya Estimasi / Konsultasi Kerusakan">Tanya Estimasi / Konsultasi Kerusakan</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                    Catatan Tambahan (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    value={form.catatan}
                    onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                    placeholder="Jelaskan kondisi noda, warna yang diinginkan, atau alamat penjemputan Anda."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-200 rounded-lg text-sm text-ink-deep focus:bg-white focus:border-brand-600 focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-brand-200/60">
              <span className="text-xs font-bold text-brand-900 uppercase tracking-wider block mb-2.5">
                Kirim Konsultasi Langsung:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTriggerReachOut('wa')}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Kirim via WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTriggerReachOut('email')}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-brand-900 hover:bg-brand-800 text-white font-semibold text-sm transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                >
                  <Mail className="w-4 h-4" />
                  <span>Kirim via Email Resmi</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between bg-white rounded-xl border border-brand-200 p-6 sm:p-8 shadow-subtle">
            <div>
              <div className="pb-4 mb-5 border-b border-brand-200/60">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-900 tracking-tight">
                  Informasi Workshop
                </h2>
                <p className="text-xs sm:text-sm text-slate-wet mt-1">
                  Kunjungi workshop kami langsung atau hubungi tim operasional pada jam kerja.
                </p>
              </div>

              <div className="flex flex-col gap-3.5 text-xs sm:text-sm text-slate-700 mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-brand-600 flex items-center justify-center shrink-0 border border-slate-200">
                    <MapPin size={17} weight="bold" />
                  </div>
                  <div>
                    <strong className="block text-brand-900 font-semibold">Lokasi Workshop</strong>
                    <span className="text-slate-wet">{settings?.outlet_address || DEFAULT_OUTLET_LOCATION.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-brand-600 flex items-center justify-center shrink-0 border border-slate-200">
                    <Clock size={17} weight="bold" />
                  </div>
                  <div>
                    <strong className="block text-brand-900 font-semibold">Jam Operasional</strong>
                    <span className="text-slate-wet">{settings?.jam_operasional || settings?.opening_hours || 'Setiap Hari: 09.00 - 18.00 WIB'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-brand-600 flex items-center justify-center shrink-0 border border-slate-200">
                    <Phone size={17} weight="bold" />
                  </div>
                  <div>
                    <strong className="block text-brand-900 font-semibold">Telepon & CS</strong>
                    <span className="text-slate-wet">{settings?.contact_phone || settings?.phone || '+62 851-2802-4120'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-brand-600 flex items-center justify-center shrink-0 border border-slate-200">
                    <InstagramLogo size={17} weight="bold" />
                  </div>
                  <div>
                    <strong className="block text-brand-900 font-semibold">Instagram</strong>
                    <a
                      href="https://www.instagram.com/lave_streat/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:text-brand-900 font-semibold inline-flex items-center gap-1"
                    >
                      <span>@lave_streat</span>
                      <ArrowSquareOut size={13} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-200/60 flex flex-col grow">
              <span className="text-xs font-semibold text-brand-900 uppercase tracking-wider block mb-2">
                Peta Titik Outlet:
              </span>
              <div className="w-full min-h-[280px] grow rounded-lg overflow-hidden border border-brand-200 shadow-2xs relative bg-slate-100">
                <iframe
                  title="Lokasi Workshop Lave Streat Google Maps"
                  src={`https://maps.google.com/maps?q=${settings?.outlet_lat ?? DEFAULT_OUTLET_LOCATION.lat},${settings?.outlet_lng ?? DEFAULT_OUTLET_LOCATION.lng}&hl=id&z=16&output=embed`}
                  className="w-full h-full min-h-[280px] border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />

                <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-xs rounded-lg shadow-md border border-slate-200/80 p-3 max-w-[260px] sm:max-w-[290px] text-left">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug truncate">
                        Lave Streat Shoe Care
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                        {settings?.outlet_address || DEFAULT_OUTLET_LOCATION.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${settings?.outlet_lat ?? DEFAULT_OUTLET_LOCATION.lat},${settings?.outlet_lng ?? DEFAULT_OUTLET_LOCATION.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Buka di Google Maps"
                        aria-label="Buka di Google Maps"
                        className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-blue-600 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${settings?.outlet_lat ?? DEFAULT_OUTLET_LOCATION.lat},${settings?.outlet_lng ?? DEFAULT_OUTLET_LOCATION.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Petunjuk Arah"
                        aria-label="Petunjuk Arah"
                        className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                      >
                        <CornerUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-700 pt-1.5 border-t border-slate-100">
                    <span className="font-bold text-slate-900">5.0</span>
                    <span className="text-amber-500 font-bold">&#9733;</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${settings?.outlet_lat ?? -7.4338},${settings?.outlet_lng ?? 112.7214}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      (48)
                    </a>
                    <span className="text-slate-400 text-[10px] ml-0.5" title="Informasi Terverifikasi">&#9432;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SliderCaptchaModal
        isOpen={isCaptchaOpen}
        onClose={() => setIsCaptchaOpen(false)}
        onSuccess={handleCaptchaSuccess}
        title={captchaAction === 'wa' ? 'Verifikasi Sebelum Buka WhatsApp' : 'Verifikasi Sebelum Buka Email'}
      />
    </div>
  );
}
