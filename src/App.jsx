import React, { useState, useEffect, Suspense, lazy } from "react";
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
import { Button } from "./components/common/Button";

const HomePage = lazy(() =>
  import("./pages/public/HomePage").then((m) => ({ default: m.HomePage }))
);
const AboutPage = lazy(() =>
  import("./pages/public/AboutPage").then((m) => ({ default: m.AboutPage }))
);
const ServicesPage = lazy(() =>
  import("./pages/public/ServicesPage").then((m) => ({ default: m.ServicesPage }))
);
const GalleryPage = lazy(() =>
  import("./pages/public/GalleryPage").then((m) => ({ default: m.GalleryPage }))
);
const GalleryDetailPage = lazy(() =>
  import("./pages/public/GalleryDetailPage").then((m) => ({
    default: m.GalleryDetailPage,
  }))
);
const ContactPage = lazy(() =>
  import("./pages/public/ContactPage").then((m) => ({ default: m.ContactPage }))
);
const OrderPage = lazy(() =>
  import("./pages/public/OrderPage").then((m) => ({ default: m.OrderPage }))
);

const LoginPage = lazy(() =>
  import("./pages/admin/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const AdminLayout = lazy(() =>
  import("./pages/admin/AdminLayout").then((m) => ({ default: m.AdminLayout }))
);
const DashboardPage = lazy(() =>
  import("./pages/admin/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  }))
);
const OrdersManagePage = lazy(() =>
  import("./pages/admin/OrdersManagePage").then((m) => ({
    default: m.OrdersManagePage,
  }))
);
const OrderDetailPage = lazy(() =>
  import("./pages/admin/OrderDetailPage").then((m) => ({
    default: m.OrderDetailPage,
  }))
);
const ServicesManagePage = lazy(() =>
  import("./pages/admin/ServicesManagePage").then((m) => ({
    default: m.ServicesManagePage,
  }))
);
const ServiceFormPage = lazy(() =>
  import("./pages/admin/ServiceFormPage").then((m) => ({
    default: m.ServiceFormPage,
  }))
);
const GalleryManagePage = lazy(() =>
  import("./pages/admin/GalleryManagePage").then((m) => ({
    default: m.GalleryManagePage,
  }))
);
const AdminGalleryDetailPage = lazy(() =>
  import("./pages/admin/GalleryDetailPage").then((m) => ({
    default: m.GalleryDetailPage,
  }))
);
const GalleryFormPage = lazy(() =>
  import("./pages/admin/GalleryFormPage").then((m) => ({
    default: m.GalleryFormPage,
  }))
);
const TestimonialsManagePage = lazy(() =>
  import("./pages/admin/TestimonialsManagePage").then((m) => ({
    default: m.TestimonialsManagePage,
  }))
);
const TestimonialFormPage = lazy(() =>
  import("./pages/admin/TestimonialFormPage").then((m) => ({
    default: m.TestimonialFormPage,
  }))
);
const ContentManagePage = lazy(() =>
  import("./pages/admin/ContentManagePage").then((m) => ({
    default: m.ContentManagePage,
  }))
);
const SettingsPage = lazy(() =>
  import("./pages/admin/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  }))
);

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  );
}

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
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
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
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
