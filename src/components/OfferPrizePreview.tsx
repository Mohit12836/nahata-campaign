'use client';

import React from 'react';
import { Gift, Tag, Sparkles } from 'lucide-react';
import { Prize } from '@/types';
import { CampaignTheme } from './FestivalHeader';

interface OfferPrizePreviewProps {
  prizes: Prize[];
  theme?: CampaignTheme;
}

export const OfferPrizePreview: React.FC<OfferPrizePreviewProps> = ({
  prizes,
  theme = 'white-light',
}) => {
  // Take first 3 prizes to display in compact cards
  const previewPrizes = prizes.slice(0, 3);
  const isLight = theme === 'white-light';

  return (
    <div className="w-full my-1 select-none">
      <div className="flex items-center justify-between mb-1 px-1">
        <span
          className={`text-[10px] font-black flex items-center gap-1 ${
            isLight ? 'text-[#7A0019]' : 'text-[#FFC857]'
          }`}
        >
          <Sparkles className={`w-3 h-3 ${isLight ? 'text-amber-500' : 'text-[#FFB020]'}`} />
          <span>इस लकी ड्रॉ में क्या जीत सकते हैं?</span>
        </span>
        <span
          className={`text-[9px] font-bold px-2 py-0.2 rounded-full border ${
            isLight
              ? 'bg-amber-100 text-[#7A0019] border-amber-300'
              : 'text-[#FFF4D8]/80 border-amber-400/30 bg-black/40'
          }`}
        >
          100% पक्का इनाम
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {previewPrizes.map((prize, idx) => (
          <div
            key={prize.id || idx}
            className={`p-1.5 rounded-xl border text-center flex flex-col items-center justify-center min-h-[58px] shadow-sm transition-transform active:scale-98 ${
              isLight
                ? 'bg-white/95 border-amber-300 hover:border-amber-400 shadow-[0_2px_10px_rgba(212,175,55,0.15)]'
                : 'bg-gradient-to-b from-[#86152B]/40 to-[#26030A]/60 border-[#FFC857]/30 backdrop-blur-xs'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center mb-0.5 ${
                isLight ? 'bg-amber-100 text-[#7A0019]' : 'bg-[#FFC857]/20 text-[#FFC857]'
              }`}
            >
              {idx === 0 ? (
                <Gift className="w-3 h-3" />
              ) : idx === 1 ? (
                <Tag className="w-3 h-3" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
            </div>
            <p
              className={`text-[10px] font-black leading-tight line-clamp-1 ${
                isLight ? 'text-[#7A0019]' : 'text-[#FFF4D8]'
              }`}
            >
              {prize.title.split(' ')[0]} {prize.title.split(' ')[1] || ''}
            </p>
            <span
              className={`text-[8px] font-bold mt-0.5 line-clamp-1 ${
                isLight ? 'text-[#B45309]' : 'text-[#FFC857]'
              }`}
            >
              {idx === 0 ? 'कैश डिस्काउंट' : idx === 1 ? 'गिफ्ट आइटम' : 'स्पेशल ऑफर'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
