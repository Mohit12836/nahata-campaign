'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Sparkles, Gift, Disc, UserCheck, Shield, ChevronRight, Lock } from 'lucide-react';
import { Campaign, Prize, Coupon } from '@/types';
import {
  getStoredCampaign,
  getStoredPrizes,
  executeGamePlay,
  getStoredCoupons,
} from '@/lib/store';
import { FestivalHeader } from '@/components/FestivalHeader';
import { ScratchCard } from '@/components/ScratchCard';
import { SpinWheel } from '@/components/SpinWheel';
import { OfferClaimModal } from '@/components/OfferClaimModal';
import { CouponCard } from '@/components/CouponCard';
import { TrustBadges } from '@/components/TrustBadges';

export default function CustomerCampaignPage() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [activeTab, setActiveTab] = useState<'scratch' | 'spin'>('scratch');
  const [gameStage, setGameStage] = useState<'GAME' | 'CLAIM' | 'COUPON'>('GAME');
  
  const [targetPrize, setTargetPrize] = useState<Prize | null>(null);
  const [wonCoupon, setWonCoupon] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize campaign & default target prize
  useEffect(() => {
    const c = getStoredCampaign();
    const p = getStoredPrizes();
    setCampaign(c);
    setPrizes(p);

    // Pick an initial prize from active pool
    const active = p.filter((item) => item.is_active);
    if (active.length > 0) {
      const randomPrize = active[Math.floor(Math.random() * active.length)];
      setTargetPrize(randomPrize);
    }
  }, []);

  const handleGameFinished = () => {
    setGameStage('CLAIM');
  };

  const handleFormSubmit = (formData: {
    fullName: string;
    phone: string;
    city: string;
    businessCategory: string;
  }) => {
    setIsSubmitting(true);
    setTimeout(() => {
      const result = executeGamePlay(
        formData.phone,
        formData.fullName,
        formData.city,
        formData.businessCategory,
        activeTab
      );

      setIsSubmitting(false);

      if (result.coupon) {
        setWonCoupon(result.coupon);
        setGameStage('COUPON');
      }
    }, 400);
  };

  if (!campaign || !targetPrize) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-300 font-bold text-sm">
        लोड हो रहा है...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-red-950 via-[#2a0808] to-slate-950 text-slate-100 flex flex-col items-center justify-between pb-12 relative overflow-x-hidden selection:bg-amber-500 selection:text-amber-950">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-gradient-to-b from-amber-500/20 via-rose-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Top Bar with Admin Link */}
      <div className="w-full max-w-md mx-auto px-4 pt-3 flex items-center justify-between z-20 text-xs">
        <span className="text-[11px] font-bold text-amber-400/80 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30">
          📍 {campaign.location}
        </span>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 font-bold text-amber-300 hover:text-amber-200 bg-amber-900/40 hover:bg-amber-900/60 px-3 py-1 rounded-full border border-amber-500/40 transition-colors"
        >
          <Lock className="w-3 h-3" />
          <span>एडमिन पोर्टल</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto px-4 z-10 space-y-6">
        {/* Festival Header */}
        <FestivalHeader campaign={campaign} />

        {/* STAGE 1: THE GAME (Scratch Card or Spin Wheel) */}
        {gameStage === 'GAME' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Game Selector Tabs */}
            <div className="p-1 rounded-2xl bg-black/50 border border-amber-500/30 backdrop-blur-md grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('scratch')}
                className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'scratch'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 shadow-md scale-[1.02]'
                    : 'text-amber-200/80 hover:text-white'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>लकी स्क्रैच कार्ड</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('spin')}
                className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'spin'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 shadow-md scale-[1.02]'
                    : 'text-amber-200/80 hover:text-white'
                }`}
              >
                <Disc className="w-4 h-4" />
                <span>लकी स्पिन व्हील</span>
              </button>
            </div>

            {/* Render Active Game */}
            <div className="py-2">
              {activeTab === 'scratch' ? (
                <ScratchCard
                  prize={targetPrize}
                  onScratchComplete={handleGameFinished}
                />
              ) : (
                <SpinWheel
                  prizes={prizes}
                  targetPrize={targetPrize}
                  onSpinComplete={handleGameFinished}
                />
              )}
            </div>
          </div>
        )}

        {/* STAGE 2: LEAD CLAIM MODAL FORM */}
        {gameStage === 'CLAIM' && targetPrize && (
          <OfferClaimModal
            campaign={campaign}
            prize={targetPrize}
            onSubmit={handleFormSubmit}
            isLoading={isSubmitting}
          />
        )}

        {/* STAGE 3: WON COUPON TICKET VIEW */}
        {gameStage === 'COUPON' && wonCoupon && (
          <CouponCard coupon={wonCoupon} campaign={campaign} />
        )}

        {/* Trust Badges & Store Info */}
        <TrustBadges campaign={campaign} />
      </div>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto px-4 mt-8 text-center text-xs text-amber-400/60 space-y-1">
        <p>© 2026 {campaign.store_name} • सर्वाधिकार सुरक्षित</p>
        <p className="text-[10px]">
          त्योहार का लकी कूपन सिस्टम • Powered by Rajasthan Retail Tech
        </p>
      </footer>
    </main>
  );
}
