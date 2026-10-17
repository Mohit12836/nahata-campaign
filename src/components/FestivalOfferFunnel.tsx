'use client';

import React, { useState, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Gift, Disc, ChevronDown } from 'lucide-react';
import { soundEngine } from '@/lib/audio';
import {
  claimCampaignPrizeAction,
  getActiveCustomerSessionAction,
} from '@/app/actions/campaign';
import { INITIAL_PRIZES, INITIAL_CAMPAIGN } from '@/lib/mock-data';
import { Campaign, Prize, Coupon } from '@/types';
import { FestivalHeader } from './FestivalHeader';
import { OfferPrizePreview } from './OfferPrizePreview';
import { ScratchCard } from './ScratchCard';
import { SpinWheel } from './SpinWheel';
import { LogoIntroScreen } from './LogoIntroScreen';
import { NavratriBlessingScreen } from './NavratriBlessingScreen';
import { OfferShowcaseScreen } from './OfferShowcaseScreen';
import { OfferClaimModal } from './OfferClaimModal';
import { WeeklySaleClubStep } from './WeeklySaleClubStep';
import { CouponCard } from './CouponCard';
import { CustomerDashboard } from './CustomerDashboard';
import { OfferRulesSheet } from './OfferRulesSheet';

export enum FunnelStage {
  LOGO_INTRO = 'LOGO_INTRO',
  NAVRATRI_GREETING = 'NAVRATRI_GREETING',
  OFFER_SHOWCASE = 'OFFER_SHOWCASE',
  SCRATCH_PLAY = 'SCRATCH_PLAY',
  CLAIM = 'CLAIM',
  WEEKLY_CLUB = 'WEEKLY_CLUB',
  COUPON = 'COUPON',
  DASHBOARD = 'DASHBOARD',
}

interface FestivalOfferFunnelProps {
  campaign?: Campaign;
  prizes?: Prize[];
  targetPrize?: Prize;
}

