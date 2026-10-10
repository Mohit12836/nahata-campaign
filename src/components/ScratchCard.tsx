'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Gift, Wand2 } from 'lucide-react';
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
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);

  // Trigger celebration confetti
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#E11D48', '#F59E0B', '#10B981', '#6366F1', '#EC4899', '#FBBF24'],
      });
    } catch {
      // fallback safe
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
    
    // Reset transform & scale to DPR
    ctx.setTransform(1, 0, 0, 1, 0, 0);
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

    // Draw Festive Decorative Diagonal Overlay Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    for (let i = -rect.height; i < rect.width + rect.height; i += 22) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + rect.height, rect.height);
      ctx.stroke();
    }

    // Draw Shimmer Border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.strokeRect(5, 5, rect.width - 10, rect.height - 10);

    // Draw Center Header & Help Texts
    ctx.fillStyle = '#4A2800';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillText('✨ लकी स्क्रैच कार्ड ✨', rect.width / 2, rect.height / 2 - 22);

    ctx.font = '600 13px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#683B04';
    ctx.fillText('उंगली या माउस से यहाँ स्क्रैच करें', rect.width / 2, rect.height / 2 + 12);

    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#8B5000';
    ctx.fillText('🎁 पक्का डिस्काउंट वाउचर अंदर छुपा है!', rect.width / 2, rect.height / 2 + 34);
  }, []);

  useEffect(() => {
    initCanvas();
    const handleResize = () => {
      if (!isScratched) initCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas, isScratched]);

  // Complete Auto-Reveal
  const handleCompleteReveal = useCallback(() => {
    if (isScratched) return;
    setIsScratched(true);
    setScratchPercent(100);
    triggerConfetti();
    onScratchComplete();
  }, [isScratched, onScratchComplete, triggerConfetti]);

  // Calculate percentage of canvas scratched
  const checkScratchPercentage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use full pixel buffer
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const totalPixels = imgData.data.length / 4;
    let transparentPixels = 0;

    // Sample every 12th pixel for balanced speed and accuracy
    const stride = 12;
    for (let i = 3; i < imgData.data.length; i += 4 * stride) {
      if (imgData.data[i] === 0) {
        transparentPixels++;
      }
    }

    const sampledTotal = totalPixels / stride;
    const percent = Math.round((transparentPixels / sampledTotal) * 100);
    setScratchPercent(percent);

    if (percent >= 38 && !isScratched) {
      handleCompleteReveal();
    }
  }, [isScratched, handleCompleteReveal]);

  // Continuous silky smooth scratch action
  const scratch = useCallback(
    (clientX: number, clientY: number) => {
      if (disabled || isScratched) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const currentX = clientX - rect.left;
      const currentY = clientY - rect.top;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 42;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (lastPointRef.current) {
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(currentX, currentY, 21, 0, Math.PI * 2);
        ctx.fill();
      }

      lastPointRef.current = { x: currentX, y: currentY };
      checkScratchPercentage();
    },
    [disabled, isScratched, checkScratchPercentage]
  );

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    lastPointRef.current = null;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  // Touch Handlers with touchAction: 'none'
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    lastPointRef.current = null;
    if (e.touches.length > 0) {
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || e.touches.length === 0) return;
    scratch(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  return (
    <div className="relative w-full max-w-[360px] mx-auto select-none">
      {/* Outer Festive Golden Frame */}
      <div className="relative p-3 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 shadow-2xl shadow-amber-900/40 border-2 border-yellow-200">
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

          {/* OVERLAY: SCRATCH CANVAS (touchAction: none prevents mobile scrolling conflicts) */}
          <canvas
            ref={canvasRef}
            style={{ touchAction: 'none' }}
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

        {/* Scratch Controls & Progress */}
        {!isScratched ? (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-amber-950 font-bold px-1">
              <span className="flex items-center gap-1">
                <Gift className="w-3.5 h-3.5" /> स्क्रैच प्रगति:
              </span>
              <div className="w-28 bg-amber-900/30 rounded-full h-2 overflow-hidden border border-amber-800/40">
                <div
                  className="bg-gradient-to-r from-amber-300 to-yellow-100 h-full transition-all duration-150"
                  style={{ width: `${Math.min(100, scratchPercent * 2.6)}%` }}
                />
              </div>
              <span>{Math.min(100, Math.round(scratchPercent * 2.6))}%</span>
            </div>

            {/* Quick 1-Click Auto Reveal button for zero-friction convenience */}
            <button
              type="button"
              onClick={handleCompleteReveal}
              className="w-full py-1.5 px-3 rounded-xl bg-amber-950/20 hover:bg-amber-950/30 text-amber-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-amber-900/30 active:scale-[0.98]"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>पूरा कार्ड रिवील करें (Auto Reveal)</span>
            </button>
          </div>
        ) : (
          <div className="mt-2 text-center text-xs font-bold text-amber-950">
            ✨ कूपन क्लेम करने हेतु नीचे फॉर्म भरें 👇
          </div>
        )}
      </div>
    </div>
  );
};
