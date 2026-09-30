import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CaretLeft, CaretRight, Sparkle } from '@phosphor-icons/react';
import { getImageFramingStyle } from '../../lib/framing';

export function BeforeAfterCompare({
  beforeUrl,
  afterUrl,
  beforeFraming,
  afterFraming,
  beforeStyle,
  afterStyle,
  caption = '',
  serviceTag = '',
  className = '',
  imageClassName = 'aspect-[4/3] sm:aspect-[16/10] min-h-[260px]',
  objectPosition = '50% 50%',
  header,
  footer,
  children
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isInteracting, setIsInteracting] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setSliderPosition(50);
  }, [beforeUrl, afterUrl]);

  const updatePositionFromClientX = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const percentage = (clampedX / rect.width) * 100;
    setSliderPosition(percentage);
    setHasInteracted(true);
  }, []);

  const handlePointerDown = (e) => {
    setIsInteracting(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    updatePositionFromClientX(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!isInteracting) return;
    updatePositionFromClientX(e.clientX);
  };

  const handlePointerUp = (e) => {
    setIsInteracting(false);
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  const handleSliderChange = (e) => {
    setSliderPosition(Number(e.target.value));
    setHasInteracted(true);
  };

  const safeObjPos = objectPosition || '50% 50%';
  const safeBeforeStyle = beforeStyle || (beforeFraming ? getImageFramingStyle({ framing_before: beforeFraming }, 'before') : { objectPosition: safeObjPos });
  const safeAfterStyle = afterStyle || (afterFraming ? getImageFramingStyle({ framing_after: afterFraming }, 'after') : { objectPosition: safeObjPos });

  return (
    <div className={`isolate relative bg-white rounded-lg border border-brand-200/90 overflow-hidden shadow-subtle flex flex-col ${className}`}>
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-full select-none overflow-hidden bg-slate-900 cursor-ew-resize touch-none ${imageClassName}`}
      >
        <img
          src={afterUrl}
          alt="Foto sesudah perawatan"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          style={safeAfterStyle}
        />

        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={beforeUrl}
            alt="Foto sebelum perawatan"
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            style={safeBeforeStyle}
          />
        </div>

        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)] pointer-events-none z-10 transition-transform duration-75"
          style={{ left: `${sliderPosition}%` }}
        >
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white border-2 border-brand-600 text-brand-900 flex items-center justify-center shadow-xl transition-transform ${
              isInteracting ? 'scale-110 shadow-2xl ring-4 ring-brand-600/30' : 'hover:scale-105'
            }`}
          >
            <div className="flex items-center gap-0.5 text-brand-600">
              <CaretLeft size={12} weight="bold" />
              <div className="w-0.5 h-3 bg-brand-200 rounded-full" />
              <CaretRight size={12} weight="bold" />
            </div>
          </div>
        </div>

        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-slate-950/75 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 uppercase tracking-wider shadow-sm pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Sebelum</span>
        </div>

        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-brand-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 uppercase tracking-wider shadow-sm pointer-events-none">
          <Sparkle size={11} weight="fill" className="text-accent-gold" />
          <span>Sesudah</span>
        </div>

        {!hasInteracted && (
          <div className="absolute bottom-3 inset-x-0 mx-auto w-fit z-10 pointer-events-none animate-pulse">
            <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium border border-white/20 shadow-md">
              Geser untuk membandingkan
            </span>
          </div>
        )}

        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={handleSliderChange}
          aria-label="Geser untuk membandingkan sebelum dan sesudah"
          className="sr-only"
        />
      </div>

      {(caption || serviceTag || header || footer || children) && (
        <div className="p-4 flex flex-col justify-between gap-2.5 bg-white border-t border-brand-200/50">
          {header}
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
          {children}
          {footer}
        </div>
      )}
    </div>
  );
}
