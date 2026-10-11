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
    <header className="relative w-full text-center pt-2 pb-2 px-2 sm:px-4 overflow-hidden select-none">
      {/* Dynamic Keyframe style for Uchalta (Spring Bouncing) Logo */}
      <style jsx global>{`
        @keyframes uchaltaBounce {
          0% {
            transform: scale(0.3) translateY(-90px);
            opacity: 0;
          }
          50% {
            transform: scale(1.18) translateY(12px);
            opacity: 1;
          }
          70% {
            transform: scale(0.92) translateY(-8px);
          }
          85% {
            transform: scale(1.06) translateY(4px);
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        .animate-uchalta-logo {
          animation: uchaltaBounce 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {/* Floating Audio Toggle in Top Right */}
      <div className="absolute top-2 right-2 z-30">
        <button
          type="button"
          onClick={toggleSound}
          title={isMuted ? 'साउंड चालू करें' : 'साउंड म्यूट करें'}
          className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-amber-500/40 text-amber-300 shadow-md backdrop-blur-sm transition-transform active:scale-90 flex items-center gap-1 text-[10px]"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />}
          <span className="hidden sm:inline font-bold">{isMuted ? 'म्यूट' : 'साउंड चालू'}</span>
        </button>
      </div>

      {/* 1. Festive Ambient Garland Lights */}
      <div className="flex justify-center items-center gap-3 sm:gap-5 mb-4 opacity-90">
        {['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#EC4899', '#F59E0B', '#EF4444'].map((col, idx) => (
          <div key={idx} className="flex flex-col items-center animate-pulse" style={{ animationDelay: `${idx * 180}ms` }}>
            <div className="w-1.5 h-2 bg-amber-900" />
            <div
              className="w-3 h-4.5 rounded-full shadow-lg"
              style={{ backgroundColor: col, boxShadow: `0 0 12px ${col}` }}
            />
          </div>
        ))}
      </div>

      {/* 2. UCHALTA BRAND LOGO (Customer Trust Anchor) */}
      <div className="relative inline-block mb-3 group cursor-pointer" onClick={handleLogoTap}>
        {/* Ambient Radial Golden Glow behind Logo */}
        <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/40 via-yellow-400/50 to-orange-500/40 rounded-full blur-2xl opacity-75 animate-pulse" />
        
        {/* 3D Floating / Spring Bouncing Container */}
        <div
          className={`relative w-36 h-36 sm:w-44 sm:h-44 mx-auto rounded-full p-1.5 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 shadow-[0_12px_40px_rgba(245,158,11,0.5)] border border-yellow-300/70 transform transition-transform duration-300 hover:scale-105 active:scale-95 ${
            hasBounced ? 'animate-uchalta-logo' : 'opacity-0'
          }`}
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-[#350707] relative shadow-inner">
            <Image
              src="/nahata-logo.jpg"
              alt="Nahata General Stores Kushalgarh Rajasthan Logo"
              fill
              priority
              unoptimized
              sizes="(max-width: 640px) 144px, 176px"
              className="object-cover object-center scale-[1.02] drop-shadow-md"
            />
          </div>

          {/* Golden Verified Seal Tag */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black text-[10px] sm:text-[11px] px-3 py-0.5 rounded-full shadow-md border border-white/60 flex items-center gap-1 whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3 fill-emerald-800 text-white" />
            <span>ओरिजिनल स्टोर • कुशलगढ़</span>
          </div>
        </div>
      </div>

      {/* 3. Verified Authority & Location Badge */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-950/80 text-amber-300 text-[11px] font-bold border border-amber-500/40 shadow-sm">
          <Award className="w-3.5 h-3.5 text-yellow-400" />
          <span>{campaign.contact_person} द्वारा अधिकृत</span>
        </span>
        <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-black/40 text-amber-200/90 text-[11px] font-semibold border border-white/10">
          <MapPin className="w-3 h-3 text-rose-400" />
          <span>कुशलगढ़, राजस्थान</span>
        </span>
      </div>

      {/* 4. Main Campaign Headline */}
      <h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 drop-shadow-md tracking-tight">
        {campaign.title}
      </h1>

      <p className="mt-1.5 text-xs sm:text-sm text-amber-200/90 max-w-md mx-auto font-medium leading-relaxed">
        {campaign.headline}
      </p>

      {/* 5. Trust Category Badges (Customer Confidence) */}
      <div className="mt-3 flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-amber-300/90 flex-wrap">
        <span className="bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/30">🛒 किराना & सुपरमार्ट</span>
        <span className="bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/30">📦 प्लास्टिक & कंटेनर</span>
        <span className="bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/30">🏠 घरेलू सामान</span>
        <span className="bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/30">🎁 स्टेशनरी व गिफ्ट</span>
      </div>

      {/* 6. Festive Countdown Timer (Urgency + Trust) */}
      <div className="mt-4 inline-flex items-center gap-2 p-2 px-3.5 sm:px-4 rounded-2xl bg-black/60 backdrop-blur-md border border-amber-500/40 shadow-inner">
        <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
        <span className="text-[11px] sm:text-xs font-bold text-amber-300">ऑफर समाप्त होने में:</span>
        <div className="flex items-center gap-1 sm:gap-1.5 text-xs font-mono font-black text-white">
          <span className="bg-amber-950/90 px-1.5 py-0.5 rounded border border-amber-500/50 text-yellow-300">
            {timeLeft.days}d
          </span>
          :
          <span className="bg-amber-950/90 px-1.5 py-0.5 rounded border border-amber-500/50 text-yellow-300">
            {timeLeft.hours}h
          </span>
          :
          <span className="bg-amber-950/90 px-1.5 py-0.5 rounded border border-amber-500/50 text-yellow-300">
            {timeLeft.minutes}m
          </span>
          :
          <span className="bg-amber-950/90 px-1.5 py-0.5 rounded border border-amber-500/50 text-rose-400">
            {timeLeft.seconds}s
          </span>
        </div>
      </div>
    </header>
  );
};

