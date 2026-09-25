import React from 'react';
import { useLocation } from 'react-router-dom';
import { PanelLeft, User, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AdminTopbar({ title, onToggleSidebar, isSidebarOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getNavInfo = (pathname) => {
    if (pathname === '/admin') {
      return {
        title: 'Dashboard',
        breadcrumbs: ['Home', 'Analytics', 'Overview']
      };
    }
    if (pathname.startsWith('/admin/orders/')) {
      return {
        title: 'Detail Pesanan',
        breadcrumbs: ['Home', 'Pesanan', 'Detail']
      };
    }
    if (pathname === '/admin/orders') {
      return {
        title: 'Pesanan',
        breadcrumbs: ['Home', 'Pesanan', 'Overview']
      };
    }
    if (pathname === '/admin/services/new') {
      return {
        title: 'Tambah Layanan',
        breadcrumbs: ['Home', 'Layanan', 'Tambah Baru']
      };
    }
    if (pathname.includes('/admin/services/') && pathname.endsWith('/edit')) {
      return {
        title: 'Edit Layanan',
        breadcrumbs: ['Home', 'Layanan', 'Edit']
      };
    }
    if (pathname === '/admin/services') {
      return {
        title: 'Layanan',
        breadcrumbs: ['Home', 'Layanan', 'Overview']
      };
    }
    if (pathname === '/admin/gallery/new') {
      return {
        title: 'Tambah Galeri',
        breadcrumbs: ['Home', 'Galeri', 'Tambah Baru']
      };
    }
    if (pathname.includes('/admin/gallery/') && pathname.endsWith('/edit')) {
      return {
        title: 'Edit Galeri',
        breadcrumbs: ['Home', 'Galeri', 'Edit']
      };
    }
    if (pathname === '/admin/gallery') {
      return {
        title: 'Galeri',
        breadcrumbs: ['Home', 'Galeri', 'Overview']
      };
    }
    if (pathname === '/admin/testimonials/new') {
      return {
        title: 'Tambah Testimoni',
        breadcrumbs: ['Home', 'Testimoni', 'Tambah Baru']
      };
    }
    if (pathname.includes('/admin/testimonials/') && pathname.endsWith('/edit')) {
      return {
        title: 'Edit Testimoni',
        breadcrumbs: ['Home', 'Testimoni', 'Edit']
      };
    }
    if (pathname === '/admin/testimonials') {
      return {
        title: 'Testimoni',
        breadcrumbs: ['Home', 'Testimoni', 'Overview']
      };
    }
    if (pathname === '/admin/content') {
      return {
        title: 'Konten Web',
        breadcrumbs: ['Home', 'Konten', 'Overview']
      };
    }
    if (pathname === '/admin/settings') {
      return {
        title: 'Pengaturan',
        breadcrumbs: ['Home', 'Pengaturan', 'Overview']
      };
    }
    return {
      title: title || 'Dashboard',
      breadcrumbs: ['Home', 'Analytics', 'Overview']
    };
  };

  const nav = getNavInfo(location.pathname);

  return (
    <header className="min-h-16 bg-white border-b border-brand-200 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="text-brand-900 p-2 rounded-lg hover:bg-brand-100 transition-colors focus:outline-hidden"
          aria-label={isSidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
          title={isSidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {nav.title}
          </h1>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-normal mt-0.5">
            {nav.breadcrumbs.map((crumb, idx) => {
              const isLast = idx === nav.breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />}
                  <span className={isLast ? 'text-slate-700 font-medium' : 'text-slate-500'}>
                    {crumb}
                  </span>
                </React.Fragment>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600">
          <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium">{user?.email || 'admin@lavestreat.com'}</span>
        </div>

        <button
          type="button"
          onClick={logout}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-danger bg-danger/10 hover:bg-danger/20 transition-colors"
          aria-label="Keluar dari akun admin"
        >
          Keluar
        </button>
      </div>
    </header>
  );
}
