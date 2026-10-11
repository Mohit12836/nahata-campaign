'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Volume2, VolumeX, MapPin, Sparkles, Award } from 'lucide-react';
import { Campaign } from '@/types';
import { soundEngine } from '@/lib/audio';

interface FestivalHeaderProps {
  campaign: Campaign;
  onInfoClick?: () => void;
}

export const FestivalHeader: React.FC<FestivalHeaderProps> = ({
  campaign,
  onInfoClick,
}) => {
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted);

  const toggleSound = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundEngine.playCelebrationChime();
    }
  };

  const handleLogoClick = () => {
    if (!isMuted) {
      soundEngine.playBounceWhoosh();
    }
    if (onInfoClick) {
      onInfoClick();
    }
  };

  return (
    <header className="w-full text-center select-none pt-1 shrink-0">
      {/* 1. Spiritual Invocation Banner & Sound Toggle */}
      <div className="flex items-center justify-between gap-2 px-1 mb-1">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#5B0716]/90 text-[#FFC857] border border-[#FFC857]/40 shadow-xs">
          <span>🪔</span>
          <span>॥ जय माता दी ॥ • शुभ नवरात्रि महोत्सव</span>
        </span>

        <button
          type="button"
          onClick={toggleSound}
          title={isMuted ? 'साउंड चालू करें' : 'साउंड म्यूट करें'}
          className="p-1 px-2 rounded-full bg-black/60 hover:bg-black/80 border border-[#FFC857]/40 text-[#FFC857] shadow-xs backdrop-blur-xs transition-transform active:scale-95 flex items-center gap-1 text-[10px] font-bold"
        >
          {isMuted ? (
            <VolumeX className="w-3 h-3 text-rose-400" />
          ) : (
            <Volume2 className="w-3 h-3 text-[#FFC857] animate-pulse" />
          )}
          <span>{isMuted ? 'म्यूट' : 'साउंड चालू'}</span>
        </button>
      </div>

      {/* 2. Compact Store Identity Card */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-r from-[#5B0716]/90 via-[#26030A]/95 to-[#5B0716]/90 border border-[#FFC857]/40 shadow-md backdrop-blur-sm flex items-center gap-2.5 text-left">
        {/* Real Nahata Store Logo */}
        <div
          onClick={handleLogoClick}
          className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full p-0.5 bg-gradient-to-tr from-[#FFC857] via-[#FFB020] to-[#FFC857] shadow-md border border-[#FFC857] cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-[#26030A] relative">
            <Image
              src="/nahata-logo.jpg"
              alt="नाहाटा जनरल स्टोर्स कुशलगढ़"
              fill
              priority
              unoptimized
              className="object-cover"
            />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 bg-[#17864B] text-white text-[8px] font-black px-1 rounded-full border border-white">
            ✓
          </span>
        </div>

        {/* Store Title & Location */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFF4D8] via-[#FFC857] to-[#FFF4D8] truncate tracking-tight">
              {campaign.store_name}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[#E8D9D0] mt-0.5 truncate">
            <span className="flex items-center gap-0.5 font-medium truncate">
              <MapPin className="w-2.5 h-2.5 text-rose-400 shrink-0" />
              <span>बस स्टैंड रोड, कुशलगढ़</span>
            </span>
            <span>•</span>
            <span className="text-[#FFC857] font-bold shrink-0">श्री मनोज नाहाटा</span>
          </div>
        </div>

        {/* Info drawer trigger pill */}
        {onInfoClick && (
          <button
            type="button"
            onClick={onInfoClick}
            className="text-[9px] font-bold text-[#FFC857] bg-[#FFC857]/15 hover:bg-[#FFC857]/25 border border-[#FFC857]/30 px-2 py-1 rounded-lg shrink-0 transition-colors"
          >
            विवरण ℹ️
          </button>
        )}
      </div>

      {/* 3. Campaign Headline Strip */}
      <div className="mt-1.5 px-2 py-1 rounded-xl bg-gradient-to-r from-[#86152B]/40 via-[#FFC857]/15 to-[#86152B]/40 border border-[#FFC857]/30 text-center">
        <h2 className="text-xs sm:text-[13px] font-black text-[#FFC857] flex items-center justify-center gap-1">
          <span>🎁</span>
          <span>मेगा लकी ड्रॉ ऑफर</span>
          <span>—</span>
          <span className="text-[#FFF4D8] font-bold">नाहाटा स्टोर्स की खास पेशकश</span>
        </h2>
      </div>
    </header>
  );
};
