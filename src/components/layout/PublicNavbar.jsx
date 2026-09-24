import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { List, X } from '@phosphor-icons/react';
import { Truck } from 'lucide-react';
import { Button } from '../common/Button';

export function PublicNavbar() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Beranda', path: '/' },
    { label: 'Tentang Kami', path: '/tentang-kami' },
    { label: 'Layanan', path: '/layanan' },
    { label: 'Galeri', path: '/galeri' },
    { label: 'Kontak', path: '/kontak' }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 bg-brand-900/95 backdrop-blur-md border-b border-white/10 shadow-sm ${
        isScrolled ? 'py-2.5' : 'py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-white border border-brand-200 shadow-xs flex items-center justify-center p-1 group-hover:scale-105 transition-transform shrink-0">
              <img src="/logo.png" alt="Lave Streat Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg sm:text-xl text-white leading-tight tracking-tight">
                Lave Streat
              </span>
              <span className="text-[10px] tracking-widest uppercase text-brand-200 font-medium leading-none">
                L.A.V.E Treatment
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="relative z-10">{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2.5px] rounded-full bg-brand-600 shadow-sm" />
                  )}
                  {!isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-brand-600/0 group-hover:bg-brand-600/50 transition-all duration-200" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/admin/login"
              className="text-xs font-medium text-brand-200 hover:text-white px-3 py-2 rounded-lg transition-colors"
            >
              Admin Portal
            </Link>
            <Link to="/pesan">
              <Button
                size="md"
                className="bg-brand-600 hover:bg-brand-500 text-white shadow-sm flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>Pesan Penjemputan</span>
              </Button>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-brand-800 focus:outline-hidden"
            aria-label="Buka menu navigasi"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-900 border-b border-brand-800 px-4 pt-3 pb-6 flex flex-col gap-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                    isActive
                      ? 'bg-brand-800 text-white font-semibold border-l-4 border-brand-600'
                      : 'text-white/80 hover:text-white hover:bg-brand-800/50'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-brand-600" />}
                </Link>
              );
            })}
            <Link
              to="/admin/login"
              className="px-4 py-2.5 rounded-lg text-xs text-brand-200 hover:text-white hover:bg-brand-800/40 font-medium"
            >
              Admin Portal
            </Link>
          </nav>

          <div className="pt-2 border-t border-brand-800">
            <Link to="/pesan" onClick={() => setMobileMenuOpen(false)}>
              <Button
                size="md"
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white"
              >
                <Truck className="w-4 h-4" />
                <span>Pesan Penjemputan</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
