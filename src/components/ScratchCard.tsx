'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Gift, Wand2 } from 'lucide-react';
import { Prize } from '@/types';
import { soundEngine } from '@/lib/audio';

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

  // Trigger celebration confetti & audio
  const triggerConfetti = useCallback(() => {
    try {
      soundEngine.playCelebrationChime();
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFC857', '#FFB020', '#5B0716', '#17864B', '#FFF4D8'],
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

    // Reset transform & scale to DPR
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // Draw Golden Metallic Festive Gradient
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, '#D4AF37');
    gradient.addColorStop(0.2, '#FFE89B');
    gradient.addColorStop(0.4, '#FFC857');
    gradient.addColorStop(0.65, '#B8860B');
    gradient.addColorStop(0.85, '#FFE89B');
    gradient.addColorStop(1, '#8B6508');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw Festive Decorative Diagonal Overlay Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;
    for (let i = -rect.height; i < rect.width + rect.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + rect.height, rect.height);
      ctx.stroke();
    }

    // Draw Shimmer Border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(4, 4, rect.width - 8, rect.height - 8);

    // Draw Center Header & Help Texts
    ctx.fillStyle = '#3A060F';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillText('✨ लकी स्क्रैच कार्ड ✨', rect.width / 2, rect.height / 2 - 18);

    ctx.font = '600 12px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#5B0716';
    ctx.fillText('उंगली से यहाँ स्क्रैच करें', rect.width / 2, rect.height / 2 + 8);

    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#86152B';
    ctx.fillText('🎁 पक्का डिस्काउंट अंदर छुपा है', rect.width / 2, rect.height / 2 + 28);
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
    setTimeout(() => {
      onScratchComplete();
    }, 700);
  }, [isScratched, onScratchComplete, triggerConfetti]);

  // Calculate percentage of canvas scratched
  const checkScratchPercentage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const totalPixels = imgData.data.length / 4;
    let transparentPixels = 0;

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

  // Silky smooth scratch action
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
    <div className="relative w-full max-w-[320px] mx-auto select-none">
      {/* Outer Festive Golden Frame */}
      <div className="relative p-2 rounded-2xl bg-gradient-to-br from-[#FFC857] via-[#FFB020] to-[#B8860B] shadow-xl border-2 border-[#FFE89B]">
        <div className="relative w-full h-[155px] sm:h-[165px] rounded-xl overflow-hidden bg-gradient-to-br from-[#26030A] via-[#5B0716] to-[#26030A] border border-[#FFC857]/40 flex items-center justify-center p-3">
          
          {/* UNDERNEATH: REVEALED PRIZE CARD */}
          <div className="text-center flex flex-col items-center justify-center space-y-1.5 w-full animate-in fade-in duration-300">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FFC857] to-[#FFE89B] text-[#26030A] flex items-center justify-center shadow-md animate-bounce">
              <Trophy className="w-5 h-5" />
            </div>

            <div className="space-y-0.5 max-w-[260px]">
              <span className="inline-block px-2 py-0.2 rounded-full text-[9px] font-black tracking-wide uppercase bg-[#FFC857]/20 text-[#FFC857] border border-[#FFC857]/30">
                🎉 बधाई हो! आपने जीता
              </span>
              <h3 className="text-base sm:text-lg font-black text-[#FFF4D8] drop-shadow-md line-clamp-1">
                {prize.title}
              </h3>
              <p className="text-[10px] text-[#E8D9D0] font-medium line-clamp-1">
                {prize.terms_and_conditions}
              </p>
            </div>

            {isScratched && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#17864B] bg-white px-2 py-0.5 rounded-full shadow-xs">
                <Sparkles className="w-3 h-3 text-[#FFB020]" /> ऑफर अनलॉक!
              </span>
            )}
          </div>

          {/* OVERLAY: SCRATCH CANVAS */}
          <canvas
            ref={canvasRef}
            style={{ touchAction: 'none' }}
            className={`absolute inset-0 w-full h-full cursor-pointer transition-opacity duration-300 ${
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
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-[#26030A] font-black px-1">
              <span className="flex items-center gap-1">
                <Gift className="w-3 h-3" /> स्क्रैच:
              </span>
              <div className="w-24 bg-[#26030A]/20 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#26030A] h-full transition-all duration-150"
                  style={{ width: `${Math.min(100, scratchPercent * 2.6)}%` }}
                />
              </div>
              <span>{Math.min(100, Math.round(scratchPercent * 2.6))}%</span>
            </div>

            <button
              type="button"
              onClick={handleCompleteReveal}
              className="w-full py-1 px-2.5 rounded-lg bg-[#26030A]/20 hover:bg-[#26030A]/30 text-[#26030A] text-[10px] font-black flex items-center justify-center gap-1 transition-all border border-[#26030A]/20 active:scale-98"
            >
              <Wand2 className="w-3 h-3" />
              <span>पूरा कार्ड रिवील करें (Auto Reveal)</span>
            </button>
          </div>
        ) : (
          <div className="mt-1.5 text-center text-[10px] font-black text-[#26030A]">
            ✨ कूपन क्लेम करने हेतु अगला चरण खुल रहा है...
          </div>
        )}
      </div>
    </div>
  );
};
