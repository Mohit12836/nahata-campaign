'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Play } from 'lucide-react';
import { Prize } from '@/types';
import { soundEngine } from '@/lib/audio';

interface SpinWheelProps {
  prizes: Prize[];
  targetPrize: Prize;
  onSpinComplete: () => void;
  disabled?: boolean;
}

const FESTIVE_WHEEL_COLORS = [
  '#86152B', // Royal Maroon
  '#D97706', // Amber Gold
  '#5B0716', // Deep Crimson
  '#17864B', // Success Green
  '#B45309', // Warm Bronze
  '#9333EA', // Purple
  '#0284C7', // Sky Blue
  '#E11D48', // Crimson Rose
];

export const SpinWheel: React.FC<SpinWheelProps> = ({
  prizes,
  targetPrize,
  onSpinComplete,
  disabled = false,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hasSpun, setHasSpun] = useState(false);

  const numSegments = Math.max(prizes.length, 4);
  const segmentAngle = 360 / numSegments;

  // Find target prize index
  const targetIndex = prizes.findIndex((p) => p.id === targetPrize.id);
  const safeTargetIndex = targetIndex >= 0 ? targetIndex : 0;

  const handleSpin = () => {
    if (isSpinning || hasSpun || disabled) return;

    setIsSpinning(true);

    // Needle is at top 12 o'clock (270 deg in SVG)
    const targetOffset = safeTargetIndex * segmentAngle + segmentAngle / 2;
    const targetNormalized = ((270 - targetOffset) % 360 + 360) % 360;
    const currentNormalized = rotation % 360;
    const delta = ((targetNormalized - currentNormalized) % 360 + 360) % 360;
    const finalAngle = rotation + 360 * 5 + delta;

    setRotation(finalAngle);

    // Audio clicks during wheel rotation
    const clickInterval = setInterval(() => {
      soundEngine.playTick();
    }, 180);

    setTimeout(() => {
      clearInterval(clickInterval);
      setIsSpinning(false);
      setHasSpun(true);
      try {
        soundEngine.playCelebrationChime();
        confetti({
          particleCount: 80,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#FFC857', '#FFB020', '#5B0716', '#17864B', '#FFF4D8'],
        });
      } catch {}
      setTimeout(() => {
        onSpinComplete();
      }, 700);
    }, 3800);
  };

  return (
    <div className="relative w-full max-w-[280px] mx-auto flex flex-col items-center select-none py-0.5">
      {/* Top Pointer Needle */}
      <div className="relative z-20 -mb-3.5 flex flex-col items-center animate-bounce">
        <div className="w-6 h-6 rounded-full bg-gradient-to-b from-[#FFF4D8] to-[#FFC857] shadow-lg border-2 border-white flex items-center justify-center text-[#26030A] font-black text-[10px]">
          ▼
        </div>
      </div>

      {/* Wheel Outer Festive Frame */}
      <div className="relative p-2 rounded-full bg-gradient-to-tr from-[#FFC857] via-[#FFB020] to-[#B8860B] shadow-xl border-2 border-[#FFE89B]">
        <div className="relative w-[190px] h-[190px] sm:w-[210px] sm:h-[210px] rounded-full overflow-hidden bg-[#26030A] shadow-inner">
          
          {/* Rotating SVG Wheel */}
          <div
            className="w-full h-full rounded-full transition-transform"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: isSpinning ? '3800ms' : '0ms',
              transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.25, 1)',
            }}
          >
            <svg viewBox="0 0 300 300" className="w-full h-full">
              {prizes.map((prize, i) => {
                const startAngle = (i * segmentAngle * Math.PI) / 180;
                const endAngle = (((i + 1) * segmentAngle) * Math.PI) / 180;
                const midAngle = ((i + 0.5) * segmentAngle * Math.PI) / 180;

                const x1 = 150 + 150 * Math.cos(startAngle);
                const y1 = 150 + 150 * Math.sin(startAngle);
                const x2 = 150 + 150 * Math.cos(endAngle);
                const y2 = 150 + 150 * Math.sin(endAngle);

                const textX = 150 + 95 * Math.cos(midAngle);
                const textY = 150 + 95 * Math.sin(midAngle);
                const textRotation = (i + 0.5) * segmentAngle + 90;

                const pathData = `M 150 150 L ${x1} ${y1} A 150 150 0 0 1 ${x2} ${y2} Z`;

                return (
                  <g key={prize.id}>
                    <path
                      d={pathData}
                      fill={FESTIVE_WHEEL_COLORS[i % FESTIVE_WHEEL_COLORS.length]}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                    <text
                      x={textX}
                      y={textY}
                      fill="#FFFFFF"
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                      className="drop-shadow-sm"
                    >
                      {prize.title.length > 12 ? `${prize.title.substring(0, 11)}…` : prize.title}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Center Spin Action Button */}
          <button
            type="button"
            onClick={handleSpin}
            disabled={isSpinning || hasSpun || disabled}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-13 h-13 rounded-full shadow-xl border-2 border-[#FFE89B] flex flex-col items-center justify-center font-black text-[10px] transition-transform active:scale-95 z-10 ${
              isSpinning || hasSpun
                ? 'bg-stone-800 text-stone-400 cursor-not-allowed'
                : 'bg-gradient-to-br from-[#FFE89B] via-[#FFC857] to-[#FFB020] text-[#26030A] hover:scale-105'
            }`}
          >
            {isSpinning ? (
              <span className="text-[9px]">घूम रहा...</span>
            ) : hasSpun ? (
              <Sparkles className="w-4 h-4 text-[#FFC857]" />
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current mb-0.5" />
                <span>SPIN</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Helper instruction */}
      <p className="mt-1 text-[10px] text-[#FFC857] font-semibold flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-[#FFB020]" />
        {hasSpun
          ? '🎉 ऑफर अनलॉक हो चुका है!'
          : isSpinning
          ? '🎰 लकी व्हील घूम रहा है...'
          : 'बीच के बटन पर टैप करके व्हील घुमाएं'}
      </p>
    </div>
  );
};