export default function FestivalOfferFunnel({
  campaign = INITIAL_CAMPAIGN,
  prizes = INITIAL_PRIZES,
  targetPrize,
}: FestivalOfferFunnelProps) {
  // Funnel State Machine: LOGO_INTRO -> NAVRATRI_GREETING -> OFFER_SHOWCASE -> SCRATCH_PLAY -> CLAIM -> WEEKLY_CLUB -> COUPON -> DASHBOARD
  const [stage, setStage] = useState<FunnelStage>(FunnelStage.LOGO_INTRO);
  const [gameMode, setGameMode] = useState<'scratch' | 'spin'>('scratch');
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [wonCoupon, setWonCoupon] = useState<Coupon | null>(null);

  // Check if customer already has a valid active session on mount
  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      try {
        const res = await getActiveCustomerSessionAction();
        if (isMounted && res.isAuthenticated && res.coupon) {
          setWonCoupon(res.coupon);
          if (res.coupon.prize) {
            setWonPrize(res.coupon.prize);
          }
          setStage(FunnelStage.DASHBOARD);
        }
      } catch {}
    }
    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Active prize resolved from targetPrize or first available prize
  const activePrize = wonPrize || targetPrize || prizes[0] || INITIAL_PRIZES[0];

  // Bottom Sheet Drawer for Info & Rules
  const [showRulesSheet, setShowRulesSheet] = useState(false);

  // Form Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [alreadyPlayedNotice, setAlreadyPlayedNotice] = useState<string | null>(null);

  // Confetti Blast Helper
  const triggerCelebration = useCallback(() => {
    try {
      soundEngine.playCelebrationChime();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFC857', '#86152B', '#17864B', '#FFB020', '#FFFFFF'],
      });
    } catch {}
  }, []);

  // Called when Scratch Card or Spin Wheel finishes
  const handleGameFinished = () => {
    setStage(FunnelStage.CLAIM);
  };

  // Called when user submits the claim form
  const handleFormSubmit = async (formData: {
    fullName: string;
    phone: string;
    city: string;
    businessCategory: string;
  }) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await claimCampaignPrizeAction({
        campaignId: campaign.id,
        fullName: formData.fullName,
        phone: formData.phone,
        city: formData.city,
        businessCategory: formData.businessCategory,
        gameType: gameMode,
        consent: true,
        targetPrizeId: activePrize.id,
      });

      setIsSubmitting(false);

      if (response.status === 'ERROR' || response.status === 'EXHAUSTED') {
        setErrorMessage(response.message || 'त्रुटि हुई। कृपया पुनः प्रयास करें।');
        return;
      }

      if (response.status === 'ALREADY_PLAYED') {
        setAlreadyPlayedNotice(response.message);
      } else {
        setAlreadyPlayedNotice(null);
      }

      if (response.coupon) {
        setWonCoupon(response.coupon);
        if (response.prize) {
          setWonPrize(response.prize);
        }
        triggerCelebration();
        // Advance to STEP 2: Weekly Sale & Redemption Club
        setStage(FunnelStage.WEEKLY_CLUB);
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'सर्वर से संपर्क करने में समस्या हुई। कृपया इंटरनेट कनेक्शन जांचें।'
      );
    }
  };

  return (
    <div
      className={`w-full max-w-md mx-auto bg-gradient-to-b from-[#26030A] via-[#35050D] to-[#120104] text-[#FFF4D8] relative flex flex-col justify-between selection:bg-[#FFC857] selection:text-[#26030A] shadow-2xl ${
        stage === FunnelStage.SCRATCH_PLAY || stage === FunnelStage.LOGO_INTRO
          ? 'h-[100dvh] max-h-[100dvh] overflow-hidden'
          : 'min-h-[100dvh] overflow-y-auto pb-6'
      }`}
    >
      {/* Ambient Festive Lighting Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-64 bg-[#FFC857]/15 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 -right-20 w-60 h-60 bg-[#86152B]/20 blur-3xl pointer-events-none rounded-full" />

      {/* Main Viewport Content */}
      <div className="flex-1 flex flex-col justify-between px-2.5 py-1 z-10 w-full max-w-md mx-auto">
        {/* ========================================================= */}
        {/* SCREEN 1: LOGO ZOOM IN/OUT GRAND INTRO                   */}
        {/* ========================================================= */}
        {stage === FunnelStage.LOGO_INTRO && (
          <LogoIntroScreen
            storeName={campaign.store_name}
            onEnter={() => setStage(FunnelStage.NAVRATRI_GREETING)}
          />
        )}

        {/* ========================================================= */}
        {/* SCREEN 2: NAVRATRI SHUBHKAMNAYE & BLESSINGS                */}
        {/* ========================================================= */}
        {stage === FunnelStage.NAVRATRI_GREETING && (
          <NavratriBlessingScreen
            campaign={campaign}
            onProceed={() => setStage(FunnelStage.OFFER_SHOWCASE)}
          />
        )}

        {/* ========================================================= */}
        {/* SCREEN 3: OFFER SHOWCASE (DHAMAKA LIST)                   */}
        {/* ========================================================= */}
        {stage === FunnelStage.OFFER_SHOWCASE && (
          <OfferShowcaseScreen
            campaign={campaign}
            prizes={prizes}
            onStartGame={() => setStage(FunnelStage.SCRATCH_PLAY)}
          />
        )}

        {/* ========================================================= */}
        {/* SCREEN 4: LUCKY SCRATCH CARD & SPIN WHEEL PLAY             */}
        {/* ========================================================= */}
        {stage === FunnelStage.SCRATCH_PLAY && (
          <div className="flex flex-col justify-between h-full py-0.5 animate-in fade-in duration-300">
            {/* Top Compact Brand Header */}
            <FestivalHeader campaign={campaign} />

            {/* Game Selector Tabs */}
            <div className="w-full my-0.5 p-0.5 rounded-xl bg-black/60 border border-[#FFC857]/40 backdrop-blur-sm grid grid-cols-2 gap-1 shadow-sm shrink-0">
              <button
                type="button"
                onClick={() => setGameMode('scratch')}
                className={`py-1.5 px-2.5 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                  gameMode === 'scratch'
                    ? 'bg-gradient-to-r from-[#FFC857] via-[#FFB020] to-[#FFC857] text-[#26030A] shadow scale-[1.01]'
                    : 'text-[#FFF4D8]/80 hover:text-white'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>लकी स्क्रैच कार्ड</span>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('spin')}
                className={`py-1.5 px-2.5 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                  gameMode === 'spin'
                    ? 'bg-gradient-to-r from-[#FFC857] via-[#FFB020] to-[#FFC857] text-[#26030A] shadow scale-[1.01]'
                    : 'text-[#FFF4D8]/80 hover:text-white'
                }`}
              >
                <Disc className="w-3.5 h-3.5" />
                <span>लकी स्पिन व्हील</span>
              </button>
            </div>

            {/* Center Game Arena */}
            <div className="w-full flex-1 flex flex-col items-center justify-center py-0.5 min-h-0">
              {gameMode === 'scratch' ? (
                <ScratchCard
                  prize={activePrize}
                  onScratchComplete={handleGameFinished}
                />
              ) : (
                <SpinWheel
                  prizes={prizes}
                  targetPrize={activePrize}
                  onSpinComplete={handleGameFinished}
                />
              )}
            </div>

            {/* Compact Trust Strip & Rules Drawer Trigger */}
            <div className="w-full text-center space-y-1 shrink-0 pt-0.5 pb-0.5">
              <div className="flex items-center justify-center gap-2 text-[10px] text-[#FFF4D8]/90 font-bold bg-black/60 py-1 px-3 rounded-full border border-[#FFC857]/30">
                <span>🔒 स्थानीय दुकान</span>
                <span>•</span>
                <span>स्पष्ट ऑफर नियम</span>
                <span>•</span>
                <span>दुकान पर कूपन दिखाएँ</span>
              </div>

              <button
                type="button"
                onClick={() => setShowRulesSheet(true)}
                className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-[#FFC857] hover:text-white underline font-semibold transition-colors"
              >
                <span>📋 दुकान का पता, समय व नियम (विस्तार से देखें)</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 2: INSTANT PRIZE CLAIM (Warm Ivory Card Form)        */}
        {/* ========================================================= */}
        {stage === FunnelStage.CLAIM && (
          <div className="flex-1 flex flex-col justify-center py-2 animate-in fade-in zoom-in-95 duration-200">
            {errorMessage && (
              <div className="mb-2 p-2.5 rounded-xl bg-red-950/80 border border-red-500 text-red-200 text-xs font-semibold text-center">
                ⚠️ {errorMessage}
              </div>
            )}
            <OfferClaimModal
              campaign={campaign}
              prize={activePrize}
              onSubmit={handleFormSubmit}
              isLoading={isSubmitting}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 2.5: WEEKLY SALE & REDEMPTION CLUB (Mobile-First)   */}
        {/* ========================================================= */}
        {stage === FunnelStage.WEEKLY_CLUB && wonCoupon && (
          <div className="flex-1 flex flex-col justify-start py-2 animate-in fade-in zoom-in-95 duration-200">
            <WeeklySaleClubStep
              campaign={campaign}
              coupon={wonCoupon}
              onContinue={() => setStage(FunnelStage.COUPON)}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 3: DIGITAL COUPON + STORE VISIT + SHARING            */}
        {/* ========================================================= */}
        {stage === FunnelStage.COUPON && wonCoupon && (
          <div className="flex-1 flex flex-col justify-start space-y-3 py-2 animate-in fade-in zoom-in-95 duration-300">
            {alreadyPlayedNotice && (
              <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500 text-amber-200 text-xs font-semibold text-center">
                ℹ️ {alreadyPlayedNotice} (आपका पूर्व-सत्यापित कूपन नीचे उपलब्ध है)
              </div>
            )}
            <CouponCard
              coupon={wonCoupon}
              campaign={campaign}
              onOpenDashboard={() => setStage(FunnelStage.DASHBOARD)}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 4: PERSISTENT CUSTOMER ACCOUNT & WALLET DASHBOARD   */}
        {/* ========================================================= */}
        {stage === FunnelStage.DASHBOARD && wonCoupon && (
          <div className="flex-1 flex flex-col justify-start space-y-3 py-2 animate-in fade-in zoom-in-95 duration-300">
            <CustomerDashboard
              campaign={campaign}
              coupon={wonCoupon}
              customer={wonCoupon.customer}
              onLogout={() => {
                setWonCoupon(null);
                setWonPrize(null);
                setStage(FunnelStage.LOGO_INTRO);
              }}
            />
          </div>
        )}
      </div>

      {/* Expandable Bottom Sheet for Rules & Store Info */}
      <OfferRulesSheet
        isOpen={showRulesSheet}
        onClose={() => setShowRulesSheet(false)}
        campaign={campaign}
      />
    </div>
  );
}
