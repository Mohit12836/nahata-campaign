'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Volume2, VolumeX, MapPin, Sparkles, Crown } from 'lucide-react';
import { Campaign } from '@/types';
import { soundEngine } from '@/lib/audio';

export type CampaignTheme = 'white-light' | 'royal-crimson';

interface FestivalHeaderProps {
  campaign: Campaign;
  onInfoClick?: () => void;
  theme?: CampaignTheme;
  onThemeToggle?: () => void;
}

export const FestivalHeader: React.FC<FestivalHeaderProps> = ({
  campaign,
  onInfoClick,
  theme = 'white-light',
  onThemeToggle,
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

  const isLight = theme === 'white-light';

  return (
    <header className="w-full text-center select-none pt-1 shrink-0">
      {/* Sleek, Premium Store Top Identity Bar */}
      <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-gradient-to-r from-black/80 via-zinc-900/90 to-black/80 border border-amber-400/40 shadow-lg backdrop-blur-md">
        {/* Store Brand & Logo */}
        <div className="flex items-center gap-2.5 text-left">
          <div
            onClick={handleLogoClick}
            className="relative w-10 h-10 shrink-0 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-yellow-500 shadow-md border border-amber-300 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-black relative">
              <Image
                src="/nahata-logo.jpg"
                alt="नाहाटा जनरल स्टोर्स"
                fill
                priority
                unoptimized
                className="object-cover"
              />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black text-amber-100 tracking-tight truncate">
                {campaign.store_name}
              </h1>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold shrink-0">
                कुशलगढ़
              </span>
            </div>
            <p className="text-[10px] text-amber-200/70 font-medium truncate flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 text-rose-400 shrink-0" />
              <span>बस स्टैंड रोड • प्रो. श्री मनोज नाहाटा</span>
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={toggleSound}
            title={isMuted ? 'साउंड चालू करें' : 'साउंड म्यूट करें'}
            className="p-1.5 px-2 rounded-full border border-amber-400/40 bg-black/60 text-amber-300 hover:text-white transition-transform active:scale-95 flex items-center gap-1 text-[10px] font-bold"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            )}
            <span className="text-[9px]">{isMuted ? 'म्यूट' : 'साउंड'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

