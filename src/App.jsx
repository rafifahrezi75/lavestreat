import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
  Link,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { PublicNavbar } from "./components/layout/PublicNavbar";
import { PublicFooter } from "./components/layout/PublicFooter";
import { PublicBottomNav } from "./components/layout/PublicBottomNav";
import { settingsApi, checkAndAutoSeed } from "./lib/api";

import { HomePage } from "./pages/public/HomePage";
import { AboutPage } from "./pages/public/AboutPage";
import { ServicesPage } from "./pages/public/ServicesPage";
import { GalleryPage } from "./pages/public/GalleryPage";
import { GalleryDetailPage } from "./pages/public/GalleryDetailPage";
import { ContactPage } from "./pages/public/ContactPage";
import { OrderPage } from "./pages/public/OrderPage";

import { LoginPage } from "./pages/admin/LoginPage";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { OrdersManagePage } from "./pages/admin/OrdersManagePage";
import { OrderDetailPage } from "./pages/admin/OrderDetailPage";
import { ServicesManagePage } from "./pages/admin/ServicesManagePage";
import { ServiceFormPage } from "./pages/admin/ServiceFormPage";
import { GalleryManagePage } from "./pages/admin/GalleryManagePage";
import { GalleryDetailPage as AdminGalleryDetailPage } from "./pages/admin/GalleryDetailPage";
import { GalleryFormPage } from "./pages/admin/GalleryFormPage";
import { TestimonialsManagePage } from "./pages/admin/TestimonialsManagePage";
import { TestimonialFormPage } from "./pages/admin/TestimonialFormPage";
import { ContentManagePage } from "./pages/admin/ContentManagePage";
import { SettingsPage } from "./pages/admin/SettingsPage";
import { Button } from "./components/common/Button";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PublicWrapper() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const s = await settingsApi.getSettings();
        setSettings(s);
      } catch {}
    }
    loadSettings();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <div className="grow pb-16 md:pb-0">
        <Outlet />
      </div>
      <PublicFooter settings={settings} />
      <PublicBottomNav />
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="font-display font-extrabold text-5xl text-brand-900 mb-2">
        404
      </h2>
      <p className="text-slate-wet text-base mb-6">
        Halaman yang Anda tuju tidak ditemukan.
      </p>
      <Link to="/">
        <Button variant="primary" size="md">
          Kembali ke Beranda
        </Button>
      </Link>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    checkAndAutoSeed();
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route element={<PublicWrapper />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/tentang-kami" element={<AboutPage />} />
              <Route path="/layanan" element={<ServicesPage />} />
              <Route path="/galeri" element={<GalleryPage />} />
              <Route path="/galeri/:id" element={<GalleryDetailPage />} />
              <Route path="/kontak" element={<ContactPage />} />
              <Route path="/pesan" element={<OrderPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route path="/admin/login" element={<LoginPage />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="orders" element={<OrdersManagePage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="pesanan" element={<OrdersManagePage />} />
              <Route path="pesanan/:id" element={<OrderDetailPage />} />
              <Route path="services" element={<ServicesManagePage />} />
              <Route path="services/new" element={<ServiceFormPage />} />
              <Route path="services/:id/edit" element={<ServiceFormPage />} />
              <Route path="layanan" element={<ServicesManagePage />} />
              <Route path="gallery" element={<GalleryManagePage />} />
              <Route path="gallery/new" element={<GalleryFormPage />} />
              <Route path="gallery/:id" element={<AdminGalleryDetailPage />} />
              <Route path="gallery/:id/edit" element={<GalleryFormPage />} />
              <Route path="galeri" element={<GalleryManagePage />} />
              <Route path="galeri/:id" element={<AdminGalleryDetailPage />} />
              <Route path="testimonials" element={<TestimonialsManagePage />} />
              <Route
                path="testimonials/new"
                element={<TestimonialFormPage />}
              />
              <Route
                path="testimonials/:id/edit"
                element={<TestimonialFormPage />}
              />
              <Route path="testimoni" element={<TestimonialsManagePage />} />
              <Route path="content" element={<ContentManagePage />} />
              <Route path="konten" element={<ContentManagePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="pengaturan" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
