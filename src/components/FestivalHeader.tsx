'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Volume2, VolumeX, MapPin } from 'lucide-react';
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
    <header className="w-full text-center select-none pt-1 shrink-0 space-y-1.5">
      {/* 1. Spiritual Invocation Banner & Sound Toggle */}
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-[#86152B] via-[#B91C1C] to-[#86152B] text-[#FFF4D8] border border-[#FFC857]/60 shadow-md">
          <span className="text-yellow-300 animate-pulse">🪔</span>
          <span>॥ ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे ॥</span>
        </span>

        <button
          type="button"
          onClick={toggleSound}
          title={isMuted ? 'साउंड चालू करें' : 'साउंड म्यूट करें'}
          className="p-1 px-2.5 rounded-full bg-black/70 hover:bg-black/90 border border-[#FFC857]/50 text-[#FFC857] shadow-sm backdrop-blur-xs transition-transform active:scale-95 flex items-center gap-1 text-[10px] font-bold"
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-[#FFC857] animate-pulse" />
          )}
          <span>{isMuted ? 'म्यूट' : 'साउंड'}</span>
        </button>
      </div>

      {/* 2. Primary Store Identity Card (नाहाटा जनरल स्टोर्स लोगो सबसे ऊपर) */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-r from-[#5B0716]/95 via-[#26030A] to-[#5B0716]/95 border-2 border-[#FFC857]/60 shadow-lg backdrop-blur-sm flex items-center gap-2.5 text-left relative overflow-hidden">
        {/* Shimmer light bar across store identity */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#FFC857]/20 rounded-full blur-xl pointer-events-none" />

        {/* Real Nahata Store Logo */}
        <div
          onClick={handleLogoClick}
          className="relative w-12 h-12 sm:w-13 sm:h-13 shrink-0 rounded-full p-0.5 bg-gradient-to-tr from-[#FFC857] via-[#FFF4D8] to-[#FFB020] shadow-[0_0_15px_rgba(255,200,87,0.5)] border-2 border-[#FFC857] cursor-pointer active:scale-95 transition-transform"
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
          <div className="flex items-center gap-1.5 flex-wrap">
            <h1 className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFF4D8] via-[#FFD700] to-[#FFF4D8] truncate tracking-tight drop-shadow-sm">
              {campaign.store_name}
            </h1>
            <span className="text-[9px] bg-amber-400/20 text-yellow-300 px-1.5 py-0.2 rounded font-bold border border-amber-300/40 shrink-0">
              ओरिजिनल स्टोर
            </span>
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

      {/* 3. Logo Ke Niche Durga Maa Animated Photo & Navratri Shubhkamnaye */}
      <div className="relative px-2.5 py-2 rounded-2xl bg-gradient-to-r from-[#4A000A] via-[#7F1D1D] to-[#4A000A] border-2 border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.35)] flex items-center justify-between gap-3 text-left overflow-hidden">
        {/* Radiant Divine Halo Ambient Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-yellow-300/20 to-red-600/10 pointer-events-none animate-pulse" />

        {/* Sacred Animated Durga Maa Photo */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-full p-1 bg-gradient-to-tr from-[#FFD700] via-[#FFF9C4] to-[#FF8F00] shadow-[0_0_15px_rgba(255,215,0,0.8)] border border-yellow-200">
          <div className="w-full h-full rounded-full overflow-hidden relative bg-[#3B070E]">
            <Image
              src="/durga-maa.svg"
              alt="माँ दुर्गा - शुभ नवरात्रि"
              fill
              priority
              unoptimized
              className="object-cover scale-105 animate-[spin_18s_linear_infinite]"
              style={{ animationDuration: '30s' }}
            />
          </div>
          {/* Shimmer Trishul Gem */}
          <span className="absolute -top-1 -right-1 bg-red-600 text-yellow-200 text-[9px] font-black w-4 h-4 rounded-full border border-yellow-300 flex items-center justify-center shadow-md animate-bounce">
            🔱
          </span>
        </div>

        {/* Navratri Shubhkamnaye Message & Offer Callout */}
        <div className="flex-1 min-w-0 z-10">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-yellow-400 text-red-950 shadow-xs mb-0.5">
            <span>🚩</span>
            <span>शुभ नवरात्रि की हार्दिक शुभकामनाएं</span>
          </div>

          <p className="text-xs sm:text-[13px] font-black text-white leading-tight drop-shadow-sm mt-0.5">
            माता रानी के पावन पर्व पर — <span className="text-[#FFD700]">विशेष लकी ड्रॉ धमाका!</span>
          </p>

          <p className="text-[10px] text-amber-200/95 font-medium mt-0.5 truncate">
            मनोज भैया की ओर से सभी ग्राहकों को 100% मुफ़्त उपहार वाउचर
          </p>
        </div>
      </div>
    </header>
  );
};
