'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Clock, Award, MapPin, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { Campaign } from '@/types';
import { soundEngine } from '@/lib/audio';

interface FestivalHeaderProps {
  campaign: Campaign;
}

export const FestivalHeader: React.FC<FestivalHeaderProps> = ({ campaign }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [hasBounced, setHasBounced] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 12,
    hours: 8,
    minutes: 45,
    seconds: 30,
  });

  const toggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundEngine.playCelebrationChime();
    }
  };

  const handleLogoTap = () => {
    soundEngine.playBounceWhoosh();
    setHasBounced(false);
    setTimeout(() => setHasBounced(true), 10);
  };

  useEffect(() => {
    // Initial bounce trigger
    const timer = setTimeout(() => {
      setHasBounced(true);
      if (campaign.is_sound_enabled !== false) {
        soundEngine.playBounceWhoosh();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [campaign.is_sound_enabled]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="relative w-full text-center pt-1 pb-2 px-2 overflow-hidden select-none">
      {/* Dynamic Keyframe style for Uchalta (Spring Bouncing) Logo */}
      <style jsx global>{`
        @keyframes uchaltaBounce {
          0% {
            transform: scale(0.3) translateY(-40px);
            opacity: 0;
          }
          50% {
            transform: scale(1.15) translateY(6px);
            opacity: 1;
          }
          70% {
            transform: scale(0.95) translateY(-4px);
          }
          85% {
            transform: scale(1.04) translateY(2px);
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        .animate-uchalta-logo {
          animation: uchaltaBounce 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {/* Top Festive Badge & Floating Audio */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 text-yellow-300 text-[11px] font-black border border-amber-400/40 shadow-sm">
          <span>🪔</span>
          <span>शुभ नवरात्रि • महा बचत उत्सव</span>
        </span>

        <button
          type="button"
          onClick={toggleSound}
          title={isMuted ? 'साउंड चालू करें' : 'साउंड म्यूट करें'}
          className="p-1.5 px-2.5 rounded-full bg-black/60 hover:bg-black/80 border border-amber-500/40 text-amber-300 shadow-md backdrop-blur-sm transition-transform active:scale-90 flex items-center gap-1 text-[10px] font-bold"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />}
          <span>{isMuted ? 'म्यूट' : 'साउंड चालू'}</span>
        </button>
      </div>

      {/* Brand & Location Centerpiece (Single Compact Row / Card) */}
      <div className="p-3 rounded-2xl bg-gradient-to-b from-amber-950/70 via-black/60 to-red-950/60 border border-amber-500/40 backdrop-blur-md shadow-lg flex items-center gap-3 text-left relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* 3D Uchalta Logo */}
        <div
          onClick={handleLogoTap}
          className={`relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-yellow-300 cursor-pointer active:scale-95 transition-transform ${
            hasBounced ? 'animate-uchalta-logo' : 'opacity-0'
          }`}
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-[#350707] relative">
            <Image
              src="/nahata-logo.jpg"
              alt="Nahata General Stores Kushalgarh Logo"
              fill
              priority
              unoptimized
              className="object-cover object-center"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-[8px] font-black px-1 rounded-full shadow border border-white">
            ✓
          </span>
        </div>

        {/* Store Title & Address */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h1 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 truncate">
              {campaign.store_name}
            </h1>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold border border-amber-400/30 shrink-0">
              ओरिजिनल स्टोर
            </span>
          </div>

          <p className="text-[11px] text-amber-200/90 font-medium flex items-center gap-1 mt-0.5 truncate">
            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
            <span>बस स्टैंड रोड, कुशलगढ़ (राजस्थान)</span>
          </p>

          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 text-[10px] text-yellow-300 font-bold bg-amber-900/60 px-2 py-0.5 rounded-full border border-amber-500/30">
              <Award className="w-2.5 h-2.5 text-yellow-400" />
              <span>श्री मनोज नाहटा • 30+ वर्षों का विश्वास</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Campaign Hook Banner */}
      <div className="mt-2 p-2 rounded-xl bg-gradient-to-r from-red-600/30 via-amber-500/30 to-red-600/30 border border-amber-400/30 text-center">
        <h2 className="text-xs sm:text-sm font-black text-yellow-300 flex items-center justify-center gap-1.5">
          <span>🎁</span>
          <span>{campaign.headline || 'अपना लकी कार्ड स्क्रैच करें — 100% पक्का डिस्काउंट व गिफ्ट!'}</span>
        </h2>
        <div className="flex items-center justify-center gap-2.5 text-[10px] text-amber-200/90 mt-0.5">
          <span>⚡ 100% फ्री</span>
          <span>•</span>
          <span>🔥 104+ ग्राहक जीत चुके</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <Clock className="w-2.5 h-2.5" /> ऑफर सीमित समय
          </span>
        </div>
      </div>
    </header>
  );
};

