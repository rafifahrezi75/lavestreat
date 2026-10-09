import React from 'react';
import { Plus, Check } from 'lucide-react';
import { Button } from '../../components/common/Button';

export function ServiceCard({ service, onSelect, selected = false }) {
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(service.harga);

  const categoryLabels = {
    cuci: 'Cuci Sepatu',
    repaint: 'Repaint Sepatu',
    sabun: 'Sabun & Perawatan'
  };

  return (
    <div className={`h-full bg-white rounded-md border transition-all duration-300 ease-out flex flex-col overflow-hidden shadow-subtle ${
      selected ? 'border-brand-600 ring-2 ring-brand-600/20 -translate-y-0.5' : 'border-brand-200 hover:border-brand-600/50 hover:-translate-y-1 hover:shadow-md'
    }`}>
      <div className="relative w-full aspect-[4/3] min-h-[110px] sm:min-h-[180px] overflow-hidden bg-brand-100 shrink-0">
        <img
          src={service.foto || '/services/deep-clean.jpg'}
          alt={service.nama}
          onError={(e) => {
            e.currentTarget.src = '/services/deep-clean.jpg';
          }}
          className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white/95 backdrop-blur-xs text-brand-900 rounded-md shadow-xs border border-black/5">
            {categoryLabels[service.kategori] || service.kategori}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-5 flex flex-col grow justify-between gap-3 sm:gap-4">
        <div>
          <h3 className="font-display font-bold text-sm sm:text-base md:text-lg text-brand-900 leading-snug tracking-tight line-clamp-1 mb-1">
            {service.nama}
          </h3>
          <p className="text-[11px] sm:text-xs md:text-sm text-slate-wet leading-relaxed line-clamp-2 min-h-0 sm:min-h-[2.5rem]">
            {service.deskripsi}
          </p>
        </div>

        <div className="pt-2.5 sm:pt-3 border-t border-brand-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-[9px] sm:text-[11px] text-slate-wet block leading-none mb-0.5 sm:mb-1">Biaya Layanan</span>
            <span className="text-xs sm:text-base md:text-lg font-bold text-brand-900">
              {formattedPrice}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-wet font-normal ml-0.5 sm:ml-1">
              /{service.satuan || 'pasang'}
            </span>
          </div>

          {onSelect && (
            <Button
              onClick={() => onSelect(service)}
              variant={selected ? 'dark' : 'primary'}
              size="sm"
              className="flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto justify-center text-[11px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
            >
              {selected ? (
                <>
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Dipilih</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Pesan</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
