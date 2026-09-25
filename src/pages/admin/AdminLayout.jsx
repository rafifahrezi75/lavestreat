import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { AdminTopbar } from '../../components/layout/AdminTopbar';
import { useAuth } from '../../context/AuthContext';

export function AdminLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center text-brand-900 font-semibold text-base">
        Memverifikasi sesi admin...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  const getPageTitle = (pathname) => {
    if (pathname === '/admin') return 'Dashboard Ringkasan';
    if (pathname.startsWith('/admin/orders/')) return 'Detail Pesanan';
    if (pathname === '/admin/orders') return 'Kelola Pesanan';
    if (pathname === '/admin/services/new') return 'Tambah Layanan Baru';
    if (pathname.includes('/admin/services/') && pathname.endsWith('/edit')) return 'Edit Layanan';
    if (pathname === '/admin/services') return 'Kelola Layanan & Produk';
    if (pathname === '/admin/gallery/new') return 'Tambah Before-After';
    if (pathname.includes('/admin/gallery/') && pathname.endsWith('/edit')) return 'Edit Before-After';
    if (pathname === '/admin/gallery') return 'Kelola Galeri Before-After';
    if (pathname === '/admin/testimonials/new') return 'Tambah Testimoni';
    if (pathname.includes('/admin/testimonials/') && pathname.endsWith('/edit')) return 'Edit Testimoni';
    if (pathname === '/admin/testimonials') return 'Kelola Testimoni';
    if (pathname === '/admin/content') return 'Kelola Konten Landing Page';
    if (pathname === '/admin/settings') return 'Pengaturan Outlet';
    return 'Panel Admin';
  };

  return (
    <div className="min-h-screen bg-brand-light flex">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={`flex flex-col grow w-full transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:pl-72' : 'lg:pl-0'}`}>
        <AdminTopbar
          title={getPageTitle(location.pathname)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isSidebarOpen={sidebarOpen}
        />

        <main className="grow p-4 sm:p-5 lg:p-6 overflow-x-auto w-full">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
