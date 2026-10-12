'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, ArrowRight, Volume2 } from 'lucide-react';
import { soundEngine } from '@/lib/audio';

interface LogoIntroScreenProps {
  storeName: string;
  onEnter: () => void;
}

export const LogoIntroScreen: React.FC<LogoIntroScreenProps> = ({
  storeName,
  onEnter,
}) => {
  const handleProceed = () => {
    try {
      soundEngine.startFestiveBGM();
      soundEngine.playCelebrationChime();
    } catch {}
    onEnter();
  };

  return (
    <div className="flex-1 flex flex-col justify-between items-center text-center px-4 py-8 select-none animate-in fade-in zoom-in-95 duration-500 min-h-[92dvh]">
      {/* Top Auspicious Inscription */}
      <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-950 via-red-900 to-red-950 border border-amber-400/60 shadow-lg text-amber-300 text-xs font-black">
          <span className="text-sm">🪔</span>
          <span>॥ श्री गणेशाय नमः • जय माता दी ॥</span>
        </div>
      </div>

      {/* Center Cinematic Zooming Logo */}
      <div className="flex flex-col items-center justify-center space-y-6 my-auto py-6">
        <div className="relative group cursor-pointer" onClick={handleProceed}>
          {/* Pulsing Radiant Glow */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500 via-yellow-400 to-rose-600 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />

          {/* Logo Container with Zoom In Animation */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-2 bg-gradient-to-tr from-amber-400 via-[#FFF4D8] to-amber-600 shadow-[0_0_40px_rgba(255,200,87,0.7)] border-4 border-amber-300 animate-logo-intro">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#26030A] relative shadow-inner">
              <Image
                src="/nahata-logo.jpg"
                alt={storeName}
                fill
                priority
                unoptimized
                className="object-cover"
              />
            </div>
            {/* Verified Badge */}
            <span className="absolute bottom-1 right-2 bg-emerald-600 text-white text-xs font-black px-2 py-0.5 rounded-full border-2 border-white shadow-lg">
              ✓ ओरिजिनल
            </span>
          </div>
        </div>

        {/* Store Title with Grand Typography */}
        <div className="space-y-1.5 px-2">
          <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFF4D8] via-[#FFD700] to-[#FFF4D8] tracking-tight drop-shadow-md">
            {storeName}
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/90 font-bold">
            बस स्टैंड रोड, कुशलगढ़ (राजस्थान)
          </p>
          <p className="text-[11px] text-amber-400/80 font-medium">
            30+ वर्षों का अटूट विश्वास और गारंटी • प्रो. श्री मनोज नाहाटा
          </p>
        </div>
      </div>

      {/* Bottom Action CTA */}
      <div className="w-full max-w-xs space-y-3 pb-4">
        <button
          type="button"
          onClick={handleProceed}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base shadow-[0_0_25px_rgba(255,200,87,0.5)] flex items-center justify-center gap-2 active:scale-95 transition-all text-center border-2 border-amber-200 animate-bounce"
        >
          <span>पधारिए / आगे बढ़ें</span>
          <ArrowRight className="w-5 h-5 text-slate-950" />
        </button>
        <p className="text-[10px] text-amber-200/70">
          टैप करके नवरात्रि विशेष ऑफर में प्रवेश करें ✨
        </p>
      </div>
    </div>
  );
};
