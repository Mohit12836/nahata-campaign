'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Gift, ArrowRight } from 'lucide-react';
import { Prize } from '@/types';

interface ScratchCardProps {
  prize: Prize;
  onScratchComplete: () => void;
  disabled?: boolean;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({
  prize,
  onScratchComplete,
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);

  // Trigger celebration confetti
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E11D48', '#F59E0B', '#10B981', '#6366F1', '#EC4899'],
      });
    } catch {
      // safe fallback
    }
  }, []);

  // Initialize Canvas Overlay with Golden Festive Shimmer Pattern
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Draw Golden Metallic Gradient
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, '#C59B27');
    gradient.addColorStop(0.2, '#FBE89B');
    gradient.addColorStop(0.4, '#D4AF37');
    gradient.addColorStop(0.6, '#AA7C11');
    gradient.addColorStop(0.8, '#FBE89B');
    gradient.addColorStop(1, '#996515');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw Festive Decorative Overlay Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    for (let i = -rect.height; i < rect.width + rect.height; i += 24) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + rect.height, rect.height);
      ctx.stroke();
    }

    // Draw Shimmer Border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, rect.width - 12, rect.height - 12);

    // Draw Center Icon and Text
    ctx.fillStyle = '#4A2800';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('✨ लकी स्क्रैच कार्ड ✨', rect.width / 2, rect.height / 2 - 24);

    ctx.font = '600 14px system-ui, sans-serif';
    ctx.fillStyle = '#683B04';
    ctx.fillText('उंगली या माउस से यहाँ स्क्रैच करें', rect.width / 2, rect.height / 2 + 12);

    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = '#8B5000';
    ctx.fillText('🎁 पक्का इनाम अंदर छुपा है!', rect.width / 2, rect.height / 2 + 36);
  }, []);

  useEffect(() => {
    initCanvas();
    const handleResize = () => {
      if (!isScratched) initCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas, isScratched]);

  // Calculate percentage of canvas scratched
  const checkScratchPercentage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const totalPixels = imgData.data.length / 4;
    let transparentPixels = 0;

    for (let i = 3; i < imgData.data.length; i += 4 * 16) {
      // sample every 16th pixel for high performance
      if (imgData.data[i] === 0) {
        transparentPixels++;
      }
    }

    const sampledTotal = totalPixels / 16;
    const percent = Math.round((transparentPixels / sampledTotal) * 100);
    setScratchPercent(percent);

    if (percent > 45 && !isScratched) {
      setIsScratched(true);
      triggerConfetti();
      onScratchComplete();
    }
  }, [isScratched, onScratchComplete, triggerConfetti]);

  // Scratch action handler
  const scratch = useCallback(
    (clientX: number, clientY: number) => {
      if (disabled || isScratched) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const x = (clientX - rect.left) * dpr;
      const y = (clientY - rect.top) * dpr;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 28 * dpr, 0, Math.PI * 2, false);
      ctx.fill();

      checkScratchPercentage();
    },
    [disabled, isScratched, checkScratchPercentage]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => setIsDrawing(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDrawing(true);
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing) return;
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => setIsDrawing(false);

  return (
    <div className="relative w-full max-w-[360px] mx-auto select-none">
      {/* Outer Festive Golden Frame */}
      <div className="relative p-3 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 shadow-2xl shadow-amber-900/30 border-2 border-yellow-200">
        <div className="relative w-full h-[220px] rounded-xl overflow-hidden bg-gradient-to-br from-red-950 via-rose-900 to-amber-950 border border-amber-400/40 flex items-center justify-center p-4">
          
          {/* UNDERNEATH: REVEALED PRIZE CARD */}
          <div className="text-center flex flex-col items-center justify-center space-y-2 w-full animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-amber-950 flex items-center justify-center shadow-lg animate-bounce">
              <Trophy className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                🎉 बधाई हो! आपने जीता
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white drop-shadow-md">
                {prize.title}
              </h3>
              <p className="text-xs text-amber-200/90 font-medium">
                {prize.terms_and_conditions}
              </p>
            </div>

            {isScratched && (
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40">
                  <Sparkles className="w-3.5 h-3.5" /> ऑफर अनलॉक हो गया!
                </span>
              </div>
            )}
          </div>

          {/* OVERLAY: SCRATCH CANVAS */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full cursor-pointer transition-opacity duration-500 ${
              isScratched ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </div>

        {/* Scratch Progress Indicator */}
        {!isScratched && (
          <div className="mt-3 flex items-center justify-between text-xs text-amber-950 font-bold px-1">
            <span className="flex items-center gap-1">
              <Gift className="w-3.5 h-3.5" /> स्क्रैच प्रगति:
            </span>
            <div className="w-32 bg-amber-900/30 rounded-full h-2 overflow-hidden border border-amber-800/40">
              <div
                className="bg-gradient-to-r from-amber-300 to-yellow-100 h-full transition-all duration-150"
                style={{ width: `${Math.min(100, scratchPercent * 2.2)}%` }}
              />
            </div>
            <span>{Math.min(100, Math.round(scratchPercent * 2.2))}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
