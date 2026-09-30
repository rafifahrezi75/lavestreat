import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  House, 
  Sparkle, 
  Images, 
  ChatCircleDots,
  Truck
} from '@phosphor-icons/react';

export function PublicBottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isHome = currentPath === '/';
  const isLayanan = currentPath.startsWith('/layanan');
  const isPesan = currentPath.startsWith('/pesan');
  const isGaleri = currentPath.startsWith('/galeri');
  const isKontak = currentPath.startsWith('/kontak');

  return (
    <nav 
      aria-label="Navigasi Bawah Mobile"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-200/80 shadow-[0_-4px_20px_rgba(10,61,102,0.08)] md:hidden transition-transform duration-200"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2 relative">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isHome ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <House 
            size={22} 
            weight={isHome ? 'fill' : 'regular'} 
            className="transition-transform active:scale-90"
          />
          <span className={`text-[10px] leading-none ${isHome ? 'font-bold' : 'font-medium'}`}>
            Beranda
          </span>
        </Link>

        <Link
          to="/layanan"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isLayanan ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Sparkle 
            size={22} 
            weight={isLayanan ? 'fill' : 'regular'} 
            className="transition-transform active:scale-90"
          />
          <span className={`text-[10px] leading-none ${isLayanan ? 'font-bold' : 'font-medium'}`}>
            Layanan
          </span>
        </Link>

        <Link
          to="/pesan"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isPesan ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`w-7 h-7 rounded-md flex items-center justify-center transition-transform active:scale-90 ${
            isPesan 
              ? 'bg-brand-600 text-white shadow-xs' 
              : 'bg-brand-50 text-brand-600 border border-brand-200'
          }`}>
            <Truck 
              size={16} 
              weight="fill" 
            />
          </div>
          <span className={`text-[10px] leading-none ${isPesan ? 'font-bold' : 'font-medium'}`}>
            Pesan
          </span>
        </Link>

        <Link
          to="/galeri"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isGaleri ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Images 
            size={22} 
            weight={isGaleri ? 'fill' : 'regular'} 
            className="transition-transform active:scale-90"
          />
          <span className={`text-[10px] leading-none ${isGaleri ? 'font-bold' : 'font-medium'}`}>
            Galeri
          </span>
        </Link>

        <Link
          to="/kontak"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isKontak ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ChatCircleDots 
            size={22} 
            weight={isKontak ? 'fill' : 'regular'} 
            className="transition-transform active:scale-90"
          />
          <span className={`text-[10px] leading-none ${isKontak ? 'font-bold' : 'font-medium'}`}>
            Kontak
          </span>
        </Link>
      </div>
    </nav>
  );
}
