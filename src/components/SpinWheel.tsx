'use client';

import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowDown, Play } from 'lucide-react';
import { Prize } from '@/types';

interface SpinWheelProps {
  prizes: Prize[];
  targetPrize: Prize;
  onSpinComplete: () => void;
  disabled?: boolean;
}

const COLORS = [
  '#E11D48', // Rose
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#6366F1', // Indigo
  '#D97706', // Gold-amber
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EC4899', // Pink
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

    // Calculate rotation:
    // Standard pointer is at top (270 deg or 90 deg depending on orientation).
    // Let's place pointer at 0 deg (top).
    // Target sector angle center: safeTargetIndex * segmentAngle + segmentAngle / 2
    const targetOffset = safeTargetIndex * segmentAngle + segmentAngle / 2;
    // We want this target sector to end up directly under the top pointer (360 - targetOffset)
    const baseSpins = 360 * 5; // 5 full rotations
    const finalAngle = rotation + baseSpins + (360 - (targetOffset % 360));

    setRotation(finalAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#E11D48', '#F59E0B', '#10B981', '#6366F1'],
        });
      } catch {}
      onSpinComplete();
    }, 4000);
  };

  return (
    <div className="relative w-full max-w-[340px] mx-auto flex flex-col items-center select-none">
      {/* Top Pointer Needle */}
      <div className="relative z-20 -mb-5 flex flex-col items-center animate-bounce">
        <div className="w-8 h-8 rounded-full bg-gradient-to-b from-amber-200 to-yellow-500 shadow-xl border-2 border-white flex items-center justify-center text-amber-950 font-black text-xs">
          ▼
        </div>
      </div>

      {/* Wheel Outer Festive Frame */}
      <div className="relative p-3 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 shadow-2xl border-4 border-yellow-300">
        <div className="relative w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] rounded-full overflow-hidden bg-slate-900 shadow-inner">
          
          {/* Rotating SVG Wheel */}
          <div
            className="w-full h-full rounded-full transition-transform"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: isSpinning ? '4000ms' : '0ms',
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

                // Text placement vector
                const textX = 150 + 95 * Math.cos(midAngle);
                const textY = 150 + 95 * Math.sin(midAngle);
                const textRotation = (i + 0.5) * segmentAngle + 90;

                const pathData = `M 150 150 L ${x1} ${y1} A 150 150 0 0 1 ${x2} ${y2} Z`;

                return (
                  <g key={prize.id}>
                    <path
                      d={pathData}
                      fill={COLORS[i % COLORS.length]}
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
                      className="drop-shadow"
                    >
                      {prize.title.length > 14 ? `${prize.title.substring(0, 13)}…` : prize.title}
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
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full shadow-2xl border-4 border-yellow-200 flex flex-col items-center justify-center font-extrabold text-xs transition-transform active:scale-95 z-10 ${
              isSpinning || hasSpun
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-br from-yellow-300 via-amber-500 to-amber-700 text-amber-950 hover:scale-105 animate-pulse'
            }`}
          >
            {isSpinning ? (
              <span className="text-[10px]">घूम रहा...</span>
            ) : hasSpun ? (
              <Sparkles className="w-5 h-5 text-yellow-300" />
            ) : (
              <>
                <Play className="w-4 h-4 fill-current mb-0.5" />
                <span>SPIN</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Helper instruction */}
      <p className="mt-3 text-xs text-amber-900 font-semibold flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
        {hasSpun
          ? '🎉 बधाई हो! आपका ऑफर अनलॉक हो चुका है।'
          : isSpinning
          ? '🎰 लकी व्हील घूम रहा है...'
          : 'बीच के बटन पर क्लिक करके व्हील घुमाएं'}
      </p>
    </div>
  );
};
