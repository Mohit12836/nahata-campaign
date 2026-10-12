'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, Sparkles, Gift } from 'lucide-react';
import { Campaign } from '@/types';
import { soundEngine } from '@/lib/audio';

interface NavratriBlessingScreenProps {
  campaign: Campaign;
  onProceed: () => void;
}

export const NavratriBlessingScreen: React.FC<NavratriBlessingScreenProps> = ({
  campaign,
  onProceed,
}) => {
  const handleProceed = () => {
    try {
      soundEngine.playCelebrationChime();
    } catch {}
    onProceed();
  };

  return (
    <div className="flex-1 flex flex-col justify-between items-center text-center px-4 py-6 select-none animate-in fade-in zoom-in-95 duration-400 min-h-[92dvh]">
      {/* Top Auspicious Header */}
      <div className="space-y-1.5 pt-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-amber-400/50 text-amber-300 text-xs font-black shadow">
          <span>🚩</span>
          <span>शुभ नवरात्रि महापर्व 2026</span>
        </span>
      </div>

      {/* Divine Center Card */}
      <div className="w-full max-w-sm p-6 rounded-3xl bg-gradient-to-b from-[#3B070E] via-[#5B0716] to-[#26030A] border-2 border-amber-400/80 shadow-[0_0_35px_rgba(255,200,87,0.3)] space-y-5 my-auto relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Sacred Durga Maa Photo */}
        <div className="relative w-28 h-28 mx-auto rounded-full p-1.5 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 shadow-[0_0_25px_rgba(255,215,0,0.7)] border-2 border-yellow-200">
          <div className="w-full h-full rounded-full overflow-hidden relative bg-[#26030A]">
            <Image
              src="/durga-maa.svg"
              alt="माँ दुर्गा"
              fill
              priority
              unoptimized
              className="object-cover scale-105"
            />
          </div>
          <span className="absolute -top-1 -right-1 bg-red-600 text-yellow-200 text-xs font-black w-6 h-6 rounded-full border-2 border-yellow-300 flex items-center justify-center shadow-md animate-bounce">
            🔱
          </span>
        </div>

        {/* Wishes and Manoj Bhaiya Message */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-amber-300">
            हार्दिक शुभकामनाएं! 🎉
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-semibold">
            माता रानी के पावन पर्व पर, <strong className="text-amber-300">श्री मनोज भैया</strong> की ओर से सभी कुशलगढ़ वासियों को नवरात्रि की मंगलमय शुभकामनाएं!
          </p>
        </div>

        {/* Special Festival Gift Box Tag */}
        <div className="p-3 rounded-2xl bg-black/60 border border-amber-400/40 text-left flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center text-xl shrink-0 font-black shadow">
            🎁
          </div>
          <div>
            <h4 className="text-xs font-black text-amber-200">
              महा-धमाका लकी रिवॉर्ड
            </h4>
            <p className="text-[10px] text-amber-300/80 font-medium">
              हर ग्राहक के लिए निश्चित स्पेशल गिफ्ट व महा-बचत वाउचर!
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Continue Button */}
      <div className="w-full max-w-xs space-y-2 pb-4">
        <button
          type="button"
          onClick={handleProceed}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all text-center border-2 border-amber-200"
        >
          <Gift className="w-5 h-5 text-slate-950" />
          <span>ऑफर देखें (Step 2) ➔</span>
        </button>
        <p className="text-[10px] text-amber-200/70">
          दुकान के सभी ऑफर्स देखने के लिए आगे बढ़ें
        </p>
      </div>
    </div>
  );
};
