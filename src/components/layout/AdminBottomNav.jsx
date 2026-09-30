import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  SquaresFour, 
  ShoppingBag, 
  Sparkle, 
  Images, 
  DotsNine,
  ChatTeardropText,
  Article,
  Gear,
  ArrowSquareOut,
  SignOut,
  X
} from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';

export function AdminBottomNav() {
  const location = useLocation();
  const { logout } = useAuth();
  const currentPath = location.pathname;
  const [floatingOpen, setFloatingOpen] = useState(false);

  const isDashboard = currentPath === '/admin';
  const isOrders = currentPath.startsWith('/admin/orders') || currentPath.startsWith('/admin/pesanan');
  const isServices = currentPath.startsWith('/admin/services') || currentPath.startsWith('/admin/layanan');
  const isGallery = currentPath.startsWith('/admin/gallery') || currentPath.startsWith('/admin/galeri');
  const isOther = currentPath.startsWith('/admin/testimonials') || 
                  currentPath.startsWith('/admin/testimoni') || 
                  currentPath.startsWith('/admin/content') || 
                  currentPath.startsWith('/admin/konten') || 
                  currentPath.startsWith('/admin/settings') || 
                  currentPath.startsWith('/admin/pengaturan');

  const handleLogout = async () => {
    setFloatingOpen(false);
    try {
      await logout();
    } catch {
    }
  };

  return (
    <>
      <nav 
        aria-label="Navigasi Bawah Admin Mobile"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(10,61,102,0.06)] lg:hidden"
      >
        <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-1">
          <Link
            to="/admin"
            onClick={() => setFloatingOpen(false)}
            className={`flex flex-col items-center justify-center gap-1 transition-colors py-1 ${
              isDashboard ? 'text-brand-600' : 'text-slate-500 hover:text-brand-900'
            }`}
          >
            <div className={`p-1 rounded-md transition-all ${isDashboard ? 'bg-brand-100/70' : ''}`}>
              <SquaresFour 
                size={20} 
                weight={isDashboard ? 'fill' : 'bold'} 
                className="transition-transform active:scale-90"
              />
            </div>
            <span className={`text-[10px] leading-none ${isDashboard ? 'font-bold' : 'font-medium'}`}>
              Dashboard
            </span>
          </Link>

          <Link
            to="/admin/orders"
            onClick={() => setFloatingOpen(false)}
            className={`flex flex-col items-center justify-center gap-1 transition-colors py-1 ${
              isOrders ? 'text-brand-600' : 'text-slate-500 hover:text-brand-900'
            }`}
          >
            <div className={`p-1 rounded-md transition-all ${isOrders ? 'bg-brand-100/70' : ''}`}>
              <ShoppingBag 
                size={20} 
                weight={isOrders ? 'fill' : 'bold'} 
                className="transition-transform active:scale-90"
              />
            </div>
            <span className={`text-[10px] leading-none ${isOrders ? 'font-bold' : 'font-medium'}`}>
              Pesanan
            </span>
          </Link>

          <Link
            to="/admin/services"
            onClick={() => setFloatingOpen(false)}
            className={`flex flex-col items-center justify-center gap-1 transition-colors py-1 ${
              isServices ? 'text-brand-600' : 'text-slate-500 hover:text-brand-900'
            }`}
          >
            <div className={`p-1 rounded-md transition-all ${isServices ? 'bg-brand-100/70' : ''}`}>
              <Sparkle 
                size={20} 
                weight={isServices ? 'fill' : 'bold'} 
                className="transition-transform active:scale-90"
              />
            </div>
            <span className={`text-[10px] leading-none ${isServices ? 'font-bold' : 'font-medium'}`}>
              Layanan
            </span>
          </Link>

          <Link
            to="/admin/gallery"
            onClick={() => setFloatingOpen(false)}
            className={`flex flex-col items-center justify-center gap-1 transition-colors py-1 ${
              isGallery ? 'text-brand-600' : 'text-slate-500 hover:text-brand-900'
            }`}
          >
            <div className={`p-1 rounded-md transition-all ${isGallery ? 'bg-brand-100/70' : ''}`}>
              <Images 
                size={20} 
                weight={isGallery ? 'fill' : 'bold'} 
                className="transition-transform active:scale-90"
              />
            </div>
            <span className={`text-[10px] leading-none ${isGallery ? 'font-bold' : 'font-medium'}`}>
              Galeri
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setFloatingOpen(!floatingOpen)}
            className={`flex flex-col items-center justify-center gap-1 transition-colors py-1 cursor-pointer ${
              floatingOpen || isOther ? 'text-brand-600' : 'text-slate-500 hover:text-brand-900'
            }`}
          >
            <div className={`p-1 rounded-md transition-all ${floatingOpen || isOther ? 'bg-brand-100/70' : ''}`}>
              <DotsNine 
                size={20} 
                weight={floatingOpen || isOther ? 'fill' : 'bold'} 
                className="transition-transform active:scale-90"
              />
            </div>
            <span className={`text-[10px] leading-none ${floatingOpen || isOther ? 'font-bold' : 'font-medium'}`}>
              Lainnya
            </span>
          </button>
        </div>
      </nav>

      {floatingOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-brand-900/40 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
            onClick={() => setFloatingOpen(false)}
            aria-hidden="true"
          />

          <div 
            className="fixed bottom-20 right-3 left-3 sm:left-auto sm:right-6 sm:w-80 z-50 bg-white rounded-xl border border-slate-200/90 shadow-[0_8px_28px_rgba(10,61,102,0.12)] p-3.5 animate-in fade-in zoom-in-95 duration-200 lg:hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-brand-100 text-brand-600 flex items-center justify-center">
                  <DotsNine size={14} weight="bold" />
                </div>
                <span className="font-bold text-xs text-brand-900">Menu Lainnya</span>
              </div>
              <button
                type="button"
                onClick={() => setFloatingOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-brand-900 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Tutup menu"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2.5">
              <Link
                to="/admin/testimonials"
                onClick={() => setFloatingOpen(false)}
                className="p-2.5 rounded-md bg-slate-50 border border-slate-200/70 hover:bg-brand-50 hover:border-brand-200 transition-all flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-md bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                  <ChatTeardropText size={16} weight="fill" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-brand-900 truncate">Testimoni</span>
                  <span className="text-[10px] text-slate-400 truncate">Kelola ulasan</span>
                </div>
              </Link>

              <Link
                to="/admin/content"
                onClick={() => setFloatingOpen(false)}
                className="p-2.5 rounded-md bg-slate-50 border border-slate-200/70 hover:bg-brand-50 hover:border-brand-200 transition-all flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-md bg-sky-100 text-brand-600 flex items-center justify-center shrink-0">
                  <Article size={16} weight="fill" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-brand-900 truncate">Konten Web</span>
                  <span className="text-[10px] text-slate-400 truncate">Teks landing</span>
                </div>
              </Link>

              <Link
                to="/admin/settings"
                onClick={() => setFloatingOpen(false)}
                className="p-2.5 rounded-md bg-slate-50 border border-slate-200/70 hover:bg-brand-50 hover:border-brand-200 transition-all flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Gear size={16} weight="fill" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-brand-900 truncate">Pengaturan</span>
                  <span className="text-[10px] text-slate-400 truncate">Outlet & kontak</span>
                </div>
              </Link>

              <Link
                to="/"
                target="_blank"
                onClick={() => setFloatingOpen(false)}
                className="p-2.5 rounded-md bg-slate-50 border border-slate-200/70 hover:bg-emerald-50 hover:border-emerald-200 transition-all flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ArrowSquareOut size={16} weight="bold" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-brand-900 truncate">Buka Web</span>
                  <span className="text-[10px] text-slate-400 truncate">Landing live</span>
                </div>
              </Link>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-1.5 px-3 rounded-md bg-red-50 border border-red-200/70 text-danger hover:bg-red-100 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <SignOut size={15} weight="bold" />
                <span>Keluar dari Admin</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
