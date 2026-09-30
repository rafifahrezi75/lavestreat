import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Image,
  MessageSquareQuote,
  FileText,
  Settings,
  ExternalLink,
  X
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Kelola Pesanan', path: '/admin/orders', icon: ShoppingBag },
  { label: 'Kelola Layanan', path: '/admin/services', icon: Layers },
  { label: 'Kelola Galeri', path: '/admin/gallery', icon: Image },
  { label: 'Kelola Testimoni', path: '/admin/testimonials', icon: MessageSquareQuote },
  { label: 'Kelola Konten', path: '/admin/content', icon: FileText },
  { label: 'Pengaturan', path: '/admin/settings', icon: Settings }
];

export function AdminSidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-brand-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 text-brand-900 flex flex-col transition-transform duration-300 ease-in-out shadow-xs ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 shrink-0">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center p-1.5 border border-brand-200/80 shadow-xs shrink-0">
              <img src="/logo.png" alt="Lave Streat Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base text-brand-900 leading-tight">
                Lave Streat
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold leading-none mt-0.5">
                Panel Admin
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-brand-900 p-1.5 rounded-md hover:bg-slate-100 transition-colors lg:hidden"
            aria-label="Tutup sidebar"
            title="Tutup sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pt-4 pb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Utama
          </span>
        </div>

        <nav className="grow px-3 py-1.5 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-100/70 text-brand-900 border border-brand-200/90 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-brand-900 hover:bg-slate-50 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3.5 border-t border-slate-100 shrink-0">
          <div className="bg-brand-light/60 rounded-lg p-3 border border-brand-200/70 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-brand-600 text-white flex items-center justify-center shrink-0">
                <ExternalLink className="w-3 h-3" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-brand-900">Website Publik</span>
                <span className="text-[10px] text-slate-500">Tinjau landing page aktif</span>
              </div>
            </div>
            <Link
              to="/"
              target="_blank"
              className="w-full py-1.5 px-2.5 rounded-md bg-white border border-brand-200/80 text-brand-900 hover:bg-brand-100/60 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Buka Website</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
