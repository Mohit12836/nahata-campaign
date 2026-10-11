'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Gift, Disc, Lock } from 'lucide-react';
import { Campaign, Prize, Coupon } from '@/types';
import {
  getStoredCampaign,
  getStoredPrizes,
  getSessionTargetPrize,
} from '@/lib/store';
import { claimCampaignPrizeAction } from '@/app/actions/campaign';
import { INITIAL_PRIZES, INITIAL_CAMPAIGN } from '@/lib/mock-data';
import { FestivalHeader } from '@/components/FestivalHeader';
import { ScratchCard } from '@/components/ScratchCard';
import { SpinWheel } from '@/components/SpinWheel';
import { OfferClaimModal } from '@/components/OfferClaimModal';
import { CouponCard } from '@/components/CouponCard';
import { TrustBadges } from '@/components/TrustBadges';

const subscribe = () => () => {};

export default function CustomerCampaignPage() {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const targetPrize = useSyncExternalStore(
    subscribe,
    getSessionTargetPrize,
    () => INITIAL_PRIZES[0]
  );

  const [campaign] = useState<Campaign>(getStoredCampaign);
  const [prizes] = useState<Prize[]>(getStoredPrizes);
  const [activeTab, setActiveTab] = useState<'scratch' | 'spin'>('scratch');
  const [gameStage, setGameStage] = useState<'GAME' | 'CLAIM' | 'COUPON'>('GAME');
  
  const [wonCoupon, setWonCoupon] = useState<Coupon | null>(null);
  const [alreadyPlayedNotice, setAlreadyPlayedNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGameFinished = () => {
    setGameStage('CLAIM');
  };

  const handleFormSubmit = async (formData: {
    fullName: string;
    phone: string;
    city: string;
    businessCategory: string;
  }) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await claimCampaignPrizeAction({
        campaignId: campaign.id,
        fullName: formData.fullName,
        phone: formData.phone,
        city: formData.city,
        businessCategory: formData.businessCategory,
        gameType: activeTab,
        consent: true,
        targetPrizeId: targetPrize?.id,
      });

      setIsSubmitting(false);

      if (result.status === 'ERROR') {
        setErrorMessage(result.message);
        return;
      }

      if (result.status === 'ALREADY_PLAYED') {
        setAlreadyPlayedNotice(result.message);
      } else {
        setAlreadyPlayedNotice(null);
      }

      if (result.coupon) {
        setWonCoupon(result.coupon);
        setGameStage('COUPON');
      }
    } catch {
      setIsSubmitting(false);
      setErrorMessage('सर्वर से संपर्क करने में समस्या हुई। कृपया पुनः प्रयास करें।');
    }
  };

  const currentCampaign = campaign || INITIAL_CAMPAIGN;
  const currentPrize = targetPrize || INITIAL_PRIZES[0];

  return (
    <main className="min-h-screen bg-gradient-to-b from-red-950 via-[#2a0808] to-slate-950 text-slate-100 flex flex-col items-center justify-between pb-12 relative overflow-x-hidden selection:bg-amber-500 selection:text-amber-950">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-gradient-to-b from-amber-500/20 via-rose-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Top Bar with Admin Link */}
      <div className="w-full max-w-md mx-auto px-4 pt-3 flex items-center justify-between z-20 text-xs">
        <span className="text-[11px] font-bold text-amber-400/90 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/40 truncate max-w-[200px]">
          📍 कुशलगढ़, राजस्थान
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
        <FestivalHeader campaign={currentCampaign} />

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
              {!isClient ? (
                <div className="w-full aspect-square max-w-[320px] mx-auto rounded-3xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-300 text-xs font-bold animate-pulse">
                  लकी कार्ड लोड हो रहा है...
                </div>
              ) : activeTab === 'scratch' ? (
                <ScratchCard
                  prize={currentPrize}
                  onScratchComplete={handleGameFinished}
                />
              ) : (
                <SpinWheel
                  prizes={prizes}
                  targetPrize={currentPrize}
                  onSpinComplete={handleGameFinished}
                />
              )}
            </div>
          </div>
        )}

        {/* STAGE 2: LEAD CLAIM MODAL FORM */}
        {gameStage === 'CLAIM' && (
          <div className="space-y-3">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-400/50 text-red-200 text-xs font-semibold text-center animate-in fade-in">
                ⚠️ {errorMessage}
              </div>
            )}
            <OfferClaimModal
              campaign={currentCampaign}
              prize={currentPrize}
              onSubmit={handleFormSubmit}
              isLoading={isSubmitting}
            />
          </div>
        )}

        {/* STAGE 3: WON COUPON TICKET VIEW */}
        {gameStage === 'COUPON' && wonCoupon && (
          <div className="space-y-3">
            {alreadyPlayedNotice && (
              <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs font-semibold text-center animate-in fade-in">
                ℹ️ {alreadyPlayedNotice} (आपका पूर्व-सत्यापित कूपन नीचे प्रदर्शित है)
              </div>
            )}
            <CouponCard coupon={wonCoupon} campaign={currentCampaign} />
          </div>
        )}

        {/* Trust Badges & Store Info */}
        <TrustBadges campaign={currentCampaign} />
      </div>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto px-4 mt-8 text-center text-xs text-amber-400/60 space-y-1">
        <p>© 2026 {currentCampaign.store_name} • सर्वाधिकार सुरक्षित</p>
        <p className="text-[10px]">
          त्योहार का लकी कूपन सिस्टम • Powered by Rajasthan Retail Tech
        </p>
      </footer>
    </main>
  );
}
