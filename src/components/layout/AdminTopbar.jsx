import React from 'react';
import { useLocation } from 'react-router-dom';
import { PanelLeft, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AdminTopbar({ title, onToggleSidebar, isSidebarOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getNavInfo = (pathname) => {
    if (pathname === '/admin') {
      return {
        title: 'Dashboard Ringkasan',
        breadcrumbs: ['Panel Admin', 'Dashboard']
      };
    }
    if (pathname.startsWith('/admin/orders/')) {
      return {
        title: 'Detail Pesanan',
        breadcrumbs: ['Panel Admin', 'Pesanan', 'Detail']
      };
    }
    if (pathname === '/admin/orders') {
      return {
        title: 'Kelola Pesanan',
        breadcrumbs: ['Panel Admin', 'Pesanan']
      };
    }
    if (pathname === '/admin/services/new') {
      return {
        title: 'Tambah Layanan',
        breadcrumbs: ['Panel Admin', 'Layanan', 'Tambah']
      };
    }
    if (pathname.includes('/admin/services/') && pathname.endsWith('/edit')) {
      return {
        title: 'Edit Layanan',
        breadcrumbs: ['Panel Admin', 'Layanan', 'Edit']
      };
    }
    if (pathname === '/admin/services') {
      return {
        title: 'Kelola Layanan',
        breadcrumbs: ['Panel Admin', 'Layanan']
      };
    }
    if (pathname === '/admin/gallery/new') {
      return {
        title: 'Tambah Galeri',
        breadcrumbs: ['Panel Admin', 'Galeri', 'Tambah']
      };
    }
    if (pathname.includes('/admin/gallery/') && pathname.endsWith('/edit')) {
      return {
        title: 'Edit Galeri',
        breadcrumbs: ['Panel Admin', 'Galeri', 'Edit']
      };
    }
    if (pathname.includes('/admin/gallery/') || pathname.includes('/admin/galeri/')) {
      return {
        title: 'Detail Galeri',
        breadcrumbs: ['Panel Admin', 'Galeri', 'Detail']
      };
    }
    if (pathname === '/admin/gallery' || pathname === '/admin/galeri') {
      return {
        title: 'Kelola Galeri',
        breadcrumbs: ['Panel Admin', 'Galeri']
      };
    }
    if (pathname === '/admin/testimonials/new') {
      return {
        title: 'Tambah Testimoni',
        breadcrumbs: ['Panel Admin', 'Testimoni', 'Tambah']
      };
    }
    if (pathname.includes('/admin/testimonials/') && pathname.endsWith('/edit')) {
      return {
        title: 'Edit Testimoni',
        breadcrumbs: ['Panel Admin', 'Testimoni', 'Edit']
      };
    }
    if (pathname === '/admin/testimonials') {
      return {
        title: 'Kelola Testimoni',
        breadcrumbs: ['Panel Admin', 'Testimoni']
      };
    }
    if (pathname === '/admin/content') {
      return {
        title: 'Kelola Konten',
        breadcrumbs: ['Panel Admin', 'Konten Web']
      };
    }
    if (pathname === '/admin/settings') {
      return {
        title: 'Pengaturan Outlet',
        breadcrumbs: ['Panel Admin', 'Pengaturan']
      };
    }
    return {
      title: title || 'Panel Admin',
      breadcrumbs: ['Panel Admin', 'Ikhtisar']
    };
  };

  const nav = getNavInfo(location.pathname);

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-3 sm:px-5 lg:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="text-slate-600 hover:text-brand-900 p-2 rounded-md hover:bg-slate-100 transition-colors focus:outline-hidden cursor-pointer shrink-0"
          aria-label={isSidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
          title={isSidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          {nav.breadcrumbs.map((crumb, idx) => {
            const isLast = idx === nav.breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-300 font-light select-none">/</span>}
                <span className={isLast ? 'text-brand-900 font-semibold truncate' : 'text-slate-400 font-normal truncate'}>
                  {crumb}
                </span>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
          <div className="w-5 h-5 rounded-md bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
            <User className="w-3 h-3" />
          </div>
          <span className="font-medium max-w-[140px] truncate">{user?.email || 'admin@lavestreat.com'}</span>
        </div>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-danger bg-danger/10 hover:bg-danger/20 transition-colors cursor-pointer"
          aria-label="Keluar dari akun admin"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
