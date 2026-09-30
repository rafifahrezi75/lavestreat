import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, EnvelopeSimple, InstagramLogo, Clock, ArrowRight } from '@phosphor-icons/react';

export function PublicFooter({ settings }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-900 text-slate-300 pt-16 pb-20 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white shadow-xs flex items-center justify-center p-1 shrink-0">
                <img src="/logo.png" alt="Lave Streat Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl text-white tracking-tight">
                  Lave Streat
                </span>
                <span className="text-[10px] tracking-widest uppercase text-slate-400 font-medium leading-none">
                  L.A.V.E Treatment
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Studio perawatan, repaint, dan restorasi sepatu profesional dengan layanan antar-jemput area Sidoarjo dan Surabaya. Bersih, higienis, dan terpercaya.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Navigasi Halaman
            </h4>
            <div className="flex flex-col gap-2 text-sm text-slate-400">
              <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
              <Link to="/tentang-kami" className="hover:text-white transition-colors">Tentang Kami</Link>
              <Link to="/layanan" className="hover:text-white transition-colors">Katalog Layanan</Link>
              <Link to="/galeri" className="hover:text-white transition-colors">Galeri Hasil</Link>
              <Link to="/kontak" className="hover:text-white transition-colors">Lokasi & Kontak</Link>
              <Link
                to="/pesan"
                className="text-left hover:text-white transition-colors font-medium text-blue-400 mt-1 inline-flex items-center gap-1.5"
              >
                <span>Pesan Penjemputan</span>
                <ArrowRight size={13} className="shrink-0" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Lokasi & Jam Kerja
            </h4>
            <div className="flex flex-col gap-2.5 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin size={17} className="text-slate-400 shrink-0 mt-0.5" />
                <span>{settings?.outlet_address || 'Jl. Raya Ponti No. 18, Sidoarjo'}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock size={17} className="text-slate-400 shrink-0 mt-0.5" />
                <span>{settings?.jam_operasional || 'Setiap Hari: 09.00 - 21.00 WIB'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Hubungi Kami
            </h4>
            <div className="flex flex-col gap-2.5 text-sm text-slate-400">
              <a
                href={`https://wa.me/62${(settings?.contact_phone || '81234567890').replace(/^0/, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <Phone size={17} className="text-slate-400" />
                <span>WhatsApp: {settings?.contact_phone || '081234567890'}</span>
              </a>
              <a
                href={`mailto:${settings?.contact_email || 'halo@lavestreat.com'}`}
                className="flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <EnvelopeSimple size={17} className="text-slate-400" />
                <span>{settings?.contact_email || 'halo@lavestreat.com'}</span>
              </a>
              <a
                href={`https://instagram.com/${settings?.instagram || 'lave_streat'}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <InstagramLogo size={17} className="text-slate-400" />
                <span>@{settings?.instagram || 'lave_streat'}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} Lave Streat. Hak cipta dilindungi.</p>
          <div className="flex items-center gap-4">
            <Link to="/admin/login" className="hover:text-slate-300 transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
