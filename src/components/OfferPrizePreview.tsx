'use client';

import React from 'react';
import { Gift, Tag, Sparkles } from 'lucide-react';
import { Prize } from '@/types';

interface OfferPrizePreviewProps {
  prizes: Prize[];
}

export const OfferPrizePreview: React.FC<OfferPrizePreviewProps> = ({ prizes }) => {
  // Take first 3 prizes to display in compact cards
  const previewPrizes = prizes.slice(0, 3);

  return (
    <div className="w-full my-1.5 select-none">
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="text-[10px] font-bold text-[#FFC857] flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#FFB020]" />
          <span>इस लकी ड्रॉ में क्या जीत सकते हैं?</span>
        </span>
        <span className="text-[9px] text-[#FFF4D8]/70 font-medium">100% पक्का इनाम</span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {previewPrizes.map((prize, idx) => (
          <div
            key={prize.id || idx}
            className="p-1.5 rounded-xl bg-gradient-to-b from-[#86152B]/40 to-[#26030A]/60 border border-[#FFC857]/30 text-center flex flex-col items-center justify-center min-h-[58px] shadow-sm backdrop-blur-xs transition-transform active:scale-98"
          >
            <div className="w-5 h-5 rounded-full bg-[#FFC857]/20 flex items-center justify-center text-[#FFC857] mb-1">
              {idx === 0 ? (
                <Gift className="w-3 h-3" />
              ) : idx === 1 ? (
                <Tag className="w-3 h-3" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
            </div>
            <p className="text-[10px] font-extrabold text-[#FFF4D8] leading-tight line-clamp-1">
              {prize.title.split(' ')[0]} {prize.title.split(' ')[1] || ''}
            </p>
            <span className="text-[8px] text-[#FFC857] font-semibold mt-0.5 line-clamp-1">
              {idx === 0 ? 'कैश डिस्काउंट' : idx === 1 ? 'गिफ्ट आइटम' : 'स्पेशल ऑफर'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
