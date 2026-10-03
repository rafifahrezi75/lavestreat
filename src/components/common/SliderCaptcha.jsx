import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Check } from '@phosphor-icons/react';

const PW = 55;
const PH = 55;
const KR = 9;
const TOL = 16;

const CAPTCHA_IMAGES = [
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=640&q=80',
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=640&q=80',
  'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=640&q=80',
  'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=640&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=640&q=80',
  'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=640&q=80'
];

function drawPuzzlePath(ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + PW, y);
  ctx.lineTo(x + PW, y + PH / 2 - KR);
  ctx.arc(x + PW, y + PH / 2, KR, Math.PI * 1.5, Math.PI * 0.5, false);
  ctx.lineTo(x + PW, y + PH);
  ctx.lineTo(x + PW / 2 + KR, y + PH);
  ctx.arc(x + PW / 2, y + PH, KR, 0, Math.PI, false);
  ctx.lineTo(x, y + PH);
  ctx.lineTo(x, y);
  ctx.closePath();
}

export function SliderCaptcha({ onSuccess, onFail }) {
  const bgCanvasRef = useRef(null);
  const pieceCanvasRef = useRef(null);
  const trackRef = useRef(null);
  const targetXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const startDragXRef = useRef(0);
  const currentPosRef = useRef(0);

  const [sliderPos, setSliderPos] = useState(0);
  const [maxSlider, setMaxSlider] = useState(250);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  const initCaptcha = () => {
    setLoading(true);
    setHasError(false);
    currentPosRef.current = 0;
    setSliderPos(0);
    isDraggingRef.current = false;

    const bgCanvas = bgCanvasRef.current;
    const pieceCanvas = pieceCanvasRef.current;
    if (!bgCanvas || !pieceCanvas) return;

    const bgCtx = bgCanvas.getContext('2d');
    const pieceCtx = pieceCanvas.getContext('2d');

    const nextIdx = (imgIndex + 1) % CAPTCHA_IMAGES.length;
    setImgIndex(nextIdx);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = CAPTCHA_IMAGES[nextIdx];

    img.onload = () => {
      const W = bgCanvas.width;
      const H = bgCanvas.height;

      const minTx = PW + KR + 15;
      const maxTx = W - PW - KR - 15;
      const tx = minTx + Math.floor(Math.random() * (maxTx - minTx));
      const ty = 15 + Math.floor(Math.random() * (H - PH - 30));
      targetXRef.current = tx;

      bgCtx.clearRect(0, 0, W, H);
      bgCtx.drawImage(img, 0, 0, W, H);

      bgCtx.save();
      drawPuzzlePath(bgCtx, tx, ty);
      bgCtx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      bgCtx.fill();
      bgCtx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      bgCtx.lineWidth = 1.5;
      bgCtx.stroke();
      bgCtx.restore();

      pieceCtx.clearRect(0, 0, pieceCanvas.width, pieceCanvas.height);
      pieceCtx.save();
      drawPuzzlePath(pieceCtx, 2, ty);
      pieceCtx.clip();
      pieceCtx.drawImage(img, -tx + 2, 0, W, H);
      pieceCtx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      pieceCtx.lineWidth = 1.5;
      pieceCtx.stroke();
      pieceCtx.restore();

      setLoading(false);
    };

    img.onerror = () => {
      const W = bgCanvas.width;
      const H = bgCanvas.height;
      bgCtx.fillStyle = '#0A3D66';
      bgCtx.fillRect(0, 0, W, H);
      setLoading(false);
    };
  };

  useEffect(() => {
    initCaptcha();
  }, []);

  useEffect(() => {
    const updateMax = () => {
      if (trackRef.current) {
        setMaxSlider(Math.max(100, trackRef.current.clientWidth - 44));
      }
    };
    updateMax();
    window.addEventListener('resize', updateMax);
    return () => window.removeEventListener('resize', updateMax);
  }, [loading]);

  const handlePointerDown = (e) => {
    if (verified || loading) return;
    isDraggingRef.current = true;
    const clientX = e.clientX != null ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    startDragXRef.current = clientX - currentPosRef.current;
    setHasError(false);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
  };

  const updateDrag = (clientX) => {
    if (!isDraggingRef.current) return;
    const delta = clientX - startDragXRef.current;
    const newPos = Math.max(0, Math.min(delta, maxSlider));
    currentPosRef.current = newPos;
    setSliderPos(newPos);
  };

  const handlePointerMove = (e) => {
    updateDrag(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      e.preventDefault();
      updateDrag(e.touches[0].clientX);
    }
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handlePointerUp);

    const bgCanvas = bgCanvasRef.current;
    if (!bgCanvas) return;

    const scale = bgCanvas.clientWidth / (bgCanvas.width || 300);
    const targetScreenX = (targetXRef.current - 2) * scale;
    const finalPos = currentPosRef.current;
    const errorInPixels = Math.abs(finalPos - targetScreenX);

    if (errorInPixels <= TOL) {
      setVerified(true);
      if (onSuccess) onSuccess();
    } else {
      setHasError(true);
      if (onFail) onFail();
      setTimeout(() => {
        currentPosRef.current = 0;
        setSliderPos(0);
        setHasError(false);
      }, 500);
    }
  };

  const pieceLeftStyle = `${sliderPos}px`;

  return (
    <div className="w-full select-none">
      <div className="relative w-full aspect-2/1 bg-slate-100 rounded-md overflow-hidden border border-brand-200">
        <canvas
          ref={bgCanvasRef}
          width={300}
          height={150}
          className="w-full h-full block"
        />

        <canvas
          ref={pieceCanvasRef}
          width={PW + KR + 4}
          height={150}
          className="absolute top-0 pointer-events-none h-full"
          style={{ left: pieceLeftStyle, width: 'auto' }}
        />

        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center text-xs font-semibold text-brand-900">
            Memuat verifikasi...
          </div>
        )}

        {verified && (
          <div className="absolute inset-0 bg-emerald-600/90 backdrop-blur-xs flex flex-col items-center justify-center text-white">
            <div className="w-9 h-9 rounded-md bg-white text-emerald-600 flex items-center justify-center shadow-sm mb-1">
              <Check size={20} weight="bold" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Verifikasi Berhasil</span>
          </div>
        )}
      </div>

      <div className="mt-3">
        <div
          ref={trackRef}
          className={`relative w-full h-11 bg-slate-50 border rounded-md overflow-hidden transition-colors ${
            verified
              ? 'border-emerald-500 bg-emerald-50'
              : hasError
              ? 'border-rose-400 bg-rose-50'
              : 'border-brand-200'
          }`}
        >
          <div
            className={`absolute top-0 bottom-0 left-0 transition-all ${
              verified
                ? 'bg-emerald-500'
                : hasError
                ? 'bg-rose-500'
                : 'bg-brand-600'
            }`}
            style={{ width: `${sliderPos + 44}px` }}
          />

          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold pointer-events-none text-slate-500">
            {verified ? 'Terverifikasi' : 'Geser puzzle ke posisi yang tepat'}
          </span>

          <div
            onPointerDown={handlePointerDown}
            className={`absolute top-0.5 bottom-0.5 w-10 rounded-md bg-white border shadow-xs flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform ${
              verified
                ? 'border-emerald-500 text-emerald-600'
                : hasError
                ? 'border-rose-500 text-rose-600'
                : 'border-brand-600 text-brand-600 hover:bg-brand-light'
            }`}
            style={{ left: `${sliderPos}px` }}
          >
            {verified ? (
              <Check size={18} weight="bold" />
            ) : (
              <ArrowRight size={18} weight="bold" />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 px-0.5">
          <span className="text-[11px] text-slate-400">Verifikasi Keamanan</span>
          {!verified && (
            <button
              type="button"
              onClick={initCaptcha}
              disabled={loading}
              className="text-[11px] text-brand-600 hover:text-brand-900 font-medium transition-colors"
            >
              Ganti gambar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
