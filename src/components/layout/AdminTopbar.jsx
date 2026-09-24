import React from 'react';
import { PanelLeft, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AdminTopbar({ title, onToggleSidebar, isSidebarOpen }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-brand-200 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
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
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-wet font-medium">
          <span className="hidden sm:inline text-slate-wet/80">Admin</span>
          <span className="hidden sm:inline text-slate-300">/</span>
          <h1 className="text-sm sm:text-base font-semibold text-brand-900 tracking-tight leading-none">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2.5 text-sm text-brand-900/80">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
            <User className="w-4 h-4" />
          </div>
          <span className="font-medium text-sm">{user?.email || 'admin@lavestreat.com'}</span>
        </div>

        <button
          type="button"
          onClick={logout}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-danger bg-danger/10 hover:bg-danger/20 transition-colors"
          aria-label="Keluar dari akun admin"
        >
          Keluar
        </button>
      </div>
    </header>
  );
}
