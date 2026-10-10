'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Clock, Award, ShieldCheck, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
import { Campaign } from '@/types';

interface FestivalHeaderProps {
  campaign: Campaign;
}

export const FestivalHeader: React.FC<FestivalHeaderProps> = ({ campaign }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 12,
    hours: 8,
    minutes: 45,
    seconds: 30,
  });

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

      {/* 2. TOP OFFICIAL 3D EMBLEM LOGO SHOWCASE (Customer Trust Anchor) */}
      <div className="relative inline-block mb-3 group">
        {/* Ambient Radial Golden Glow behind Logo */}
        <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/40 via-yellow-400/50 to-orange-500/40 rounded-full blur-2xl opacity-75 animate-pulse" />
        
        {/* 3D Floating / Breathing Container */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto rounded-full p-1.5 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 shadow-[0_10px_35px_rgba(245,158,11,0.45)] border border-yellow-300/60 transform transition-transform duration-500 hover:scale-105 active:scale-95">
          <div className="w-full h-full rounded-full overflow-hidden bg-[#350707] relative shadow-inner">
            <Image
              src="/nahata-logo.jpg"
              alt="Nahata General Stores Kushalgarh Rajasthan Logo"
              fill
              priority
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

