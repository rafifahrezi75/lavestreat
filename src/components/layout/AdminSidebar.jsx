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
  PanelLeftClose,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
  const { logout } = useAuth();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-brand-900/60 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-brand-900 text-snow-foam flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10 shrink-0">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center p-1.5 shadow-xs shrink-0">
              <img src="/logo.png" alt="Lave Streat Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg text-white leading-tight">
                Lave Streat
              </span>
              <span className="text-xs uppercase tracking-wider text-sky-300 font-semibold leading-none mt-0.5">
                Admin Panel
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Tutup sidebar"
            title="Tutup sidebar"
          >
            <PanelLeftClose className="w-5 h-5 hidden lg:block" />
            <X className="w-5 h-5 lg:hidden" />
          </button>
        </div>

        <nav className="grow px-3 py-4 flex flex-col gap-1.5 overflow-y-auto">
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
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-snow-foam/85 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0 flex flex-col gap-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-lg text-sm font-semibold text-sky-200 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span>Lihat Website Publik</span>
            <ExternalLink className="w-4 h-4 shrink-0" />
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex items-center justify-between px-3.5 py-2 rounded-lg text-sm font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 transition-colors text-left cursor-pointer"
          >
            <span>Keluar Akun</span>
            <LogOut className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
}
