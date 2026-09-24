import React, { useState } from 'react';

export function BeforeAfterCompare({
  beforeUrl,
  afterUrl,
  caption = '',
  serviceTag = '',
  className = ''
}) {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleSliderChange = (e) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <div className={`bg-white rounded-xl border border-brand-200 overflow-hidden shadow-subtle flex flex-col ${className}`}>
      <div className="relative w-full aspect-4/3 sm:aspect-16/10 select-none overflow-hidden bg-slate-100">
        <img
          src={afterUrl}
          alt="Foto sesudah perawatan"
          className="absolute inset-0 w-full h-full object-cover select-none"
        />

        <img
          src={beforeUrl}
          alt="Foto sebelum perawatan"
          className="absolute inset-0 w-full h-full object-cover select-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        />

        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.35)] pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white border border-slate-200 text-brand-900 flex items-center justify-center text-xs font-bold shadow-md">
            &harr;
          </div>
        </div>

        <div className="absolute top-3 left-3 bg-brand-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
          Sebelum
        </div>
        <div className="absolute top-3 right-3 bg-brand-600/90 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
          Sesudah
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={handleSliderChange}
          aria-label="Geser untuk membandingkan sebelum dan sesudah"
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
        />
      </div>

      {(caption || serviceTag) && (
        <div className="p-4 flex flex-col justify-between gap-1 bg-white border-t border-brand-200/50">
          {caption && (
            <p className="text-sm font-semibold text-brand-900 leading-snug">
              {caption}
            </p>
          )}
          {serviceTag && (
            <span className="text-xs font-medium text-brand-600 inline-block">
              {serviceTag}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
