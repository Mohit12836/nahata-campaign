'use client';

import React from 'react';
import { Prize, Campaign } from '@/types';
import { Gift, ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { soundEngine } from '@/lib/audio';

interface OfferShowcaseScreenProps {
  campaign: Campaign;
  prizes: Prize[];
  onStartGame: () => void;
}

export const OfferShowcaseScreen: React.FC<OfferShowcaseScreenProps> = ({
  campaign,
  prizes,
  onStartGame,
}) => {
  const handleProceed = () => {
    try {
      soundEngine.playCelebrationChime();
    } catch {}
    onStartGame();
  };

  return (
    <div className="flex-1 flex flex-col justify-between items-center text-center px-3.5 py-5 select-none animate-in fade-in zoom-in-95 duration-400 min-h-[92dvh]">
      {/* Top Header */}
      <div className="space-y-1 pt-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black shadow">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>धमाका ऑफर्स की सूची • STEP 3</span>
        </span>
        <h2 className="text-lg sm:text-xl font-black text-white pt-1">
          नाहाटा स्टोर्स पर क्या-क्या जीत सकते हैं?
        </h2>
        <p className="text-[11px] text-amber-200/80">
          स्क्रैच करके अपना भाग्यशाली इनाम अभी खोलें!
        </p>
      </div>

      {/* Prize Cards List */}
      <div className="w-full max-w-sm space-y-2.5 my-3 max-h-[55vh] overflow-y-auto px-1 pr-1.5">
        {prizes.map((prz, index) => (
          <div
            key={prz.id}
            className="p-3 rounded-2xl bg-gradient-to-r from-black/80 via-[#3B070E]/70 to-black/80 border border-amber-400/40 text-left flex items-start gap-3 shadow-md hover:border-amber-300 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black flex items-center justify-center shrink-0 shadow text-base">
              {index === 0 ? '🎁' : index === 1 ? '🥣' : index === 2 ? '🧦' : index === 3 ? '🍶' : '🎫'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs sm:text-[13px] font-black text-amber-200 truncate">
                  {prz.title}
                </h4>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-300 shrink-0">
                  न्यूनतम ₹{prz.min_order_value}
                </span>
              </div>
              <p className="text-[10px] text-amber-100/70 mt-1 line-clamp-2 leading-relaxed">
                {prz.terms_and_conditions}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Badge */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-amber-200 font-bold bg-black/60 py-1 px-4 rounded-full border border-amber-400/30">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>100% निश्चित इनाम • कुशलगढ़ स्थानीय दुकान</span>
      </div>

      {/* Bottom Start Game CTA */}
      <div className="w-full max-w-xs space-y-2 pt-2 pb-3">
        <button
          type="button"
          onClick={handleProceed}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all text-center border-2 border-amber-200"
        >
          <Gift className="w-5 h-5 text-slate-950" />
          <span>कार्ड स्क्रैच करें (Step 4) ➔</span>
        </button>
        <p className="text-[10px] text-amber-200/70">
          टैप करके लकी स्क्रैच कार्ड या स्पिन व्हील खेलें
        </p>
      </div>
    </div>
  );
};
