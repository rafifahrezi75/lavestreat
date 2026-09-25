import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange
}) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  if (totalItems <= 0) return null;

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-brand-200 text-xs text-slate-wet select-none">
      <div>
        Menampilkan <span className="font-semibold text-brand-900">{startItem}</span>-
        <span className="font-semibold text-brand-900">{endItem}</span> dari{' '}
        <span className="font-semibold text-brand-900">{totalItems}</span> data
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded border border-brand-200 text-brand-900 hover:bg-brand-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors flex items-center justify-center"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-wet">
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`min-w-[28px] h-7 px-2 text-xs font-medium rounded border transition-colors ${
                currentPage === p
                  ? 'bg-brand-600 border-brand-600 text-white font-bold'
                  : 'border-brand-200 text-brand-900 hover:bg-brand-100'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded border border-brand-200 text-brand-900 hover:bg-brand-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors flex items-center justify-center"
          aria-label="Halaman selanjutnya"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
