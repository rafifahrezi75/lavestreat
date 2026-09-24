import React from 'react';
import { Star, ShieldCheck } from '@phosphor-icons/react';

export function TestimonialCard({ testimonial }) {
  const rating = testimonial.rating || 5;
  const isAnonymous = Boolean(testimonial.is_anonymous || testimonial.anonim);
  const displayName = isAnonymous ? 'Anonim' : testimonial.nama_pelanggan;

  return (
    <div className="bg-white rounded-2xl border border-brand-200/90 p-6 flex flex-col justify-between gap-5 shadow-xs hover:border-brand-600/30 hover:shadow-md transition-all duration-300 h-full">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              weight={i < rating ? 'fill' : 'regular'}
              className={i < rating ? 'text-accent-gold' : 'text-slate-200'}
            />
          ))}
        </div>

        <p className="text-sm sm:text-base text-slate-700 leading-relaxed italic">
          "{testimonial.isi}"
        </p>
      </div>

      <div className="pt-4 border-t border-brand-100 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-brand-900 tracking-tight">
            {displayName}
          </span>
          {testimonial.order_id && (
            <span className="text-[10px] text-slate-400 font-mono">
              Order #{testimonial.order_id}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 shrink-0">
          <ShieldCheck size={14} weight="fill" />
          <span>Terverifikasi</span>
        </div>
      </div>
    </div>
  );
}
