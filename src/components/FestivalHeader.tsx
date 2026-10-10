'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Award } from 'lucide-react';
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
    <header className="relative w-full text-center pt-6 pb-4 px-4 overflow-hidden">
      {/* Festive Garland Lights SVG */}
      <div className="flex justify-center items-center gap-4 sm:gap-6 mb-3 opacity-90">
        {['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#EC4899', '#F59E0B', '#EF4444'].map((col, idx) => (
          <div key={idx} className="flex flex-col items-center animate-pulse" style={{ animationDelay: `${idx * 200}ms` }}>
            <div className="w-1.5 h-3 bg-amber-800" />
            <div
              className="w-3.5 h-5 rounded-full shadow-lg"
              style={{ backgroundColor: col, boxShadow: `0 0 10px ${col}` }}
            />
          </div>
        ))}
      </div>

      {/* Trust Badge Top */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-3 shadow-sm">
        <Award className="w-3.5 h-3.5 text-yellow-300" />
        <span>{campaign.contact_person} द्वारा अधिकृत स्टोर</span>
      </div>

      {/* Main Store & Festival Title */}
      <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 drop-shadow-md tracking-tight">
        {campaign.title}
      </h1>

      <p className="mt-2 text-xs sm:text-sm text-amber-200/90 max-w-lg mx-auto font-medium leading-relaxed">
        {campaign.headline}
      </p>

      {/* Countdown Timer */}
      <div className="mt-4 inline-flex items-center gap-2 p-2 px-4 rounded-2xl bg-black/40 backdrop-blur-md border border-amber-500/30 shadow-inner">
        <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
        <span className="text-xs font-bold text-amber-300">ऑफर समाप्त होने में:</span>
        <div className="flex items-center gap-1.5 text-xs font-mono font-black text-white">
          <span className="bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40 text-yellow-300">
            {timeLeft.days}d
          </span>
          :
          <span className="bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40 text-yellow-300">
            {timeLeft.hours}h
          </span>
          :
          <span className="bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40 text-yellow-300">
            {timeLeft.minutes}m
          </span>
          :
          <span className="bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40 text-rose-400">
            {timeLeft.seconds}s
          </span>
        </div>
      </div>
    </header>
  );
};
